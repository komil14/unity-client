import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetEventsQuery } from "../../services/eventsApi";
import { useCheckLikesBatchQuery } from "../../services/likesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
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
  AlertCircle,
  RotateCw,
} from "lucide-react";

// Common style constants for better readability
const STYLES = {
  button:
    "inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 font-semibold text-foreground hover:bg-background/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  filterButton:
    "h-11 rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground hover:bg-background/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  input:
    "h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  presetButton:
    "h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  paginationButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/40 text-foreground hover:bg-background/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
} as const;

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
  useScrollToTop();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);

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

  // Local search input for debouncing
  const [searchInput, setSearchInput] = useState(search);
  const searchDebounceRef = useRef<number | null>(null);

  // Date validation warning
  const [dateError, setDateError] = useState<string | null>(null);

  // Scroll container ref
  const pageTopRef = useRef<HTMLDivElement>(null);

  const lastSyncedParamsRef = useRef<string | null>(null);
  const lastExternalUrlRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Sync local search input with Redux
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        dispatch(setSearchAction(value));
      }, 400);
    },
    [dispatch],
  );

  // Date validation
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError("Start date must be before end date");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);

  // Scroll to top on page change
  useEffect(() => {
    if (!isInitialMount.current && page > 1) {
      pageTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [page]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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
      page: parseInt(searchParams.get("page") || "1", 8) || 1,
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

  const eventIds = useMemo(
    () => data?.items?.map((e) => e._id) ?? [],
    [data?.items],
  );
  const { data: likesData } = useCheckLikesBatchQuery(
    { likeGroup: "EVENT", likeRefIds: eventIds },
    { skip: eventIds.length === 0 },
  );

  // Create a Set of liked event IDs for O(1) lookup performance
  const likedSet = useMemo(() => {
    const ids = likesData?.likedRefIds ?? [];
    return new Set(ids);
  }, [likesData]);

  // Apply client-side filtering for "liked only" mode
  // This allows showing liked events without additional API calls
  const filteredData = useMemo(() => {
    if (!showLikedOnly) return data?.items;
    return data?.items?.filter((event) => likedSet.has(event._id)) ?? [];
  }, [data?.items, showLikedOnly, likedSet]);

  const totalPages = useMemo(() => data?.totalPages ?? 1, [data?.totalPages]);

  const pageNumbers = useMemo(() => {
    const total = totalPages;
    const maxButtons = 5;
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const start = Math.max(1, Math.min(page - 2, total - maxButtons + 1));
    const end = Math.min(total, start + maxButtons - 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  // Prevent navigating to empty pages when the backend has no further results
  useEffect(() => {
    if (isLoading) return;

    const maxPage = Math.max(1, totalPages);

    // Clamp page to available pages from server
    if (page > maxPage) {
      dispatch(setPageAction(maxPage));
      return;
    }

    // Prevent navigating to empty pages when filters reduce results on the current page
    if (page > 1 && (!filteredData || filteredData.length === 0)) {
      dispatch(setPageAction(Math.max(1, page - 1)));
    }
  }, [dispatch, filteredData, isLoading, page, totalPages]);

  // Calendar helpers - generate days grid for month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add previous month's trailing days (empty slots)
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
    const dateString = formatLocalDate(selectedDate);

    if (isStartDate) {
      dispatch(setStartDate(dateString));
      setShowStartCalendar(false);
    } else {
      dispatch(setEndDate(dateString));
      setShowEndCalendar(false);
    }
  };

  // Date preset handlers
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const setToday = () => {
    const today = formatLocalDate(new Date());
    dispatch(setStartDate(today));
    dispatch(setEndDate(today));
  };

  const setThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    dispatch(setStartDate(formatLocalDate(monday)));
    dispatch(setEndDate(formatLocalDate(sunday)));
  };

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    dispatch(setStartDate(formatLocalDate(firstDay)));
    dispatch(setEndDate(formatLocalDate(lastDay)));
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

  // Close calendar on outside click or ESC key
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowStartCalendar(false);
        setShowEndCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={pageTopRef}>
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
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search events..."
              aria-label="Search events by name or description"
              className={STYLES.input}
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
              className={`flex items-center gap-2 px-4 text-sm ${STYLES.filterButton}`}
              aria-label="Select start date for event filtering"
              aria-expanded={showStartCalendar}
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {startDate ? formatDateDisplay(startDate) : "Start Date"}
              </span>
            </button>

            {/* Start Date Calendar Popover */}
            {showStartCalendar && (
              <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-2xl border border-border p-4 z-[9999] w-80">
                {/* Quick date range presets for common selections */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={setToday}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to today"
                  >
                    Today
                  </button>
                  <button
                    onClick={setThisWeek}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to this week"
                  >
                    This Week
                  </button>
                  <button
                    onClick={setThisMonth}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to this month"
                  >
                    This Month
                  </button>
                </div>

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
              className={`flex items-center gap-2 px-4 text-sm ${STYLES.filterButton}`}
              aria-label="Select end date for event filtering"
              aria-expanded={showEndCalendar}
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{endDate ? formatDateDisplay(endDate) : "End Date"}</span>
            </button>

            {/* End Date Calendar Popover */}
            {showEndCalendar && (
              <div className="absolute top-full mt-2 left-0 bg-card rounded-xl shadow-2xl border border-border p-4 z-[9999] w-80">
                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={setToday}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to today"
                  >
                    Today
                  </button>
                  <button
                    onClick={setThisWeek}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to this week"
                  >
                    This Week
                  </button>
                  <button
                    onClick={setThisMonth}
                    className="h-8 px-2 rounded-lg border border-border bg-background/40 text-xs font-medium text-foreground hover:bg-background/60 transition-colors"
                    title="Set dates to this month"
                  >
                    This Month
                  </button>
                </div>

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
              className="h-11 w-[170px] appearance-none rounded-[var(--radius-lg)] border border-border bg-background/40 px-3 pr-9 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
              aria-label="Sort events by"
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
            disabled={!isAuthenticated}
            className={`inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] border px-4 transition-colors ${
              showLikedOnly
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-background/40 text-foreground hover:bg-background/60"
            } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0`}
            onClick={() => dispatch(setShowLikedOnlyAction(!showLikedOnly))}
            title={
              isAuthenticated
                ? "Show only liked events"
                : "Login to view liked events"
            }
            aria-label={`${showLikedOnly ? "Hide" : "Show"} liked events only`}
            aria-pressed={showLikedOnly}
          >
            <Heart
              className={`h-4 w-4 ${showLikedOnly ? "fill-current" : ""}`}
            />
            My Likes
          </button>

          {/* Direction Toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 text-foreground hover:bg-background/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
            onClick={() =>
              dispatch(setDirectionAction(direction === "asc" ? "desc" : "asc"))
            }
            aria-label={`Toggle sort direction: currently ${direction === "asc" ? "ascending" : "descending"}`}
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
            className={STYLES.button}
            onClick={() => {
              dispatch(resetFilters());
              setCalendarMonth(new Date());
              setShowStartCalendar(false);
              setShowEndCalendar(false);
            }}
            aria-label="Clear all filters"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Date Validation Error */}
        {dateError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{dateError}</span>
          </div>
        )}
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
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load events
          </h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
            Something went wrong while fetching events. Please check your
            connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RotateCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : !data?.items?.length ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {showLikedOnly
              ? "No liked events"
              : search
                ? "No events match your search"
                : "No events found"}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {showLikedOnly
              ? "You haven't liked any events yet. Browse events and tap ❤️ to save them here!"
              : search
                ? "Try different keywords or adjust your filters to find events."
                : "Check back later for upcoming events from verified organizations."}
          </p>
        </div>
      ) : !filteredData?.length ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No liked events match your filters
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            None of your liked events match the current filters. Try adjusting
            your search or date range.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
              className={`${STYLES.paginationButton} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => dispatch(setPageAction(pageNum))}
                  className={`h-10 w-10 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 ${
                    pageNum === page
                      ? "border-primary bg-primary/20 text-primary font-semibold"
                      : "border-border bg-background/40 text-foreground hover:bg-background/60"
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => dispatch(setPageAction(page + 1))}
              disabled={page >= totalPages}
              className={`${STYLES.paginationButton} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
