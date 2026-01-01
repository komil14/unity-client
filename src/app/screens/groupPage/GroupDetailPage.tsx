import { Link, useParams } from "react-router-dom";

import {
  useGetGroupByIdQuery,
  useJoinGroupMutation,
} from "../../services/groupsApi";
import { Card, clampText, uploadUrlFromFilename } from "../shared/ui";

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = id ?? "";

  const [joinGroup, joinState] = useJoinGroupMutation();

  const { data, isLoading, isError } = useGetGroupByIdQuery(groupId, {
    skip: !groupId,
  });

  if (!groupId) {
    return (
      <div>
        <div style={{ color: "var(--danger)" }}>Missing group id.</div>
        <div style={{ marginTop: 10 }}>
          <Link to="/groups" style={{ color: "var(--primary)" }}>
            Back to groups
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading)
    return <div style={{ color: "var(--text-muted)" }}>Loading…</div>;
  if (isError || !data)
    return <div style={{ color: "var(--danger)" }}>Failed to load group.</div>;

  const img = uploadUrlFromFilename("groups", data.groupImage);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Link to="/groups" style={{ color: "var(--primary)" }}>
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
          <h1 style={{ margin: 0, fontSize: 28 }}>{data.groupName}</h1>
          <div style={{ color: "var(--text-muted)" }}>
            {data.memberCount} members
          </div>
        </div>

        <div style={{ marginTop: 8, color: "var(--text-muted)" }}>
          {data.memberData?.memberNick ? (
            <span>
              By{" "}
              <Link
                to={`/organizers/${data.memberId}`}
                style={{ color: "var(--primary)", fontWeight: 700 }}
              >
                {data.memberData.memberNick}
              </Link>
            </span>
          ) : null}
        </div>

        <div style={{ marginTop: 14, lineHeight: 1.7 }}>
          {clampText(data.groupDesc, 4000)}
        </div>

        {data.groupCategories?.length ? (
          <div
            style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 14 }}
          >
            Categories: {data.groupCategories.join(", ")}
          </div>
        ) : null}

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
              Engagement
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              <span style={{ color: "var(--secondary)" }}>
                {data.groupLikes}
              </span>{" "}
              likes · {data.groupViews} views
            </div>
          </Card>
          <Card>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Membership
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              {data.meJoined ? "You joined" : "Not joined"}
            </div>
          </Card>
        </div>

        <div
          style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          <button
            type="button"
            disabled={joinState.isLoading || Boolean(data.meJoined)}
            onClick={async () => {
              await joinGroup({ groupId }).unwrap();
            }}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.12)",
              color: "var(--text-main)",
              cursor:
                joinState.isLoading || data.meJoined
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 800,
              opacity: data.meJoined ? 0.7 : 1,
            }}
          >
            {data.meJoined
              ? "Joined"
              : joinState.isLoading
              ? "Joining…"
              : "Join group"}
          </button>

          {joinState.isSuccess ? (
            <div
              style={{
                alignSelf: "center",
                color: "var(--primary)",
                fontWeight: 700,
              }}
            >
              Joined.
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
              Failed to join. If you’re not logged in,{" "}
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
