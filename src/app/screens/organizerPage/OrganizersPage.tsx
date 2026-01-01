import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useGetOrganizersQuery } from "../../services/organizersApi";
import { Card, clampText } from "../shared/ui";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "memberViews" },
  { label: "Most liked", value: "memberLikes" },
];

export default function OrganizersPage() {
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
      onlyActive: true,
    };
  }, [order, search]);

  const { data, isLoading, isError } = useGetOrganizersQuery(query);

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
          <h1 style={{ margin: 0, fontSize: 28 }}>Organizers</h1>
          <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
            Verified organizations and their activity.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizers…"
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
        <div style={{ color: "var(--danger)" }}>Failed to load organizers.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No organizers found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {data.map((org) => (
            <Link
              key={org._id}
              to={`/organizers/${org._id}`}
              style={{ display: "block" }}
            >
              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{org.memberNick}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {org.isVerified ? "Verified" : ""}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  {clampText(org.memberDesc || "", 130)}
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
                      {org.eventsOrganizedCount ?? 0}
                    </span>{" "}
                    events ·{" "}
                    <span style={{ color: "var(--secondary)" }}>
                      {org.groupsOrganizedCount ?? 0}
                    </span>{" "}
                    groups
                  </span>
                  <span>
                    {org.memberLikes ?? 0} likes · {org.memberViews ?? 0} views
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
