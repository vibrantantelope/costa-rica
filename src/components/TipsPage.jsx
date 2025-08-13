import AnimatedBackground from "./AnimatedBackground";

export default function TipsPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">General Tips & Coordination</h1>
        <p>Key info to make the week smooth, safe, and easy to coordinate.</p>

        {/* TRANSPORTATION */}
        <section style={{ marginTop: "2rem", textAlign: "left", maxWidth: "800px" }}>
          <h2>Transportation</h2>
          <p>
            <strong>Arrival Shuttle (8/30):</strong> One shuttle will pick up the
            full group from SJO and depart <em>after the last flight lands</em>.
            Cost is <strong>$27 per person</strong> (have small bills).
          </p>
          <p>
            <strong>Early Arrivals:</strong> If you’re in San José before 8/30,
            we’ll post the meetup spot and time in the chat once the shuttle is scheduled.
          </p>
          <p>
            <strong>Share Flight Details:</strong> Post airline + flight # + ETA in
            the group chat to help the shuttle coordinator track arrivals.
          </p>
          <p>
            <strong>Backup Plan:</strong> If delayed or separated, share your live
            location in the chat and head to the posted meeting point.
          </p>
          <p>
            <strong>Local Rides:</strong> In town, use official taxis, rideshare, or
            pre-arranged shuttles. Avoid walking alone at night on unlit roads.
          </p>
          <p>
            <strong>Navigation:</strong> Download offline maps for Manuel Antonio /
            Quepos and save the villa pin in your map app.
          </p>
        </section>

        {/* MEALS */}
        <section style={{ marginTop: "2rem", textAlign: "left", maxWidth: "800px" }}>
          <h2>Meals</h2>
          <p>
            <strong>Breakfast &amp; Lunch:</strong> On your own or with your activity
            group. Many tours include a meal—check your confirmation.
          </p>
          <p>
            <strong>Dinner Plan:</strong> We’ll set up a daily{" "}
            <em>cook signup</em> once we arrive. The volunteer cook posts the planned
            meal; others can opt in. Costs split among participants.
          </p>
          <p>
            <strong>Chef Nights:</strong> Chef service is included (food cost extra).
            We’ll use the chef on <strong>8/30</strong> and one additional night (TBD).
          </p>
          <p>
            <strong>Grocery Run:</strong> We’ll coordinate an initial stock-up (water,
            snacks, breakfast/lunch basics) and track shared expenses.
          </p>
          <p>
            <strong>Dietary Notes:</strong> Please post any allergies or preferences in
            the chat so cooks can plan accordingly.
          </p>
        </section>

        {/* LOCATION NOTES */}
        <section style={{ marginTop: "2rem", textAlign: "left", maxWidth: "800px" }}>
          <h2>Location Notes — Casa de las Brisas (Manuel Antonio)</h2>
          <p>
            <strong>Villa Layout:</strong> Large, multi-level home with multiple pools,
            expansive decks, and jungle/ocean views. Be mindful on stairs and wet surfaces.
          </p>
          <p>
            <strong>Proximity:</strong> Short drive to beaches, town, and Manuel Antonio
            National Park. Plan rides for early park entries and evening dinners.
          </p>
          <p>
            <strong>Wildlife:</strong> Expect monkeys, iguanas, and birds—don’t leave
            food unattended on balconies; keep doors closed when not in use.
          </p>
          <p>
            <strong>Quiet Hours:</strong> Sound carries—please be considerate on decks
            and near bedrooms late at night/early morning.
          </p>
          <p>
            <strong>Concierge:</strong> Available for tours, transport, and on-the-spot
            help; ping the organizers to coordinate requests.
          </p>
          <p>
            <strong>Maps Link:</strong>{" "}
            <a
              href="https://maps.app.goo.gl/7hv1DHTUxeMLCNot8?g_st=a"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </p>
        </section>

        <button className="btn" style={{ marginTop: "2rem" }} onClick={onBack}>
          Back
        </button>
      </div>
    </>
  );
}

