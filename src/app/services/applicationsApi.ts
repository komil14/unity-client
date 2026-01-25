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
  }),
});

export const {
  useJoinEventMutation,
  useGetMyApplicationsQuery,
  useGetEventAttendeesQuery,
} = applicationsApi;
