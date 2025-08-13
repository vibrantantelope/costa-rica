import AnimatedBackground from "./AnimatedBackground";

export default function RulesPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Expectations & House Rules</h1>
        <ul>
          <li>Have fun</li>
          <li>Bring a buddy</li>
          <li>Don't get in trouble.</li>
        </ul>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </>
  );
}
