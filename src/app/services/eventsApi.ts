import { api } from "./api";

export type MemberData = {
  _id: string;
  memberNick: string;
  memberType: string;
  memberStatus: string;
  memberImage?: string;
  memberDesc?: string;
};

export type EventDto = {
  _id: string;
  eventTitle: string;
  eventDesc: string;
  eventLocation: string;
  eventDate: string;
  eventCapacity: number;
  eventJoined: number;
  eventImages: string[];
  eventPoints: number;
  memberId: string;
  eventLikes: number;
  eventViews: number;
  createdAt: string;
  updatedAt: string;
  memberData?: MemberData;
};

export type GetEventsParams = {
  page?: number;
  limit?: number;
  order?: string;
  direction?: "asc" | "desc";
  search?: string;
  startDate?: string;
  endDate?: string;
  memberId?: string;
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
  }),
});

export const { useGetEventsQuery, useGetEventByIdQuery } = eventsApi;
