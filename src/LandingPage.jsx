import React from "react";

export default function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <h1>Costa Rica Trip Schedule</h1>
      <p>
        These schedules were generated from everyone's spreadsheet responses to
        help us coordinate activities and plan our week in paradise.
      </p>
      <button className="btn btn--primary" onClick={onEnter}>
        Enter
      </button>
    </div>
  );
}
