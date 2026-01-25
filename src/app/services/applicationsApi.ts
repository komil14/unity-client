import { api } from "./api";
import type {
  ApplicationDto,
  JoinEventInput,
  EventAttendeeDto,
} from "../../libs/types/api";

export type { ApplicationDto, JoinEventInput };

export const applicationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    joinEvent: build.mutation<ApplicationDto, JoinEventInput>({
      query: (body) => ({
        url: "/application/join",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Application", id: "MY" },
        { type: "Event", id: arg.eventId },
        { type: "Event", id: "LIST" },
      ],
    }),
    getMyApplications: build.query<ApplicationDto[], void>({
      query: () => "/application/my",
      providesTags: [{ type: "Application", id: "MY" }],
    }),

    checkApplicationStatus: build.query<ApplicationDto | null, string>({
      query: (eventId) => `/application/check/${eventId}`,
      providesTags: (_result, _err, eventId) => [
        { type: "Application", id: `STATUS-${eventId}` },
      ],
    }),

    cancelApplication: build.mutation<ApplicationDto, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/application/cancel/${eventId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, { eventId }) => [
        { type: "Application", id: "MY" },
        { type: "Application", id: `STATUS-${eventId}` },
        { type: "Event", id: eventId },
        { type: "Event", id: "LIST" },
      ],
    }),

    getEventAttendees: build.query<
      EventAttendeeDto[],
      { eventId: string; limit?: number }
    >({
      query: ({ eventId, limit = 12 }) => ({
        url: `/event/${eventId}/attendees`,
        params: { limit },
      }),
      providesTags: (_result, _err, { eventId }) => [
        { type: "Application", id: `ATTENDEES-${eventId}` },
      ],
    }),

    approveApplication: build.mutation<
      ApplicationDto,
      { applicationId: string }
    >({
      query: ({ applicationId }) => ({
        url: `/application/approve/${applicationId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, { applicationId }) => [
        { type: "Application", id: applicationId },
        { type: "Application", id: "LIST" },
      ],
    }),

    rejectApplication: build.mutation<
      ApplicationDto,
      { applicationId: string }
    >({
      query: ({ applicationId }) => ({
        url: `/application/reject/${applicationId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _err, { applicationId }) => [
        { type: "Application", id: applicationId },
        { type: "Application", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useJoinEventMutation,
  useGetMyApplicationsQuery,
  useGetEventAttendeesQuery,
  useCheckApplicationStatusQuery,
  useCancelApplicationMutation,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
} = applicationsApi;
