import DayCard from "./DayCard";

export default function OptionPanel({ id, isActive, days = [], labelledById, favorites, onToggleFavorite }) {
  if (!isActive) return null;
  return (
    <div id={id} role="tabpanel" aria-labelledby={labelledById} className="option-panel">
      <div className="days-grid">
        {days.map((d, i) => (
          <DayCard
            key={`${d.date}-${i}`}
            date={d.date}
            items={d.items}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
