import { Zap, Calendar, MapPin } from "lucide-react";
import { uploadUrlFromFilename } from "../../../libs/shared/ui";
import type { CompletedApplicationsProps } from "../../../libs/types";

export default function CompletedApplications({
  apps,
}: CompletedApplicationsProps) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No completed applications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div
          key={app._id}
          className="rounded-lg border border-border bg-background/50 p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Event Image */}
            {app.eventData?.eventImages?.[0] && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={uploadUrlFromFilename(
                      "events",
                      app.eventData.eventImages[0],
                    )}
                    alt={app.eventData.eventTitle || "Event"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Event Info */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <h3 className="font-semibold text-foreground truncate">
                  {app.eventData?.eventTitle || "Event"}
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {app.eventData?.eventDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(app.eventData.eventDate).toLocaleDateString()}
                  </div>
                )}
                {app.eventData?.eventLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {app.eventData.eventLocation}
                    </span>
                  </div>
                )}
              </div>
              {app.applicationNote && (
                <p className="text-sm text-muted-foreground italic line-clamp-2">
                  Note: {app.applicationNote}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
