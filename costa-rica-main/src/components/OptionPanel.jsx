import React from "react";

export default function OptionPanel({
  id,
  isActive,
  days = [],
  favorites = new Set(),
  onToggleFavorite = () => {},
}) {
  if (!isActive) return null;

  return (
    <section id={id}>
      <div className="days-grid">
        {days.map((day) => (
          <div className="day" key={day.date}>
            <h3 className="day__title">{day.date}</h3>

            {/* Using a div list to avoid bullets entirely */}
            <div className="day__list">
              {day.items.map((it, idx) => {
                const faved = favorites.has(it.name);
                return (
                  <div
                    key={idx}
                    className={`day__item ${faved ? "faved" : ""}`}
                    // Make long lines wrap nicely and respect any line breaks you might add later
                    style={{ wordBreak: "break-word" }}
                  >
                    <div
                      className="day__item-main"
                      style={{ alignItems: "flex-start" }}
                    >
                      {/* EXACT text from schedule.js */}
                      <span
                        className="day__item-name"
                        style={{ fontWeight: 700, whiteSpace: "pre-wrap" }}
                      >
                        {it.name}
                      </span>

                      {/* Tiny favorite toggle (keeps your existing filtering working) */}
                      <button
                        className="fav"
                        aria-pressed={faved}
                        onClick={() => onToggleFavorite(it.name)}
                        title={faved ? "Remove favorite" : "Add favorite"}
                      >
                        {faved ? "❤" : "♡"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
