import { api } from "./api";
import type {
  MemberData,
  EventDto,
  GetEventsParams,
  WeeklyPopularParams,
  WeeklyPopularEventDto,
} from "../../lib/types/api";

export type {
  MemberData,
  EventDto,
  GetEventsParams,
  WeeklyPopularParams,
  WeeklyPopularEventDto,
};

export const eventsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<EventDto[], GetEventsParams | void>({
      query: (params) => ({
        url: "/event/all",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Event" as const, id: e._id })),
              { type: "Event" as const, id: "LIST" },
            ]
          : [{ type: "Event" as const, id: "LIST" }],
    }),
    getEventById: build.query<EventDto, string>({
      query: (id) => `/event/detail/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Event", id }],
    }),

    getWeeklyPopularEvents: build.query<
      WeeklyPopularEventDto[],
      WeeklyPopularParams | void
    >({
      query: (params) => ({
        url: "/event/popular-weekly",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Event" as const, id: e._id })),
              { type: "Event" as const, id: "POPULAR_WEEKLY" },
            ]
          : [{ type: "Event" as const, id: "POPULAR_WEEKLY" }],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetWeeklyPopularEventsQuery,
} = eventsApi;
