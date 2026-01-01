import { api } from "./api";

export type OrganizerDto = {
  _id: string;
  memberType: string;
  memberStatus: string;
  memberNick: string;
  memberDesc?: string;
  memberImage?: string;
  bannerImage?: string;
  memberViews?: number;
  memberLikes?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  eventsOrganizedCount?: number;
  groupsOrganizedCount?: number;
  // Top organizers aggregates
  eventsCount?: number;
  eventsLikesTotal?: number;
  eventsViewsTotal?: number;
  articlesCount?: number;
  articleCommentsCount?: number;
  topScore?: number;
};

export type GetOrganizersParams = {
  page?: number;
  limit?: number;
  order?: string;
  search?: string;
  onlyActive?: boolean;
};

export type OrganizerDetailDto = OrganizerDto & {
  organizedEvents?: any[];
  organizedGroups?: any[];
};

export const organizersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrganizers: build.query<OrganizerDto[], GetOrganizersParams | void>({
      query: (params) => ({
        url: "/organizer/all",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: "Organizer" as const, id: o._id })),
              { type: "Organizer" as const, id: "LIST" },
            ]
          : [{ type: "Organizer" as const, id: "LIST" }],
    }),

    getOrganizerById: build.query<OrganizerDetailDto, string>({
      query: (id) => `/organizer/detail/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Organizer", id }],
    }),

    getTopOrganizers: build.query<OrganizerDto[], { limit?: number } | void>({
      query: (params) => ({
        url: "/organizer/top",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: "Organizer" as const, id: o._id })),
              { type: "Organizer" as const, id: "TOP" },
            ]
          : [{ type: "Organizer" as const, id: "TOP" }],
    }),
  }),
});

export const {
  useGetOrganizersQuery,
  useGetOrganizerByIdQuery,
  useGetTopOrganizersQuery,
} = organizersApi;
