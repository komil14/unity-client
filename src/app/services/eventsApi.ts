import { api } from "./api";
import type {
  MemberData,
  EventDto,
  GetEventsParams,
  GetEventsResponse,
  WeeklyPopularParams,
  WeeklyPopularEventDto,
} from "../../libs/types/api";

export interface CreateEventInput {
  eventTitle: string;
  eventDesc: string;
  eventLocation: string;
  eventDate: string; // ISO string
  eventCapacity: number;
  eventPoints?: number;
  eventImages?: File[];
}

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

    createEvent: build.mutation<EventDto, CreateEventInput>({
      query: (body) => {
        const formData = new FormData();
        formData.append("eventTitle", body.eventTitle);
        formData.append("eventDesc", body.eventDesc);
        formData.append("eventLocation", body.eventLocation);
        formData.append("eventDate", body.eventDate);
        formData.append("eventCapacity", String(body.eventCapacity));
        if (body.eventPoints !== undefined && body.eventPoints !== null) {
          formData.append("eventPoints", String(body.eventPoints));
        }
        if (body.eventImages && body.eventImages.length > 0) {
          body.eventImages.forEach((file) =>
            formData.append("eventImages", file),
          );
        }

        return {
          url: "/event/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "Event", id: "LIST" },
        { type: "Event", id: "POPULAR_WEEKLY" },
      ],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetWeeklyPopularEventsQuery,
  useViewEventMutation,
  useCreateEventMutation,
} = eventsApi;
