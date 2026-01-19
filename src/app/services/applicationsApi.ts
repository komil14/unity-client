import { api } from "./api";
import type { ApplicationDto, JoinEventInput } from "../../lib/types/api";

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
  }),
});

export const { useJoinEventMutation, useGetMyApplicationsQuery } =
  applicationsApi;
