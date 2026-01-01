import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetEventsQuery } from "../../services/eventsApi";
import {
  Card,
  clampText,
  formatDate,
  imageUrlFromFilename,
} from "../shared/ui";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "eventViews" },
  { label: "Most liked", value: "eventLikes" },
  { label: "Soonest", value: "eventDate" },
];

export default function EventsPage() {
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

  const { data, isLoading, isError } = useGetEventsQuery(query);

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
          <h1 style={{ margin: 0, fontSize: 28 }}>Events</h1>
          <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
            Discover events created by verified organizations.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
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
        <div style={{ color: "var(--danger)" }}>Failed to load events.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No events found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
                    <div style={{ fontWeight: 800 }}>{event.eventTitle}</div>
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
                    {clampText(event.eventDesc, 130)}
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
    </div>
  );
}
