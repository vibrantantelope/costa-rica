import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AnimatedBackground from "./components/AnimatedBackground";
import Tabs from "./components/Tabs";
import OptionPanel from "./components/OptionPanel";
import LandingPage from "./components/LandingPage";
import TipsPage from "./components/TipsPage";
import RulesPage from "./components/RulesPage";
import { D, E, F } from "./data/options";
import { timeGuess } from "./utils/time";

export default function App() {
  const [page, setPage] = useState("landing");
  const [active, setActive] = useState("F");
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(true);
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("cr-favs") || "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => {
    document.body.classList.toggle("compact", compact);
  }, [compact]);

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
  
  if (page === "landing") {
    return <LandingPage onEnter={() => setPage("main")} onShowTips={() => setPage("tips")} onShowRules={() => setPage("rules")} />;
  }

  if (page === "tips") {
    return <TipsPage onBack={() => setPage("landing")} />;
  }

  if (page === "rules") {
    return <RulesPage onBack={() => setPage("landing")} />;
  }

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <header className={`site-header ${isHeaderOpen ? "" : "collapsed"}`}>
          <div className="site-header__titles">
            <h1 className="site-title">Costa Rica Trip 2025</h1>
            <p className="site-subtitle">
              So excited for this trip together! These schedules were built from everyone's responses to the activity planning sheet.
            </p>
          </div>
          <p className="site-explainer">
            These schedules were generated from everyone's activity preferences and are offered in three tabbed options.
          </p>
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
          <button
            className="header-toggle"
            onClick={() => setHeaderOpen(o => !o)}
            aria-expanded={isHeaderOpen}
          >
            {isHeaderOpen ? "Hide" : "Show"} Info
          </button>
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
    </>
  );
}
