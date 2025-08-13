import AnimatedBackground from "./AnimatedBackground";

export default function TipsPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">General Tips & Coordination</h1>
        <p>Key info to make the week smooth, safe, and easy to coordinate.</p>

        {/* TRANSPORTATION */}
        <section>
          <h2>Transportation</h2>
          <ul>
            <li>
              <strong>Arrival Shuttle (8/30):</strong> One shuttle will pick up
              the full group from SJO and depart <em>after the last flight
              lands</em>. Cost is <strong>$27 per person</strong> (have small bills).
            </li>
            <li>
              <strong>Early Arrivals:</strong> If you’re in San José before 8/30,
              we’ll post the meetup spot and time in the chat once the shuttle is scheduled.
            </li>
            <li>
              <strong>Share Flight Details:</strong> Post airline + flight # +
              ETA in the group chat to help the shuttle coordinator track arrivals.
            </li>
            <li>
              <strong>Backup Plan:</strong> If delayed or separated, share your live
              location in the chat and head to the posted meeting point.
            </li>
            <li>
              <strong>Local Rides:</strong> In town, use official taxis, rideshare,
              or pre-arranged shuttles. Avoid walking alone at night on unlit roads.
            </li>
            <li>
              <strong>Navigation:</strong> Download offline maps for Manuel Antonio /
              Quepos and save the villa pin in your map app.
            </li>
          </ul>
        </section>

        {/* MEALS */}
        <section>
          <h2>Meals</h2>
          <ul>
            <li>
              <strong>Breakfast &amp; Lunch:</strong> On your own or with your activity group.
              Many tours include a meal—check your confirmation.
            </li>
            <li>
              <strong>Dinner Plan:</strong> We’ll set up a daily{" "}
              <em>cook signup</em> once we arrive. The volunteer cook posts the
              planned meal; others can opt in. Costs split among participants.
            </li>
            <li>
              <strong>Chef Nights:</strong> Chef service is included (food cost extra).
              We’ll use the chef on <strong>8/30</strong> and one additional night (TBD).
            </li>
            <li>
              <strong>Grocery Run:</strong> We’ll coordinate an initial stock-up
              (water, snacks, breakfast/lunch basics) and track shared expenses.
            </li>
            <li>
              <strong>Dietary Notes:</strong> Please post any allergies or preferences
              in the chat so cooks can plan accordingly.
            </li>
          </ul>
        </section>

        {/* LOCATION NOTES */}
        <section>
          <h2>Location Notes — Casa de las Brisas (Manuel Antonio)</h2>
          <ul>
            <li>
              <strong>Villa Layout:</strong> Large, multi-level home with multiple pools,
              expansive decks, and jungle/ocean views. Be mindful on stairs and wet surfaces.
            </li>
            <li>
              <strong>Proximity:</strong> Short drive to beaches, town, and Manuel Antonio
              National Park. Plan rides for early park entries and evening dinners.
            </li>
            <li>
              <strong>Wildlife:</strong> Expect monkeys, iguanas, and birds—don’t leave food
              unattended on balconies; keep doors closed when not in use.
            </li>
            <li>
              <strong>Quiet Hours:</strong> Sound carries—please be considerate on decks and
              near bedrooms late at night/early morning.
            </li>
            <li>
              <strong>Concierge:</strong> Available for tours, transport, and on-the-spot help;
              ping the organizers to coordinate requests.
            </li>
            <li>
              <strong>Maps Link:</strong>{" "}
              <a
                href="https://maps.app.goo.gl/7hv1DHTUxeMLCNot8?g_st=a"
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </li>
          </ul>
        </section>

        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </>
  );
}
