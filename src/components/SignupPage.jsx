import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import { schedule } from "../data/schedule";
import { detectDeposit } from "../data/deposits";

// 👉 Set these:
const VENMO_USER = "John-Kenny-16";
// Proxy endpoint (Cloudflare Worker)
// Web App URL from Google Apps Script deployment
const SUBMIT_ENDPOINT = "https://cr-form-proxy.costaricaform.workers.dev";

// Published CSV of the roster sheet (same sheet your Apps Script writes to)
const ROSTER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-DYvrR3GHNdhO129OGX7ba1Gg4YdBzZf1aB6_yvQewqinyCcM_J3Gf8AahziTqGaknPPGHxR47dUz/pub?output=csv";

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

export default function SignupPage({ onBack }) {
  // user info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // selections: Map<key, {date, name, depositLabel, depositAmount}>
  const [selected, setSelected] = useState(new Map());

  // loading + roster
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState([]);

  // Build a flat list of selectable items from schedule (not strictly needed for rendering, but useful if you need it later)
  const items = useMemo(() => {
    const out = [];
    for (const day of schedule) {
      for (const it of day.items) {
        if (/arrival|departure|open|free/i.test(it.name)) continue;
        const dep = detectDeposit(it.name);
        out.push({
          key: `${day.date}::${it.name}`,
          date: day.date,
          name: it.name,
          depositLabel: dep?.label || "TBD",
          depositAmount: dep?.amount ?? 0,
        });
      }
    }
    return out;
  }, []);

  const total = useMemo(() => {
    let t = 0;
    for (const v of selected.values()) t += v.depositAmount || 0;
    return t;
  }, [selected]);

  function toggleItem(item) {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(item.key)) next.delete(item.key);
      else next.set(item.key, item);
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
      total,
      selections: Array.from(selected.values()).map(s => ({
        date: s.date,
        activity: s.name,
        depositLabel: s.depositLabel,
        depositAmount: s.depositAmount,
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
            total: String(payload.total),
            date: s.date,
            activity: s.activity,
            depositlabel: s.depositLabel,
            depositamount: String(s.depositAmount || 0),
          });
        });
        return updated;
      });

      // Force-fetch fresh roster CSV from Google (cache-bust)
      fetch(`${ROSTER_CSV_URL}&_=${Date.now()}`)
        .then(r => (r.ok ? r.text() : ""))
        .then(txt => {
          if (txt) setRoster(parseCSV(txt));
        })
        .catch(() => {});

      alert("Thanks! Your selections were recorded.");
      if (total > 0) {
        const note = `CR Trip deposit — ${name || "Guest"}`;
        window.open(venmoUrl(total, note), "_blank", "noopener");
      }
      // Optionally clear after submit:
      // setSelected(new Map());
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
      } catch {
        // ignore
      }
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
            <h1 className="site-title">Commit to Activities</h1>
            <p className="site-subtitle">
              Pick your activities, see deposits, and send your total via Venmo. Your selections will be shared with the concierge.
            </p>
          </div>
          <p className="site-explainer">
            Core items are reserved by popular demand; the rest are open to self-organize. Your spot is held once your deposit is received.
          </p>
          <div className="site-header__actions">
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
          {/* Column 1: Schedule + checkboxes */}
          <section className="info-card info-card--span4">
            <div className="kicker">Step 1</div>
            <h2 className="info-title">Choose Activities</h2>

            <div className="days-grid">
              {schedule.map(day => (
                <div className="day" key={day.date}>
                  <h3 className="day__title">{day.date}</h3>
                  <div className="day__list">
                    {day.items.map((it, idx) => {
                      // Keep Arrival/Departure as non-selectable info
                      if (/arrival|departure/i.test(it.name)) {
                        return (
                          <div key={idx} className="day__item">
                            <div className="day__item-main">
                              <span className="day__item-name">{it.name}</span>
                            </div>
                          </div>
                        );
                      }

                      const dep = detectDeposit(it.name);
                      const key = `${day.date}::${it.name}`;
                      const isSelected = selected.has(key);

                      return (
                        <label key={idx} className="day__item" style={{ cursor: "pointer" }}>
                          <div className="day__item-main" style={{ alignItems: "flex-start" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleItem({
                                  key,
                                  date: day.date,
                                  name: it.name,
                                  depositLabel: dep?.label || "TBD",
                                  depositAmount: dep?.amount ?? 0,
                                })
                              }
                              style={{ marginRight: 10, marginTop: 2 }}
                            />
                            <span className="day__item-name">{it.name}</span>
                          </div>
                          <div className="day__item-preferred">
                            Deposit: {dep && dep.amount ? `$${dep.amount}` : "TBD"}
                          </div>
                        </label>
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
                  <span className="time-pill">Total ${total.toFixed(2)}</span>
                </div>
                <div className="day__item-preferred">
                  {selected.size === 0 ? (
                    <em>No selections yet.</em>
                  ) : (
                    Array.from(selected.values()).map((s, i) => (
                      <div key={i} style={{ marginTop: 6 }}>
                        <strong>{s.date}</strong> — {s.name}
                        <span style={{ marginLeft: 8, color: "var(--muted)" }}>
                          {s.depositLabel}: {s.depositAmount ? `$${s.depositAmount}` : "TBD"}
                        </span>
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
                            <span className="signup-count">
                              (People Signed up = {people.length})
                            </span>
                          </div>
                          {people.length > 0 && (
                            <div className="day__item-preferred roster-names">
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
