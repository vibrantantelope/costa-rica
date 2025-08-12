import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Tabs from "./components/Tabs";
import OptionPanel from "./components/OptionPanel";
import { D, E, F } from "./data/options";
import { timeGuess } from "./utils/time";

export default function App() {
  const [active, setActive] = useState("F");
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("cr-favs") || "[]")); }
    catch { return new Set(); }
  });

    useEffect(() => {
      document.body.classList.toggle("compact", compact);
    }, [compact]);

    useEffect(() => {
      const cls = `theme-${active}`;
      document.body.classList.add(cls);
      return () => document.body.classList.remove(cls);
    }, [active]);

    useEffect(() => {
      localStorage.setItem("cr-favs", JSON.stringify([...favs]));
    }, [favs]);

  const dataMap = { D, E, F };

  function toggleFav(name){
    setFavs(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const filteredDays = useMemo(() => {
    const days = dataMap[active] || [];
    const qq = q.toLowerCase();

    const applySearch = (it) =>
      !qq || it.name.toLowerCase().includes(qq) || timeGuess(it.name).toLowerCase().includes(qq);

    const applyFav = (it) => !favOnly || favs.has(it.name);

    return days
      .map(d => ({ ...d, items: d.items.filter(it => applySearch(it) && applyFav(it)) }))
      .filter(d => d.items.length > 0);
  }, [active, q, favOnly, favs]);

  const favCount = favs.size;

  return (
    <div className="container">
      <header className="site-header">
        <div className="site-header__titles">
          <h1 className="site-title">Costa Rica Trip — Schedule</h1>
          <p className="site-subtitle">Bright, simple, and beachy ☀️🌴 Built from everyone's spreadsheet responses to help plan our week in paradise!</p>
        </div>
        <div className="site-header__actions">
          <input
            className="input"
            placeholder="Search activities (catamaran, coffee, beach...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={() => setFavOnly(v => !v)} aria-pressed={favOnly}>
            {favOnly ? "Show All" : "Favorites Only"}
            <span className="badge">{favCount}</span>
          </button>
          <button className="btn" onClick={() => setCompact(c => !c)} aria-pressed={compact}>
            {compact ? "Normal Spacing" : "Compact Spacing"}
          </button>
          <button className="btn btn--primary" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      </header>

      <Tabs active={active} onChange={setActive} />

      <AnimatePresence mode="wait">
        <OptionPanel
          key={active}
          id={`panel-${active}`}
          labelledById={`tab-${active}`}
          isActive={true}
          days={filteredDays}
          favorites={favs}
          onToggleFavorite={toggleFav}
        />
      </AnimatePresence>
    </div>
  );
}
