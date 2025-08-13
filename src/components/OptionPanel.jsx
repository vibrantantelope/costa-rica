import { motion as Motion } from "framer-motion";
import DayCard from "./DayCard";

export default function OptionPanel({ id, isActive, days = [], favorites, onToggleFavorite }) {
  if (!isActive) return null;
  return (
    <Motion.div
      id={id}
      className="option-panel"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
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
    </Motion.div>
  );
}
