import { useMemo } from "react";
import { Sparkles, Clock, Check, X, Zap } from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import { useGetMyApplicationsQuery } from "../../services/applicationsApi";

export default function ProfilePage() {
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const { data: applications, isLoading: appsLoading } =
    useGetMyApplicationsQuery();

  const member = authData?.member;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!applications) {
      return {
        totalPoints: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
      };
    }

    return {
      totalPoints: member?.memberPoints || 0,
      pending: applications.filter((app) => app.applicationStatus === "PENDING")
        .length,
      approved: applications.filter(
        (app) => app.applicationStatus === "APPROVED"
      ).length,
      rejected: applications.filter(
        (app) => app.applicationStatus === "REJECTED"
      ).length,
      completed: applications.filter(
        (app) => app.applicationStatus === "COMPLETED"
      ).length,
    };
  }, [applications, member?.memberPoints]);

  if (authLoading || appsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-4">
        <div className="text-destructive font-semibold">
          Please login to view your profile.
        </div>
      </div>
    );
  }

  const avatarInitial = member.memberNick
    ? member.memberNick.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="w-full min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Profile Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left Section - Identity */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted border-4 border-border flex items-center justify-center overflow-hidden">
                  {member.memberImage ? (
                    <img
                      src={
                        member.memberImage.startsWith("http")
                          ? member.memberImage
                          : `/uploads/members/${member.memberImage}`
                      }
                      alt={member.memberNick}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-extrabold text-foreground">
                      {avatarInitial}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {member.memberNick}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {member.memberPhone}
                </p>
                <div className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                  {member.memberType === "USER"
                    ? "VOLUNTEER"
                    : member.memberType}
                </div>
              </div>
            </div>

            {/* Right Section - Stats Grid */}
            <div className="flex-1 w-full">
              <div className="rounded-xl bg-muted/30 p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Points/Stars */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.totalPoints}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Stars
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.pending}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Pending
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.approved}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Approved
                    </div>
                  </div>

                  {/* Rejected */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <X className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.rejected}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Rejected
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="rounded-xl bg-card border border-border shadow-sm p-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {stats.completed}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
