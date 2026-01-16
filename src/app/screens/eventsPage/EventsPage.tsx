import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetEventsQuery } from "../../services/eventsApi";
import { useCheckLikesBatchQuery } from "../../services/likesApi";
import EventCard from "./EventCard";
import {
  ArrowDownUp,
  Calendar,
  LoaderCircle,
  Search,
  Users,
  X,
} from "lucide-react";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Event Date", value: "eventDate" },
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "eventViews" },
  { label: "Most liked", value: "eventLikes" },
];

function defaultDirectionForOrder(order: string): "asc" | "desc" {
  if (order === "eventDate") return "asc";
  return "desc";
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrder = searchParams.get("order") || "createdAt";
  const [order, setOrder] = useState(initialOrder);

  const initialDirection =
    (searchParams.get("direction") as "asc" | "desc" | null) ||
    defaultDirectionForOrder(initialOrder);
  const [direction, setDirection] = useState<"asc" | "desc">(initialDirection);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const initialStartDate = searchParams.get("startDate") || "";
  const [startDate, setStartDate] = useState(initialStartDate);

  const initialEndDate = searchParams.get("endDate") || "";
  const [endDate, setEndDate] = useState(initialEndDate);

  // Keep component state in sync if the user navigates with browser history.
  useEffect(() => {
    const nextOrder = searchParams.get("order") || "createdAt";
    const nextSearch = searchParams.get("search") || "";
    const nextStartDate = searchParams.get("startDate") || "";
    const nextEndDate = searchParams.get("endDate") || "";
    const nextDirection =
      (searchParams.get("direction") as "asc" | "desc" | null) ||
      defaultDirectionForOrder(nextOrder);

    setOrder(nextOrder);
    setSearch(nextSearch);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setDirection(nextDirection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Push changes into the URL (single source of truth for shareable filters)
  useEffect(() => {
    const next = new URLSearchParams();
    const trimmed = search.trim();

    if (trimmed) next.set("search", trimmed);
    if (startDate) next.set("startDate", startDate);
    if (endDate) next.set("endDate", endDate);
    if (order !== "createdAt") next.set("order", order);
    const defaultDir = defaultDirectionForOrder(order);
    if (direction !== defaultDir) next.set("direction", direction);

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, startDate, endDate, order, direction]);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page: 1,
      limit: 12,
      order,
      direction,
      search: trimmed ? trimmed : undefined,
      startDate: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
    };
  }, [order, direction, search, startDate, endDate]);

  const { data, isLoading, isError } = useGetEventsQuery(query);

  const eventIds = useMemo(() => data?.map((e) => e._id) ?? [], [data]);
  const { data: likesData } = useCheckLikesBatchQuery(
    { likeGroup: "EVENT", likeRefIds: eventIds },
    { skip: eventIds.length === 0 }
  );

  const likedSet = useMemo(() => {
    const ids = likesData?.likedRefIds ?? [];
    return new Set(ids);
  }, [likesData]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-foreground">
          Events
        </h1>
        <div className="mt-1 text-sm text-muted-foreground">
          Discover events created by verified organizations.
        </div>
      </div>

      <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 w-[170px] rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Start date"
            />
          </div>

          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-11 w-[170px] rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="End date"
            />
          </div>

          <div className="relative">
            <select
              value={order}
              onChange={(e) => {
                const nextOrder = e.target.value;
                setOrder(nextOrder);
                setDirection((prev) => {
                  const defaultDir = defaultDirectionForOrder(nextOrder);
                  // If the user hasn't customized direction, snap to default for that field.
                  return prev === defaultDirectionForOrder(order)
                    ? defaultDir
                    : prev;
                });
              }}
              className="h-11 w-[170px] appearance-none rounded-[var(--radius-lg)] border border-border bg-background/40 px-3 pr-9 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sort by"
            >
              {ORDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ▾
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground hover:bg-background/60"
            onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label="Toggle sort direction"
            title={direction === "asc" ? "Ascending" : "Descending"}
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 font-semibold text-foreground hover:bg-background/60"
            onClick={() => {
              setSearch("");
              setStartDate("");
              setEndDate("");
              setOrder("createdAt");
              setDirection(defaultDirectionForOrder("createdAt"));
              setSearchParams(new URLSearchParams(), { replace: true });
            }}
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/30">
                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Searching volunteer events…
                </div>
                <div className="text-xs text-muted-foreground">
                  Matching opportunities to your filters
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Connecting volunteers & organizers</span>
            </div>
          </div>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/20 shadow-sm"
              >
                <div className="animate-pulse p-4">
                  <div className="h-40 w-full rounded-[var(--radius-lg)] bg-background/30" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-background/30" />
                  <div className="mt-3 h-4 w-full rounded bg-background/20" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-background/20" />
                  <div className="mt-5 flex items-center justify-between">
                    <div className="h-9 w-28 rounded-[var(--radius-lg)] bg-background/20" />
                    <div className="h-9 w-12 rounded-[var(--radius-lg)] bg-background/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div style={{ color: "var(--danger)" }}>Failed to load events.</div>
      ) : !data?.length ? (
        <div style={{ color: "var(--text-muted)" }}>No events found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {data.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              likedByMe={likedSet.has(event._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
