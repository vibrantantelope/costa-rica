import AnimatedBackground from "./AnimatedBackground";

export default function LandingPage({ onEnter, onShowTips, onShowRules }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Costa Rica Trip 2025</h1>
        <p className="site-subtitle">
          So excited for this trip together! These schedules were built from everyone's responses to the activity planning sheet.
        </p>
        <p className="site-explainer">
          These schedules were generated from everyone's activity preferences and are offered in three tabbed options.
        </p>

        {/* New horizontal button row */}
        <div className="btn-row">
          <button className="btn btn--tips" onClick={onShowTips}>🌴 Tips & Coordination</button>
          <button className="btn btn--rules" onClick={onShowRules}>🛡️ Rules & Expectations</button>
          <button className="btn btn--schedule" onClick={onEnter}>🗓️ Activity Schedule</button>
        </div>
      </div>
    </>
  );
}
