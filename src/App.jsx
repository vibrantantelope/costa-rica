import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AnimatedBackground from "./components/AnimatedBackground";
import OptionPanel from "./components/OptionPanel";
import LandingPage from "./components/LandingPage";
import TipsPage from "./components/TipsPage";
import RulesPage from "./components/RulesPage";
import { schedule } from "./data/schedule";
import { timeGuess } from "./utils/time";

export default function App() {
  const [page, setPage] = useState("landing");
  const [prevPage, setPrevPage] = useState(null);
  const [compact, setCompact] = useState(false);
  const [q, setQ] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(true);
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("cr-favs") || "[]")); }
    catch { return new Set(); }
  });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    document.body.classList.toggle("compact", compact);
  }, [compact]);

  useEffect(() => {
    localStorage.setItem("cr-favs", JSON.stringify([...favs]));
  }, [favs]);

  function toggleFav(name){
    setFavs(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const filteredDays = useMemo(() => {
    const days = schedule || [];
    const qq = q.toLowerCase();

    const applySearch = (it) =>
      !qq || it.name.toLowerCase().includes(qq) || timeGuess(it.name).toLowerCase().includes(qq);

    const applyFav = (it) => !favOnly || favs.has(it.name);

    return days
      .map(d => ({ ...d, items: d.items.filter(it => applySearch(it) && applyFav(it)) }))
      .filter(d => d.items.length > 0);
  }, [q, favOnly, favs]);

  const favCount = favs.size;
  
  const navigate = (p) => {
    setPrevPage(page);
    setPage(p);
  };

  let pageContent;

  if (page === "landing") {
    pageContent = (
      <LandingPage
        onEnter={() => setPage("main")}
        onShowTips={() => navigate("tips")}
        onShowRules={() => navigate("rules")}
      />
    );
  } else if (page === "tips") {
    pageContent = <TipsPage onBack={() => setPage(prevPage || "landing")} />;
  } else if (page === "rules") {
    pageContent = <RulesPage onBack={() => setPage(prevPage || "landing")} />;
  } else {
    pageContent = (
      <div className="page page--schedule">
        <AnimatedBackground />
        <div className="container">
        <header className={`site-header ${isHeaderOpen ? "" : "collapsed"}`}>
          <div className="site-header__titles">
            <h1 className="site-title">Costa Rica Trip 2025</h1>
            <p className="site-subtitle">
              So excited for this trip together! This schedule was built from everyone's responses to the activity planning sheet.
            </p>
          </div>

          <p className="site-explainer">
            We scheduled a few <strong>Core activities</strong> by popular demand and left the rest as <strong>Open time</strong> for you
            to book (or chill) individually. We’ve shared both the Core picks and other possibilities with the concierge.
          </p>

          {/* Organized actions: utilities on the left, nav on the right */}
          <div className="site-header__actions">
            <div className="actions__group">
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

            <div className="actions__group">
              <div className="legend">
                <span className="tag tag--core">Core</span>
                <span className="tag tag--open">Open</span>
                <span className="tag tag--optional">Optional</span>
                <span className="tag tag--depart">Departure</span>
              </div>
              <button className="btn btn--home" onClick={() => navigate("landing")}>🏠 Home</button>
              <button className="btn" onClick={() => navigate("tips")}>🌴 Tips & Coordination</button>
              <button className="btn" onClick={() => navigate("rules")}>🛡️ Expectations & Rules</button>
            </div>
          </div>

          <button
            className="header-toggle"
            onClick={() => setHeaderOpen(o => !o)}
            aria-expanded={isHeaderOpen}
          >
            {isHeaderOpen ? "Hide" : "Show"} Info
          </button>
        </header>

        <OptionPanel
          id="panel-schedule"
          isActive={true}
          days={filteredDays}
          favorites={favs}
          onToggleFavorite={toggleFav}
        />
      </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {pageContent}
      </motion.div>
    </AnimatePresence>
  );
}
