import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowDownUp,
  Eye,
  Heart,
  Mail,
  Search,
  User,
  Users,
  Calendar,
  X,
  BadgeCheck,
  Clock,
} from "lucide-react";

import { useGetOrganizersQuery } from "../../services/organizersApi";
import {
  useCheckLikesBatchQuery,
  useToggleLikeMutation,
} from "../../services/likesApi";
import { useCheckAuthQuery } from "../../services/authApi";
import { AlertDialog } from "../../../libs/components/ui/alert-dialog";
import { useToast } from "../../../libs/components/ui/toast";
import { memberImageUrlFromFilename } from "../../../libs/shared/ui";

const ORDER_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Most viewed", value: "memberViews" },
  { label: "Most liked", value: "memberLikes" },
];

export default function OrganizersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: authData } = useCheckAuthQuery();
  const isAuthenticated = Boolean(authData?.member?._id);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const { showToast } = useToast();

  const initialOrder = searchParams.get("order") || "createdAt";
  const [order, setOrder] = useState(initialOrder);

  const initialDirection =
    (searchParams.get("direction") as "asc" | "desc" | null) || "desc";
  const [direction, setDirection] = useState<"asc" | "desc">(initialDirection);

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const initialPage = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState<number>(
    Number.isFinite(initialPage) ? initialPage : 1,
  );

  useEffect(() => {
    const nextOrder = searchParams.get("order") || "createdAt";
    const nextDirection =
      (searchParams.get("direction") as "asc" | "desc" | null) || "desc";
    const nextSearch = searchParams.get("search") || "";
    const nextPage = Number(searchParams.get("page") || 1);

    setOrder(nextOrder);
    setDirection(nextDirection);
    setSearch(nextSearch);
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams();
    const trimmed = search.trim();

    if (trimmed) next.set("search", trimmed);
    if (order !== "createdAt") next.set("order", order);
    if (direction !== "desc") next.set("direction", direction);
    if (page !== 1) next.set("page", String(page));

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, order, direction, page]);

  const query = useMemo(() => {
    const trimmed = search.trim();
    return {
      page,
      limit: 9,
      order,
      direction,
      search: trimmed ? trimmed : undefined,
      onlyActive: true,
    };
  }, [order, direction, search, page]);

  const { data, isLoading, isError } = useGetOrganizersQuery(query);

  const orgIds = useMemo(() => data?.map((o) => o._id) ?? [], [data]);
  const { data: likesData } = useCheckLikesBatchQuery(
    { likeGroup: "MEMBER", likeRefIds: orgIds },
    { skip: orgIds.length === 0 },
  );
  const likedSet = useMemo(
    () => new Set(likesData?.likedRefIds ?? []),
    [likesData],
  );

  const [toggleLike] = useToggleLikeMutation();

  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [likesCountOverrides, setLikesCountOverrides] = useState<
    Record<string, number>
  >({});

  const handleToggleLike = async (
    orgId: string,
    likedByMe: boolean,
    memberLikes: number,
  ) => {
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }

    if (pendingLikeIds.has(orgId)) return;

    const nextLiked = !likedByMe;
    const nextLikesCount = Math.max(0, memberLikes + (nextLiked ? 1 : -1));

    setPendingLikeIds((prev) => {
      const next = new Set(prev);
      next.add(orgId);
      return next;
    });
    setLikedOverrides((prev) => ({ ...prev, [orgId]: nextLiked }));
    setLikesCountOverrides((prev) => ({ ...prev, [orgId]: nextLikesCount }));

    try {
      const res = await toggleLike({
        likeGroup: "MEMBER",
        likeRefId: orgId,
      }).unwrap();

      const finalLiked = res.status === "liked";
      setLikedOverrides((prev) => ({ ...prev, [orgId]: finalLiked }));

      const delta = (finalLiked ? 1 : 0) - (likedByMe ? 1 : 0);
      setLikesCountOverrides((prev) => ({
        ...prev,
        [orgId]: Math.max(0, memberLikes + delta),
      }));

      // Show success toast
      showToast(
        finalLiked
          ? "Organizer added to your favorites!"
          : "Organizer removed from your favorites!",
      );
    } catch (err: any) {
      setLikedOverrides((prev) => {
        const next = { ...prev };
        delete next[orgId];
        return next;
      });
      setLikesCountOverrides((prev) => {
        const next = { ...prev };
        delete next[orgId];
        return next;
      });

      const status = err?.status as number | undefined;
      if (status === 401 || status === 403) {
        navigate("/login");
      }
    } finally {
      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(orgId);
        return next;
      });
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="m-0 text-3xl font-extrabold tracking-tight text-foreground">
          Organizers
        </h1>
        <div className="mt-2 text-sm text-muted-foreground">
          Browse through our list of event organizers
        </div>
      </div>

      <div className="mb-8 rounded-[var(--radius-lg)] border border-border bg-card/30 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, description..."
              className="h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 pl-10 pr-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value);
                  setPage(1);
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
              onClick={() => {
                setDirection((d) => (d === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
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
                setOrder("createdAt");
                setDirection("desc");
                setPage(1);
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : isError ? (
        <div className="text-destructive">Failed to load organizers.</div>
      ) : !data?.length ? (
        <div className="text-muted-foreground">No organizers found.</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.map((org) => {
              const avatar = memberImageUrlFromFilename(org.memberImage, org.memberNick);
              const initial = (org.memberNick || "?").slice(0, 1).toUpperCase();
              const apiLikedByMe = likedSet.has(org._id);
              const likedByMe = likedOverrides[org._id] ?? apiLikedByMe;
              const memberLikes =
                likesCountOverrides[org._id] ?? org.memberLikes ?? 0;
              const isLikePending = pendingLikeIds.has(org._id);

              return (
                <div
                  key={org._id}
                  className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card/30 shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-muted">
                        <img
                          src={avatar || ''}
                          alt={org.memberNick}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-extrabold text-foreground">
                          {org.memberNick}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>Organizer</span>
                          {org.isVerified ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0 text-[10px] font-semibold text-primary">
                              <BadgeCheck className="h-2.5 w-2.5" />
                              Verified
                            </span>
                          ) : org.memberStatus === "PENDING" ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-1.5 py-0 text-[10px] font-semibold text-yellow-700">
                              <Clock className="h-2.5 w-2.5" />
                              Pending
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {org.memberPhone || ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] border border-border bg-background/20 p-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-background/20 px-2 py-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {org.eventsOrganizedCount ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-background/20 px-2 py-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {org.groupsOrganizedCount ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-background/20 px-2 py-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {memberLikes}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-background/20 px-4 py-3">
                      <div className="truncate text-center text-xs text-muted-foreground">
                        {org.memberDesc?.trim()
                          ? org.memberDesc.trim()
                          : "No description available"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-border bg-background/10 p-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={likedByMe ? "Unlike" : "Like"}
                        aria-pressed={likedByMe}
                        disabled={isLikePending}
                        onClick={async () => {
                          await handleToggleLike(
                            org._id,
                            likedByMe,
                            memberLikes,
                          );
                        }}
                      >
                        <Heart
                          className="h-4 w-4 text-destructive"
                          fill={likedByMe ? "currentColor" : "none"}
                        />
                        <span className="text-sm font-semibold">
                          {memberLikes}
                        </span>
                      </button>

                      <Link
                        to={`/organizers/${org._id}`}
                        className="inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-primary px-6 py-2 text-sm font-bold text-primary-foreground"
                        aria-label="View organizer detail"
                      >
                        View
                      </Link>

                      <div
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-4 py-2 text-foreground"
                        aria-label="Views"
                        title="Views"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">
                          {org.memberViews ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 hover:text-foreground"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Previous
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-background/20 text-foreground">
              {page}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 hover:text-foreground"
              disabled={!data || data.length < 9}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        </>
      )}

      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        onConfirm={() => {
          setShowLoginAlert(false);
          navigate("/login");
        }}
        title="Login Required"
        description="Join our community to show your appreciation for amazing organizers! Create an account or login to continue."
        confirmText="Login Now"
        cancelText="Maybe Later"
      />
    </div>
  );
}
