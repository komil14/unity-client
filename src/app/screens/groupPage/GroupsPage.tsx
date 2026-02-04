import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useGetGroupsQuery } from "../../services/groupsApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import {
  Card,
  clampText,
  uploadUrlFromFilename,
} from "../../../libs/shared/ui";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "groupViews" },
  { label: "Most liked", value: "groupLikes" },
  { label: "Most members", value: "memberCount" },
];

export default function GroupsPage() {
  useScrollToTop();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrder = searchParams.get("order") || "createdAt";
  const [order, setOrder] = useState(initialOrder);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page: 1,
      limit: 12,
      order,
      search: trimmed ? trimmed : undefined,
    };
  }, [order, search]);

  const { data, isLoading, isError } = useGetGroupsQuery(query);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Groups</h1>
          <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
            Discover communities created by organizers.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              minWidth: 220,
            }}
          />

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-main)",
            }}
          >
            {ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams();
              if (order !== "createdAt") next.set("order", order);
              if (search.trim()) next.set("search", search.trim());
              setSearchParams(next);
            }}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-hover)",
              color: "var(--text-main)",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading…</div>
      ) : isError ? (
        <div style={{ color: "var(--danger)" }}>Failed to load groups.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No groups found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {data.map((group) => {
            const img = uploadUrlFromFilename("groups", group.groupImage);
            return (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                style={{ display: "block" }}
              >
                <Card>
                  {img ? (
                    <div
                      style={{
                        height: 160,
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
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{group.groupName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {group.memberData?.memberNick
                        ? `by ${group.memberData.memberNick}`
                        : ""}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    {clampText(group.groupDesc || "", 130)}
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
                    <span>
                      <span style={{ color: "var(--secondary)" }}>
                        {group.memberCount}
                      </span>{" "}
                      members
                    </span>
                    <span>
                      <span style={{ color: "var(--secondary)" }}>
                        {group.groupLikes}
                      </span>{" "}
                      likes · {group.groupViews} views
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
