import { Link } from "react-router-dom";
import { useGetEventsQuery } from "../../services/eventsApi";
import {
  Card,
  Section,
  clampText,
  formatDate,
  imageUrlFromFilename,
} from "../shared/ui";

function Hero() {
  return (
    <div
      style={{
        padding: "26px 18px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        background:
          "linear-gradient(180deg, rgba(16,185,129,0.10), rgba(22,34,38,1))",
        boxShadow: "var(--shadow)",
        marginBottom: 28,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.4 }}>
        Make impact with Unity
      </h1>
      <p
        style={{
          marginTop: 10,
          marginBottom: 16,
          color: "var(--text-muted)",
          maxWidth: 820,
        }}
      >
        Organizations publish nonprofit events. Volunteers join them. Together
        we turn good intentions into real-world action.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          to="/events"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(16,185,129,0.16)",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "var(--text-main)",
            fontWeight: 600,
          }}
        >
          Explore events
        </Link>
        <a
          href="#why"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          Why join
        </a>
      </div>
    </div>
  );
}

function EventsGrid({
  title,
  description,
  order,
}: {
  title: string;
  description: string;
  order: string;
}) {
  const { data, isLoading, isError } = useGetEventsQuery({
    page: 1,
    limit: 6,
    order,
  });

  return (
    <Section title={title} description={description}>
      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading…</div>
      ) : isError ? (
        <div style={{ color: "var(--danger)" }}>Failed to load events.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No events yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {data.map((event) => {
            const img = imageUrlFromFilename(event.eventImages?.[0]);
            return (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                style={{ display: "block" }}
              >
                <Card>
                  {img ? (
                    <div
                      style={{
                        height: 140,
                        borderRadius: "var(--radius-sm)",
                        backgroundImage: `url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "1px solid var(--border-color)",
                        marginBottom: 12,
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{event.eventTitle}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {formatDate(event.eventDate)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    {clampText(event.eventDesc, 110)}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--text-muted)",
                      fontSize: 13,
                    }}
                  >
                    <span>{event.eventLocation}</span>
                    <span>
                      <span style={{ color: "var(--secondary)" }}>
                        {event.eventLikes}
                      </span>{" "}
                      likes · {event.eventViews} views
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />

      <div id="why" />
      <Section
        title="Why volunteers and organizations join"
        description="A simple workflow: admin verifies orgs → orgs publish events → volunteers join → impact happens."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <Card>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              For volunteers
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              Find real nonprofit events, build experience, meet purpose-driven
              people, and create visible change.
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              For organizations
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              Publish events, reach motivated volunteers, and manage
              participation—all in one place.
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              For communities
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              More hands, more trust, more consistency. Small actions add up to
              big outcomes.
            </div>
          </Card>
        </div>
      </Section>

      <EventsGrid
        title="Popular events"
        description="Sorted by likes (volunteer interest)."
        order="eventLikes"
      />

      <EventsGrid
        title="Trending events"
        description="Sorted by unique views."
        order="eventViews"
      />

      <Section
        title="Ready to help?"
        description="Start with one event. Then make it a habit."
      >
        <Link
          to="/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: "var(--text-main)",
            fontWeight: 700,
          }}
        >
          Browse all events
          <span
            style={{ color: "var(--secondary)", fontWeight: 900 }}
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </Section>
    </div>
  );
}
