export default function Tabs({ active, onChange }) {
  const tabs = ["D", "E", "F"];

  function handleKeyDown(e, idx) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + delta + tabs.length) % tabs.length;
      onChange(tabs[next]);
      document.getElementById(`tab-${tabs[next]}`)?.focus();
    }
  }

  return (
    <div role="tablist" aria-label="Schedule options" className="tabs">
      {tabs.map((t, i) => {
        const selected = active === t;
        return (
          <button
            key={t}
            id={`tab-${t}`}
            className={`tab${selected ? ` tab--active tab--active-${t}` : ""}`}
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${t}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            Option {t}
          </button>
        );
      })}
    </div>
  );
}
