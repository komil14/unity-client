import { useMemo, useState } from "react";
import { Clock, Check, X, Zap, Settings } from "lucide-react";
import { useCheckAuthQuery } from "../../services/authApi";
import { useGetMyApplicationsQuery } from "../../services/applicationsApi";
import { useToast } from "../../../libs/components/ui/toast";
import {
  ProfileOverview,
  TabNavigation,
  PendingApplications,
  ApprovedApplications,
  RejectedApplications,
  CompletedApplications,
  SettingsForm,
} from "./components";
import type { TabType, TabConfig } from "../../../lib/types";

export default function ProfilePage() {
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const { data: applications, isLoading: appsLoading } =
    useGetMyApplicationsQuery();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("settings");

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
        (app) => app.applicationStatus === "APPROVED",
      ).length,
      rejected: applications.filter(
        (app) => app.applicationStatus === "REJECTED",
      ).length,
      completed: applications.filter(
        (app) => app.applicationStatus === "COMPLETED",
      ).length,
    };
  }, [applications, member?.memberPoints]);

  // Filter applications by status
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    const statusMap: Record<TabType, string> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
      completed: "COMPLETED",
      settings: "",
    };
    if (activeTab === "settings") return [];
    return applications.filter(
      (app) => app.applicationStatus === statusMap[activeTab],
    );
  }, [applications, activeTab]);

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: "pending",
      label: "Pending",
      icon: <Clock className="h-4 w-4 text-primary" />,
      count: stats.pending,
    },
    {
      id: "approved",
      label: "Approved",
      icon: <Check className="h-4 w-4 text-primary" />,
      count: stats.approved,
    },
    {
      id: "rejected",
      label: "Rejected",
      icon: <X className="h-4 w-4 text-primary" />,
      count: stats.rejected,
    },
    {
      id: "completed",
      label: "Completed",
      icon: <Zap className="h-4 w-4 text-primary" />,
      count: stats.completed,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 text-primary" />,
    },
  ];

  if (authLoading || appsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-muted rounded-2xl" />
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

  return (
    <div className="w-full min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        {/* Profile Overview with Stats */}
        <ProfileOverview member={member} stats={stats} />

        {/* Tab-based Content Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-8">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Content Area */}
          {activeTab === "settings" && (
            <SettingsForm
              member={member}
              onUpdate={() => showToast("Profile updated successfully!")}
            />
          )}
          {activeTab === "pending" && (
            <PendingApplications apps={filteredApps} />
          )}
          {activeTab === "approved" && (
            <ApprovedApplications apps={filteredApps} />
          )}
          {activeTab === "rejected" && (
            <RejectedApplications apps={filteredApps} />
          )}
          {activeTab === "completed" && (
            <CompletedApplications apps={filteredApps} />
          )}
        </div>
      </div>
    </div>
  );
}
