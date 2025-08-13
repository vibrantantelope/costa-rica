import AnimatedBackground from "./AnimatedBackground";

export default function ExpectationsPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Expectations & House Rules</h1>
        <ol>
          <li>Have fun</li>
          <li>Always bring a buddy</li>
          <li>Don’t get in trouble</li>
        </ol>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </>
  );
}

