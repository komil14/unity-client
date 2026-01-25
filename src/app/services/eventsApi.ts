import { api } from "./api";
import type {
  MemberData,
  EventDto,
  GetEventsParams,
  GetEventsResponse,
  WeeklyPopularParams,
  WeeklyPopularEventDto,
} from "../../libs/types/api";

export type {
  MemberData,
  EventDto,
  GetEventsParams,
  GetEventsResponse,
  WeeklyPopularParams,
  WeeklyPopularEventDto,
};

export const eventsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<GetEventsResponse, GetEventsParams | void>({
      query: (params) => ({
        url: "/event/all",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((e) => ({
                type: "Event" as const,
                id: e._id,
              })),
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

    viewEvent: build.mutation<{ eventViews: number }, string>({
      query: (id) => ({
        url: `/event/view/${id}`,
        method: "POST",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // Update the cached getEventById data in real-time
          dispatch(
            eventsApi.util.updateQueryData("getEventById", id, (draft) => {
              if (!draft) return;
              (draft as any).eventViews = data.eventViews;
            }),
          );
        } catch {
          // ignore
        }
      },
      invalidatesTags: (_result, _err, id) => [
        { type: "Event" as const, id },
        { type: "Event" as const, id: "LIST" },
        { type: "Event" as const, id: "POPULAR_WEEKLY" },
      ],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetWeeklyPopularEventsQuery,
  useViewEventMutation,
} = eventsApi;
