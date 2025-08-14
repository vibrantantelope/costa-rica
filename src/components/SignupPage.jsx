import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import { schedule } from "../data/schedule";
import {
  matchActivityMeta,
  getDepositInfo,
  getFullPriceInfo,
  detectDeposit // kept for backwards compatibility
} from "../data/deposits";

// 👉 Set these:
const VENMO_USER = "John-Kenny-16";
// Cloudflare Worker proxy → Apps Script
const SUBMIT_ENDPOINT = "https://cr-form-proxy.costaricaform.workers.dev";
// Published CSV (roster)
const ROSTER_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-DYvrR3GHNdhO129OGX7ba1Gg4YdBzZf1aB6_yvQewqinyCcM_J3Gf8AahziTqGaknPPGHxR47dUz/pub?output=csv";

function venmoUrl(amount, note) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "friends",
    recipients: VENMO_USER,
    amount: (amount || 0).toFixed(2),
    note,
  });
  return `https://venmo.com/?${params.toString()}`;
}

// Tiny CSV parser; normalizes headers to lowercase keys
function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).map(r => r.split(","));
  if (rows.length === 0) return [];
  const [head, ...rest] = rows;
  const normHead = head.map(h => String(h || "").trim().toLowerCase());
  return rest.map(r => {
    const obj = {};
    r.forEach((v, i) => (obj[normHead[i] || `col${i}`] = v));
    return obj;
  });
}

/** Small inline components ************************************************************/

function Badge({ children, tone = "info" }) {
  const bg =
    tone === "ok" ? "var(--ok-25)" :
    tone === "warn" ? "var(--warn-25)" :
    "var(--primary-10)";
  const color =
    tone === "ok" ? "var(--ok-600)" :
    tone === "warn" ? "var(--warn-700)" :
    "var(--primary-700)";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      background: bg,
      color
    }}>{children}</span>
  );
}

function VariantPicker({ meta, value, onChange }) {
  if (!meta?.variants || meta.variants.length === 0) return null;
  return (
    <select
      className="input"
      value={value || meta.defaultVariantId || meta.variants[0]?.id}
      onChange={e => onChange(e.target.value)}
      style={{ width: "auto", paddingRight: 28 }}
    >
      {meta.variants.map(v => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  );
}

function PriceLine({ fullPriceLabel, depositLabel }) {
  return (
    <div className="day__item-preferred" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <span><strong>Total per person:</strong> {fullPriceLabel}</span>
      <span><strong>Deposit:</strong> {depositLabel}</span>
    </div>
  );
}

/** Main Page *************************************************************************/

export default function SignupPage({ onBack }) {
  // user info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // per-item UI state: chosen variant for items that have one
  // Map<itemKey, variantId>
  const [variantChoice, setVariantChoice] = useState(new Map());

  // selections: Map<key, {date, name, variantId, deposit, fullPrice, labels..., reservationBacked}>
  const [selected, setSelected] = useState(new Map());

  // loading + roster
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState([]);

  // compute total deposit
  const total = useMemo(() => {
    let t = 0;
    for (const v of selected.values()) t += v.depositAmount || 0;
    return t;
  }, [selected]);

  function toggleItem(day, it) {
    const key = `${day.date}::${it.name}`;
    const meta = matchActivityMeta(it.name);
    const vId = variantChoice.get(key) || meta?.defaultVariantId || meta?.variants?.[0]?.id || null;

    const { depositAmount, depositLabel } = getDepositInfo(meta, vId);
    const { fullPriceAmount, fullPriceLabel } = getFullPriceInfo(meta, vId);

    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, {
          key,
          date: day.date,
          name: it.name,
          variantId: vId,
          depositAmount,
          depositLabel,
          fullPriceAmount,
          fullPriceLabel,
          reservationBacked: !!meta?.reservationBacked,
        });
      }
      return next;
    });
  }

  function updateVariant(day, it, newVariantId) {
    const key = `${day.date}::${it.name}`;
    setVariantChoice(prev => {
      const copy = new Map(prev);
      copy.set(key, newVariantId);
      return copy;
    });

    // If currently selected, refresh its pricing with the new variant
    setSelected(prev => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      const meta = matchActivityMeta(it.name);
      const { depositAmount, depositLabel } = getDepositInfo(meta, newVariantId);
      const { fullPriceAmount, fullPriceLabel } = getFullPriceInfo(meta, newVariantId);
      const curr = next.get(key);
      next.set(key, { ...curr, variantId: newVariantId, depositAmount, depositLabel, fullPriceAmount, fullPriceLabel });
      return next;
    });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }
    if (selected.size === 0) {
      alert("Please select at least one activity.");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      totalDeposit: total,
      selections: Array.from(selected.values()).map(s => ({
        date: s.date,
        activity: s.name,
        variantId: s.variantId || null,
        fullPriceLabel: s.fullPriceLabel,
        depositLabel: s.depositLabel,
        depositAmount: s.depositAmount,
        reservationBacked: !!s.reservationBacked,
      })),
      ts: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Submit failed");
      }

      // Instant local roster update so submitter sees themselves immediately
      setRoster(prev => {
        const updated = [...prev];
        payload.selections.forEach(s => {
          updated.push({
            timestamp: payload.ts,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            total: String(payload.totalDeposit),
            date: s.date,
            activity: s.activity + (s.variantId ? ` (${s.variantId})` : ""),
            depositlabel: s.depositLabel,
            depositamount: String(s.depositAmount || 0),
          });
        });
        return updated;
      });

      // Force-fetch fresh roster CSV from Google (cache-bust)
      fetch(`${ROSTER_CSV_URL}&_=${Date.now()}`)
        .then(r => (r.ok ? r.text() : ""))
        .then(txt => { if (txt) setRoster(parseCSV(txt)); })
        .catch(() => {});

      alert("Thanks! Your selections were recorded.");
      if (total > 0) {
        const note = `CR Trip deposit — ${name || "Guest"}`;
        window.open(venmoUrl(total, note), "_blank", "noopener");
      }
    } catch (err) {
      console.error(err);
      alert("Sorry, we could not submit your form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(ROSTER_CSV_URL + `&cb=${Date.now()}`);
        if (res.ok) {
          const text = await res.text();
          const rows = parseCSV(text);
          setRoster(rows);
        }
      } catch {/* ignore */}
    })();
  }, []);

  // group roster by date → activity
  const rosterByDay = useMemo(() => {
    const m = new Map();
    for (const row of roster) {
      const date = row.date || "Unknown";
      const act = row.activity || "";
      const who = row.name || "";
      if (!m.has(date)) m.set(date, new Map());
      const inner = m.get(date);
      if (!inner.has(act)) inner.set(act, []);
      inner.get(act).push(who);
    }
    return m;
  }, [roster]);

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        {/* Header */}
        <header className="site-header" style={{ position: "static", margin: "0 0 18px" }}>
          <div className="site-header__titles">
            <h1 className="site-title">Activity Sign-Ups & Deposits</h1>
            <p className="site-subtitle">
              We built a schedule that locks in the <strong>core activities most of us want</strong> while leaving plenty of open time to make the trip your own.
            </p>
          </div>

          <div className="site-explainer" style={{ marginTop: 8, lineHeight: 1.5 }}>
            If you pick one of the <strong>Open/Optional small-group items we’re reserving now</strong> (below), we’ll include it in our concierge reservation and collect a deposit here.
            For other non-core ideas, we can <strong>share contact info</strong> so you can self-book—or tell us and we’ll see if we can add it.
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="ok">Reservation-backed optional items: Mangrove • Waterfall Rappelling • Surf Lessons • Jungle Tubing</Badge>
          </div>

          <div className="site-header__actions" style={{ marginTop: 12 }}>
            <div className="actions__group">
              <button className="btn btn--rules" onClick={onBack}>Back</button>
              <a
                className="btn btn--primary"
                aria-disabled={total <= 0}
                onClick={e => {
                  if (total <= 0) { e.preventDefault(); return; }
                  const note = `CR Trip deposit — ${name || "Guest"}`;
                  window.open(venmoUrl(total, note), "_blank", "noopener");
                }}
                href={total > 0 ? venmoUrl(total, `CR Trip deposit — ${name || "Guest"}`) : undefined}
                target="_blank"
                rel="noreferrer noopener"
              >
                Venmo Total (${total.toFixed(2)})
              </a>
            </div>
          </div>
        </header>

        {/* 3-column layout */}
        <div className="info-grid">
          {/* Column 1: Schedule + selections with pricing */}
          <section className="info-card info-card--span4">
            <div className="kicker">Step 1</div>
            <h2 className="info-title">Choose Activities</h2>

            <div className="days-grid">
              {schedule.map(day => (
                <div className="day" key={day.date}>
                  <h3 className="day__title">{day.date}</h3>
                  <div className="day__list">
                    {day.items.map((it, idx) => {
                      const key = `${day.date}::${it.name}`;
                      const meta = matchActivityMeta(it.name);
                      const vId =
                        variantChoice.get(key) ||
                        meta?.defaultVariantId ||
                        meta?.variants?.[0]?.id ||
                        null;

                      // non-selectable arrival/departure
                      if (/arrival|departure/i.test(it.name)) {
                        return (
                          <div key={idx} className="day__item">
                            <div className="day__item-main">
                              <span className="day__item-name">{it.name}</span>
                            </div>
                          </div>
                        );
                      }

                      const isSelected = selected.has(key);
                      const { depositLabel } = getDepositInfo(meta, vId);
                      const { fullPriceLabel } = getFullPriceInfo(meta, vId);

                      return (
                        <div key={idx} className="day__item" style={{ gap: 8 }}>
                          <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItem(day, it)}
                              style={{ marginRight: 10, marginTop: 2 }}
                              aria-label={`Select ${it.name}`}
                            />
                            <div>
                              <span className="day__item-name">{it.name}</span>{" "}
                              {meta?.reservationBacked ? (
                                <Badge tone="ok">We’ll reserve this</Badge>
                              ) : (
                                <Badge>Self-book or ask us</Badge>
                              )}
                              {meta?.variants?.length ? (
                                <div style={{ marginTop: 6 }}>
                                  <VariantPicker
                                    meta={meta}
                                    value={vId}
                                    onChange={(nv) => updateVariant(day, it, nv)}
                                  />
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <PriceLine fullPriceLabel={fullPriceLabel} depositLabel={depositLabel} />

                          {meta?.depositRange && (
                            <div className="muted" style={{ fontSize: 12 }}>
                              Note: This tour’s deposit varies by operator ({`$${meta.depositRange[0]}–$${meta.depositRange[1]}`}).
                              We’re using the lower amount now; if needed, we’ll adjust the difference after confirmation.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Column 2: Your info + totals */}
          <section className="info-card info-card--span4">
            <div className="kicker">Step 2</div>
            <h2 className="info-title">Your Info & Deposits</h2>

            <form onSubmit={submitForm}>
              <div className="toolbar" style={{ marginTop: 0 }}>
                <input
                  className="input"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <input
                  className="input"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  className="input"
                  placeholder="Phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="day__item" style={{ marginTop: 8 }}>
                <div className="day__item-main">
                  <span className="day__item-name">Selected Activities</span>
                  <span className="time-pill">Deposit Total ${total.toFixed(2)}</span>
                </div>
                <div className="day__item-preferred">
                  {selected.size === 0 ? (
                    <em>No selections yet.</em>
                  ) : (
                    Array.from(selected.values()).map((s, i) => (
                      <div key={i} style={{ marginTop: 6 }}>
                        <strong>{s.date}</strong> — {s.name}
                        {s.variantId ? ` (${s.variantId})` : ""} — {s.fullPriceLabel}
                        <span style={{ marginLeft: 8, color: "var(--muted)" }}>
                          Deposit: {s.depositLabel}
                        </span>{" "}
                        {s.reservationBacked ? <Badge tone="ok">Reserved</Badge> : <Badge>Self-book</Badge>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="btn-row">
                <a
                  className="btn btn--primary"
                  aria-disabled={total <= 0}
                  onClick={e => {
                    if (total <= 0) { e.preventDefault(); return; }
                    const note = `CR Trip deposit — ${name || "Guest"}`;
                    window.open(venmoUrl(total, note), "_blank", "noopener");
                  }}
                  href={total > 0 ? venmoUrl(total, `CR Trip deposit — ${name || "Guest"}`) : undefined}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Venmo ${total.toFixed(2)}
                </a>
                <button className="btn btn--rules" type="submit" disabled={submitting || selected.size === 0}>
                  {submitting ? "Submitting…" : "Submit Selections"}
                </button>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>
                By submitting, you agree that your spot is held once deposit is received. Some tours may have stricter cancellation terms.
              </p>
            </form>
          </section>

          {/* Column 3: Live roster */}
          <section className="info-card info-card--span4">
            <div className="kicker">Roster</div>
            <h2 className="info-title">Who’s Signed Up</h2>

            {schedule.map(day => {
              const byActivity = rosterByDay.get(day.date);
              return (
                <div className="day" key={day.date}>
                  <h3 className="day__title">{day.date}</h3>
                  <div className="day__list">
                    {day.items.map((it, idx) => {
                      const people = byActivity?.get(it.name) || [];
                      return (
                        <div key={idx} className="day__item">
                          <div className="day__item-main">
                            <span className="day__item-name">{it.name}</span>
                            <span className="badge">{people.length}</span>
                          </div>
                          {people.length > 0 && (
                            <div className="day__item-preferred" style={{ fontSize: 12 }}>
                              {people.join(", ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </>
  );
}
