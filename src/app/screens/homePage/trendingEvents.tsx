import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

import { useGetEventsQuery } from "../../services/eventsApi";
import { useCheckLikesBatchQuery } from "../../services/likesApi";
import EventCard from "../eventsPage/EventCard";

export default function TrendingEventsSection() {
  const { data, isLoading, isError } = useGetEventsQuery({
    page: 1,
    limit: 4,
    order: "eventViews",
    direction: "desc",
  });

  const eventIds = useMemo(
    () => data?.items?.map((e) => e._id) ?? [],
    [data?.items],
  );
  const { data: likesData } = useCheckLikesBatchQuery(
    { likeGroup: "EVENT", likeRefIds: eventIds },
    { skip: eventIds.length === 0 },
  );

  const likedSet = useMemo(() => {
    const ids = likesData?.likedRefIds ?? [];
    return new Set(ids);
  }, [likesData]);

  return (
    <section className="mb-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight text-foreground">
              Trending events
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The 4 most viewed events right now.
          </p>
        </div>

        <Link
          to="/events?order=eventViews"
          className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60"
        >
          See all
          <span className="ml-2 text-primary" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm">
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : isError ? (
          <div className="text-destructive">Failed to load events.</div>
        ) : !data?.items?.length ? (
          <div className="text-muted-foreground">No events yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((event) => (
              <div key={event._id} className="h-full">
                <EventCard event={event} likedByMe={likedSet.has(event._id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
