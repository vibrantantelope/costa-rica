import { useEffect, useMemo, useState } from "react";
import AnimatedBackground from "./AnimatedBackground";
import { schedule } from "../data/schedule";
import { detectDeposit } from "../data/deposits";

// 👉 Set these:
const VENMO_USER = "John-Kenny-16"; 
// Google Apps Script Web App URL 
const SUBMIT_ENDPOINT = "https://cr-form-proxy.costaricaform.workers.dev";
// Public CSV of the roster sheet
const ROSTER_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-DYvrR3GHNdhO129OGX7ba1Gg4YdBzZf1aB6_yvQewqinyCcM_J3Gf8AahziTqGaknPPGHxR47dUz/pub?output=csv";

function venmoUrl(amount, note) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "friends",
    recipients: VENMO_USER,
    amount: (amount || 0).toFixed(2),
    note
  });
  return `https://venmo.com/?${params.toString()}`;
}

function parseCSV(text) {
  // tiny CSV parser; assumes no quoted commas
  const rows = text.trim().split(/\r?\n/).map(r => r.split(","));
  const [head, ...rest] = rows;
  return rest.map(r => Object.fromEntries(r.map((v,i)=>[head[i], v])));
}

export default function SignupPage({ onBack }) {
  // user info
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // selections: Map<key, {date, itemName, depositLabel, depositAmount}>
  const [selected, setSelected] = useState(new Map());

  // loading + roster
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState([]);

  // build a flat list of selectable items from schedule
  const items = useMemo(() => {
    const out = [];
    for (const day of schedule) {
      for (const it of day.items) {
        // Only show things that look like an activity; skip vague lines if you want
        // Here we include all, but you can skip “Arrival/Departure/Open” lines:
        if (/arrival|departure/i.test(it.name)) continue;

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
      if (next.has(item.key)) {
        next.delete(item.key);
      } else {
        next.set(item.key, item);
      }
      return next;
    });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!name || !email) { alert("Please enter your name and email."); return; }
    if (selected.size === 0) { alert("Please select at least one activity."); return; }

    const payload = {
      name, email, phone,
      total,
      selections: Array.from(selected.values()).map(s => ({
        date: s.date,
        activity: s.name,
        depositLabel: s.depositLabel,
        depositAmount: s.depositAmount
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
      if (!res.ok) throw new Error(await res.text());
      const { ok, message } = await res.json().catch(() => ({ ok: true, message: "Saved" }));
      alert(ok ? "Thanks! Your selections were recorded." : (message || "Saved"));
      // Optionally open Venmo after submit:
      window.open(venmoUrl(total, `CR Trip deposit — ${name}`), "_blank");
      // clear selections if you want
      // setSelected(new Map());
    } catch (err) {
      console.error(err);
      alert("Sorry, we could not submit your form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    // Load roster from the published CSV (name, date, activity columns)
    (async () => {
      try {
        const res = await fetch(ROSTER_CSV_URL);
        if (res.ok) {
          const text = await res.text();
          const rows = parseCSV(text);
          setRoster(rows);
        }
      } catch {}
    })();
  }, []);

  // group roster by date → activity
  const rosterByDay = useMemo(() => {
    const m = new Map();
    for (const row of roster) {
      const date = row.date || row.Date || row.DATE || "Unknown";
      const act  = row.activity || row.Activity || row.ACTIVITY || "";
      const who  = row.name || row.Name || row.NAME || "";
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
              <a className="btn btn--primary" href={venmoUrl(total, "CR Trip deposit")} target="_blank" rel="noreferrer">
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
                              onChange={() => toggleItem({
                                key,
                                date: day.date,
                                name: it.name,
                                depositLabel: dep?.label || "TBD",
                                depositAmount: dep?.amount ?? 0
                              })}
                              style={{ marginRight: 10, marginTop: 2 }}
                            />
                            <span className="day__item-name">{it.name}</span>
                          </div>
                          <div className="day__item-preferred">
                            Deposit: {dep ? `$${dep.amount}` : "TBD"}
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
                <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
                <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <input className="input" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
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
                  href={venmoUrl(total, `CR Trip deposit — ${name || "Guest"}`)}
                  target="_blank" rel="noreferrer"
                >
                  Venmo ${total.toFixed(2)}
                </a>
                <button className="btn btn--rules" type="submit" disabled={submitting}>
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
