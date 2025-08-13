import AnimatedBackground from "./AnimatedBackground";

export default function LandingPage({ onEnter, onShowTips, onShowRules }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Costa Rica Trip 2025</h1>
        <p className="site-subtitle">
          So excited for this trip together! To make sure we all have a great time, we've put together this website with the activity schedule we sent to the concierge, tips and coordination information, and rules and expectations of us some items to help our group have a great time!
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
