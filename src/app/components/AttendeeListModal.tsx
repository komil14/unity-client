import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../libs/components/ui/dialog";
import { Button } from "../../libs/components/ui/button";
import { Badge } from "../../libs/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../libs/components/ui/avatar";
import { ScrollArea } from "../../libs/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../libs/components/ui/tabs";
import {
  useGetEventAttendeesQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
} from "../services/applicationsApi";
import { Check, X, User, Clock, CheckCircle } from "lucide-react";
import { useToast } from "../../libs/components/ui/toast";

interface AttendeeListModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const AttendeeListModal: React.FC<AttendeeListModalProps> = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pending");

  const { data: attendees = [], isLoading } = useGetEventAttendeesQuery(
    { eventId, limit: 100 },
    { skip: !isOpen },
  );

  const [approveApplication, { isLoading: isApproving }] =
    useApproveApplicationMutation();
  const [rejectApplication, { isLoading: isRejecting }] =
    useRejectApplicationMutation();

  const pendingAttendees = attendees.filter(
    (a) => a.applicationStatus === "PENDING",
  );
  const approvedAttendees = attendees.filter(
    (a) => a.applicationStatus === "APPROVED",
  );
  const rejectedAttendees = attendees.filter(
    (a) => a.applicationStatus === "REJECTED",
  );

  const handleApprove = async (applicationId: string, memberName: string) => {
    try {
      await approveApplication({
        applicationId,
        eventId,
      }).unwrap();

      showToast(`✓ ${memberName} approved!`);
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to approve", "error");
    }
  };

  const handleReject = async (applicationId: string, memberName: string) => {
    try {
      await rejectApplication({
        applicationId,
        eventId,
      }).unwrap();

      showToast(`✓ ${memberName} rejected`);
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to reject", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300"
          >
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMemberImageUrl = (memberImage?: string, memberNick?: string) => {
    if (memberImage) {
      if (memberImage.startsWith("http")) return memberImage;
      const apiBase =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        window.location.origin;
      return `${apiBase}/uploads/members/${memberImage}`;
    }
    // Use Dicebear API for default avatar
    if (memberNick) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberNick)}`;
    }
    return undefined;
  };

  const renderAttendeeList = (attendeesList: typeof attendees) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      );
    }

    if (attendeesList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <User className="w-12 h-12 mb-2 opacity-30" />
          <p>No applicants in this category</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {attendeesList.map((attendee) => (
            <div
              key={attendee._id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-12 h-12 border-2 border-purple-100">
                  <AvatarImage
                    src={getMemberImageUrl(attendee.memberData.memberImage, attendee.memberData.memberNick)}
                    alt={attendee.memberData.memberNick}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                    {attendee.memberData.memberNick.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {attendee.memberData.memberNick}
                    </h4>
                    {attendee.memberData.isVerified && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {attendee.memberData.memberDesc || "No bio provided"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applied: {new Date(attendee.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(attendee.applicationStatus)}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {attendee.applicationStatus === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() =>
                        handleApprove(
                          attendee._id,
                          attendee.memberData.memberNick,
                        )
                      }
                      disabled={isApproving || isRejecting}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() =>
                        handleReject(
                          attendee._id,
                          attendee.memberData.memberNick,
                        )
                      }
                      disabled={isApproving || isRejecting}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Manage Applicants
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{eventTitle}</p>
          </DialogHeader>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingAttendees.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white text-xs px-2">
                    {pendingAttendees.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="relative">
                Approved
                {approvedAttendees.length > 0 && (
                  <Badge className="ml-2 bg-green-500 text-white text-xs px-2">
                    {approvedAttendees.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="relative">
                Rejected
                {rejectedAttendees.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-2">
                    {rejectedAttendees.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              {renderAttendeeList(pendingAttendees)}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {renderAttendeeList(approvedAttendees)}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {renderAttendeeList(rejectedAttendees)}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Total Applicants:{" "}
              <span className="font-semibold">{attendees.length}</span>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendeeListModal;
