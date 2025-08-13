import AnimatedBackground from "./AnimatedBackground";

export default function LandingPage({ onEnter }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Costa Rica Trip — Schedule</h1>
        <p className="site-subtitle">
          Bright, simple, and beachy ☀️🌴 Built from everyone's spreadsheet responses to help plan our week in paradise!
        </p>
        <p className="site-explainer">
          These schedules were generated from everyone's activity preferences and are offered in three tabbed options.
        </p>
        <button className="btn btn--primary" onClick={onEnter}>Enter</button>
      </div>
    </>
  );
}
