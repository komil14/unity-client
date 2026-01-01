import { api } from "./api";

export type OrganizerDto = {
  _id: string;
  memberType: string;
  memberStatus: string;
  memberNick: string;
  memberDesc?: string;
  memberImage?: string;
  memberViews?: number;
  memberLikes?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  eventsOrganizedCount?: number;
  groupsOrganizedCount?: number;
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
  }),
});

export const { useGetOrganizersQuery, useGetOrganizerByIdQuery } =
  organizersApi;
