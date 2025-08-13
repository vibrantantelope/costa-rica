import AnimatedBackground from "./AnimatedBackground";

export default function TipsPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">General Tips & Coordination</h1>
        <p>Use this space to share general trip tips and coordination notes.</p>
        <ul>
          <li>Placeholder tip one.</li>
          <li>Placeholder tip two.</li>
        </ul>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </>
  );
}
