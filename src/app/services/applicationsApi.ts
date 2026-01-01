import { api } from "./api";

export type ApplicationDto = {
  _id: string;
  applicationStatus: string;
  eventId: string;
  memberId: string;
  applicationNote?: string;
  createdAt?: string;
  updatedAt?: string;
  eventData?: any;
};

export type JoinEventInput = {
  eventId: string;
  applicationNote?: string;
};

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
  }),
});

export const { useJoinEventMutation, useGetMyApplicationsQuery } =
  applicationsApi;
