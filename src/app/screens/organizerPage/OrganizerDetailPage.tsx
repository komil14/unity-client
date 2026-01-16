import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import {
  useGetOrganizerByIdQuery,
  useViewOrganizerMutation,
} from "../../services/organizersApi";
import { Card, clampText } from "../../../libs/shared/ui";

export default function OrganizerDetailPage() {
  const { id } = useParams();
  const organizerId = id ?? "";

  const [viewOrganizer] = useViewOrganizerMutation();

  useEffect(() => {
    if (!organizerId) return;
    viewOrganizer(organizerId);
  }, [organizerId, viewOrganizer]);

  const { data, isLoading, isError } = useGetOrganizerByIdQuery(organizerId, {
    skip: !organizerId,
  });

  if (!organizerId) {
    return (
      <div>
        <div style={{ color: "var(--danger)" }}>Missing organizer id.</div>
        <div style={{ marginTop: 10 }}>
          <Link to="/organizers" style={{ color: "var(--primary)" }}>
            Back to organizers
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading)
    return <div style={{ color: "var(--text-muted)" }}>Loading…</div>;
  if (isError || !data)
    return (
      <div style={{ color: "var(--danger)" }}>Failed to load organizer.</div>
    );

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Link to="/organizers" style={{ color: "var(--primary)" }}>
          ← Back
        </Link>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>{data.memberNick}</h1>
          <div style={{ color: "var(--text-muted)" }}>
            {data.isVerified ? "Verified" : ""}
          </div>
        </div>

        <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
          {clampText(data.memberDesc || "", 2000)}
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
              Organized
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {data.eventsOrganizedCount ?? 0} events ·{" "}
              {data.groupsOrganizedCount ?? 0} groups
            </div>
          </Card>
          <Card>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Engagement
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {data.memberLikes ?? 0} likes · {data.memberViews ?? 0} views
            </div>
          </Card>
        </div>

        {data.organizedEvents?.length ? (
          <div style={{ marginTop: 18 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Events</h2>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {data.organizedEvents.slice(0, 8).map((e: any) => (
                <Link key={String(e._id)} to={`/events/${String(e._id)}`}>
                  <Card>
                    <div style={{ fontWeight: 800 }}>{e.eventTitle}</div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "var(--text-muted)",
                        fontSize: 14,
                      }}
                    >
                      {clampText(e.eventDesc || "", 140)}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {data.organizedGroups?.length ? (
          <div style={{ marginTop: 18 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Groups</h2>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {data.organizedGroups.slice(0, 8).map((g: any) => (
                <Link key={String(g._id)} to={`/groups/${String(g._id)}`}>
                  <Card>
                    <div style={{ fontWeight: 800 }}>{g.groupName}</div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "var(--text-muted)",
                        fontSize: 14,
                      }}
                    >
                      {clampText(g.groupDesc || "", 140)}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
