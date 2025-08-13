import AnimatedBackground from "./AnimatedBackground";

export default function LandingPage({ onEnter, onShowTips, onShowRules }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Costa Rica Trip — Schedule</h1>
        <p className="site-subtitle">
          So excited for this trip together! These schedules were built from everyone's responses to the activity planning sheet.
        </p>
        <p className="site-explainer">
          These schedules were generated from everyone's activity preferences and are offered in three tabbed options.
        </p>
        <button className="btn btn--primary" onClick={onEnter}>Enter</button>
        <button className="btn btn--primary" onClick={onShowTips}>General Tips & Coordination</button>
        <button className="btn btn--primary" onClick={onShowRules}>Rules & Expectations</button>
      </div>
    </>
  );
}
