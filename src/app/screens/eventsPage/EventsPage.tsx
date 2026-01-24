import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetEventsQuery } from "../../services/eventsApi";
import { useCheckLikesBatchQuery } from "../../services/likesApi";
import EventCard from "./EventCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectEventsFilters,
  selectEventsOrdering,
  selectEventsPagination,
  selectEventsView,
} from "./selectors";
import {
  hydrateFromUrl,
  resetFilters,
  setDirection as setDirectionAction,
  setEndDate,
  setOrder as setOrderAction,
  setPage as setPageAction,
  setSearch as setSearchAction,
  setShowLikedOnly as setShowLikedOnlyAction,
  setStartDate,
} from "./slice";
import type { EventsPageState } from "../../../libs/types";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LoaderCircle,
  Users,
  X,
  Heart,
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

function viewsEqual(a: EventsPageState, b: EventsPageState) {
  return (
    a.search === b.search &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.showLikedOnly === b.showLikedOnly &&
    a.order === b.order &&
    a.direction === b.direction &&
    a.page === b.page &&
    a.limit === b.limit
  );
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const filters = useAppSelector(selectEventsFilters);
  const ordering = useAppSelector(selectEventsOrdering);
  const pagination = useAppSelector(selectEventsPagination);
  const view = useAppSelector(selectEventsView);

  const { search, startDate, endDate, showLikedOnly } = filters;
  const { order, direction } = ordering;
  const { page, limit } = pagination;

  // Calendar popover states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);

  const lastSyncedParamsRef = useRef<string | null>(null);
  const lastExternalUrlRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  const viewFromUrl = useMemo(() => {
    const urlOrder = searchParams.get("order") || "createdAt";
    const urlDirection =
      (searchParams.get("direction") as "asc" | "desc" | null) ||
      defaultDirectionForOrder(urlOrder);

    return {
      search: searchParams.get("search") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      showLikedOnly: searchParams.get("liked") === "true",
      order: urlOrder,
      direction: urlDirection,
      page: parseInt(searchParams.get("page") || "1", 10) || 1,
      limit,
    } satisfies EventsPageState;
  }, [limit, searchParams]);

  // Hydrate Redux from URL, and respond to browser back/forward
  useEffect(() => {
    const urlString = searchParams.toString();

    if (isInitialMount.current) {
      dispatch(hydrateFromUrl(viewFromUrl));
      lastSyncedParamsRef.current = urlString;
      lastExternalUrlRef.current = urlString;
      isInitialMount.current = false;
      return;
    }

    if (urlString !== lastSyncedParamsRef.current) {
      lastExternalUrlRef.current = urlString;
      if (!viewsEqual(view, viewFromUrl)) {
        dispatch(hydrateFromUrl(viewFromUrl));
      }
    }
  }, [dispatch, searchParams, view, viewFromUrl]);

  // Sync Redux state into URL (avoids loops by comparing last external URL)
  useEffect(() => {
    if (isInitialMount.current) return;

    const next = new URLSearchParams();
    const trimmed = search.trim();

    if (trimmed) next.set("search", trimmed);
    if (startDate) next.set("startDate", startDate);
    if (endDate) next.set("endDate", endDate);
    if (order !== "createdAt") next.set("order", order);
    if (showLikedOnly) next.set("liked", "true");
    if (page > 1) next.set("page", String(page));

    const defaultDir = defaultDirectionForOrder(order);
    if (direction !== defaultDir) next.set("direction", direction);

    const nextString = next.toString();
    if (nextString !== lastExternalUrlRef.current) {
      lastSyncedParamsRef.current = nextString;
      setSearchParams(next, { replace: true });
    }
  }, [
    direction,
    endDate,
    order,
    page,
    search,
    setSearchParams,
    showLikedOnly,
    startDate,
  ]);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page,
      limit,
      order,
      direction,
      search: trimmed ? trimmed : undefined,
      startDate: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
    };
  }, [direction, endDate, limit, order, page, search, startDate]);

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

  // Filter to show only liked events if showLikedOnly is true
  const filteredData = useMemo(() => {
    if (!showLikedOnly) return data;
    return data?.filter((event) => likedSet.has(event._id)) ?? [];
  }, [data, showLikedOnly, likedSet]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "End Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateSelect = (day: number, isStartDate: boolean) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toISOString().split("T")[0];

    if (isStartDate) {
      dispatch(setStartDate(dateString));
      setShowStartCalendar(false);
    } else {
      dispatch(setEndDate(dateString));
      setShowEndCalendar(false);
    }
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarMonth.getMonth() === today.getMonth() &&
      calendarMonth.getFullYear() === today.getFullYear()
    );
  };

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startDateRef.current &&
        !startDateRef.current.contains(event.target as Node)
      ) {
        setShowStartCalendar(false);
      }
      if (
        endDateRef.current &&
        !endDateRef.current.contains(event.target as Node)
      ) {
        setShowEndCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="mb-6 rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm backdrop-blur relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[260px] flex-1">
            <input
              value={search}
              onChange={(e) => dispatch(setSearchAction(e.target.value))}
              placeholder="Search events..."
              className="h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Start Date Picker */}
          <div className="relative" ref={startDateRef}>
            <button
              onClick={() => {
                setShowStartCalendar(!showStartCalendar);
                setShowEndCalendar(false);
                setCalendarMonth(startDate ? new Date(startDate) : new Date());
              }}
              className="flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 text-sm text-foreground hover:bg-background/60 transition-colors"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {startDate ? formatDateDisplay(startDate) : "Start Date"}
              </span>
            </button>

            {/* Start Date Calendar Popover */}
            {showStartCalendar && (
              <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-2xl border border-border p-4 z-[9999] w-80">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newMonth = new Date(calendarMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCalendarMonth(newMonth);
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-foreground">
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => {
                      const newMonth = new Date(calendarMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCalendarMonth(newMonth);
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(calendarMonth).map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && handleDateSelect(day, true)}
                      disabled={!day}
                      className={`
                        aspect-square p-2 text-sm rounded-lg transition-colors
                        ${!day ? "invisible" : ""}
                        ${
                          isToday(day)
                            ? "bg-primary/20 text-primary font-semibold"
                            : ""
                        }
                        ${day && !isToday(day) ? "hover:bg-muted" : ""}
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* End Date Picker */}
          <div className="relative" ref={endDateRef}>
            <button
              onClick={() => {
                setShowEndCalendar(!showEndCalendar);
                setShowStartCalendar(false);
                setCalendarMonth(endDate ? new Date(endDate) : new Date());
              }}
              className="flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 text-sm text-foreground hover:bg-background/60 transition-colors"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{endDate ? formatDateDisplay(endDate) : "End Date"}</span>
            </button>

            {/* End Date Calendar Popover */}
            {showEndCalendar && (
              <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-2xl border border-border p-4 z-[9999] w-80">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newMonth = new Date(calendarMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCalendarMonth(newMonth);
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-foreground">
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => {
                      const newMonth = new Date(calendarMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCalendarMonth(newMonth);
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(calendarMonth).map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && handleDateSelect(day, false)}
                      disabled={!day}
                      className={`
                        aspect-square p-2 text-sm rounded-lg transition-colors
                        ${!day ? "invisible" : ""}
                        ${
                          isToday(day)
                            ? "bg-primary/20 text-primary font-semibold"
                            : ""
                        }
                        ${day && !isToday(day) ? "hover:bg-muted" : ""}
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={order}
              onChange={(e) => {
                const nextOrder = e.target.value;
                const nextDirection =
                  direction === defaultDirectionForOrder(order)
                    ? defaultDirectionForOrder(nextOrder)
                    : direction;
                dispatch(setOrderAction(nextOrder));
                dispatch(setDirectionAction(nextDirection));
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Liked Events Toggle */}
          <button
            type="button"
            className={`inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border px-4 font-semibold transition-colors ${
              showLikedOnly
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-background/40 text-foreground hover:bg-background/60"
            }`}
            onClick={() => dispatch(setShowLikedOnlyAction(!showLikedOnly))}
            title="Show only liked events"
          >
            <Heart
              className={`h-4 w-4 ${showLikedOnly ? "fill-current" : ""}`}
            />
            My Likes
          </button>

          {/* Direction Toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground hover:bg-background/60"
            onClick={() =>
              dispatch(setDirectionAction(direction === "asc" ? "desc" : "asc"))
            }
            aria-label="Toggle sort direction"
            title={direction === "asc" ? "Ascending" : "Descending"}
          >
            {direction === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Clear Button */}
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 font-semibold text-foreground hover:bg-background/60"
            onClick={() => {
              dispatch(resetFilters());
              setCalendarMonth(new Date());
              setShowStartCalendar(false);
              setShowEndCalendar(false);
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
        <div style={{ color: "var(--text-muted)" }}>
          {showLikedOnly
            ? "You haven't liked any events yet."
            : "No events found."}
        </div>
      ) : !filteredData?.length ? (
        <div style={{ color: "var(--text-muted)" }}>
          No liked events found. Start liking events to see them here!
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {filteredData.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                likedByMe={likedSet.has(event._id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => dispatch(setPageAction(Math.max(1, page - 1)))}
              disabled={page === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/40 text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/60 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const pageNum = page - 2 + i;
                // Don't show page numbers less than 1
                if (pageNum < 1) return null;
                // If current page has full results (10), only show up to current+1 (we don't know beyond that)
                if (filteredData.length >= limit && pageNum > page + 1)
                  return null;
                // If current page has fewer than 10 results, it's the last page - don't show beyond it
                if (filteredData.length < limit && pageNum > page) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => dispatch(setPageAction(pageNum))}
                    className={`h-10 w-10 rounded-lg border transition-colors ${
                      pageNum === page
                        ? "border-primary bg-primary/20 text-primary font-semibold"
                        : "border-border bg-background/40 text-foreground hover:bg-background/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => dispatch(setPageAction(page + 1))}
              disabled={filteredData.length < limit}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/40 text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/60 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
