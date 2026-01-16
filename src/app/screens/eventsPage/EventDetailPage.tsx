import { Link, useParams } from "react-router-dom";
import { useGetEventByIdQuery } from "../../services/eventsApi";
import { useJoinEventMutation } from "../../services/applicationsApi";
import {
  Card,
  clampText,
  formatDate,
  imageUrlFromFilename,
} from "../../../libs/shared/ui";

export default function EventDetailPage() {
  const { id } = useParams();
  const eventId = id ?? "";

  const [joinEvent, joinState] = useJoinEventMutation();

  const { data, isLoading, isError } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });

  if (!eventId) {
    return (
      <div>
        <div style={{ color: "var(--danger)" }}>Missing event id.</div>
        <div style={{ marginTop: 10 }}>
          <Link to="/events" style={{ color: "var(--primary)" }}>
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading)
    return <div style={{ color: "var(--text-muted)" }}>Loading…</div>;
  if (isError || !data)
    return <div style={{ color: "var(--danger)" }}>Failed to load event.</div>;

  const img = imageUrlFromFilename(data.eventImages?.[0]);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Link to="/events" style={{ color: "var(--primary)" }}>
          ← Back
        </Link>
      </div>

      <Card>
        {img ? (
          <div
            style={{
              height: 260,
              borderRadius: "var(--radius-sm)",
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid var(--border-color)",
              marginBottom: 14,
            }}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>{data.eventTitle}</h1>
          <div style={{ color: "var(--text-muted)" }}>
            {formatDate(data.eventDate)}
          </div>
        </div>

        <div style={{ marginTop: 8, color: "var(--text-muted)" }}>
          {data.memberData?.memberNick ? (
            <span>
              By{" "}
              <span style={{ color: "var(--text-main)", fontWeight: 700 }}>
                {data.memberData.memberNick}
              </span>
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: 14, lineHeight: 1.7 }}>
          {clampText(data.eventDesc, 2000)}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          <Card>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Location
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {data.eventLocation}
            </div>
          </Card>
          <Card>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Capacity
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {data.eventJoined}/{data.eventCapacity}
            </div>
          </Card>
          <Card>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Engagement
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              <span style={{ color: "var(--secondary)" }}>
                {data.eventLikes}
              </span>{" "}
              likes · {data.eventViews} views
            </div>
          </Card>
        </div>

        <div
          style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <button
            type="button"
            disabled={joinState.isLoading}
            onClick={async () => {
              await joinEvent({ eventId }).unwrap();
            }}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.12)",
              color: "var(--text-main)",
              cursor: joinState.isLoading ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            {joinState.isLoading ? "Applying…" : "Apply to join"}
          </button>

          {joinState.isSuccess ? (
            <div
              style={{
                alignSelf: "center",
                color: "var(--primary)",
                fontWeight: 700,
              }}
            >
              Application submitted.
            </div>
          ) : null}

          {joinState.isError ? (
            <div
              style={{
                alignSelf: "center",
                color: "var(--danger)",
                fontWeight: 700,
              }}
            >
              Failed to apply. If you’re not logged in,{" "}
              <Link to="/login" style={{ color: "var(--primary)" }}>
                login
              </Link>{" "}
              first.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
