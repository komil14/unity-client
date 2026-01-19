import { api } from "./api";
import type {
  OrganizerDto,
  GetOrganizersParams,
  OrganizerDetailDto,
} from "../../lib/types/api";

export type { OrganizerDto, GetOrganizersParams, OrganizerDetailDto };

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

    viewOrganizer: build.mutation<{ memberViews: number }, string>({
      query: (id) => ({
        url: `/organizer/view/${id}`,
        method: "POST",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            organizersApi.util.updateQueryData(
              "getOrganizerById",
              id,
              (draft) => {
                if (!draft) return;
                (draft as any).memberViews = data.memberViews;
              },
            ),
          );
        } catch {
          // ignore
        }
      },
      invalidatesTags: (_result, _err, id) => [
        { type: "Organizer" as const, id },
        { type: "Organizer" as const, id: "LIST" },
        { type: "Organizer" as const, id: "TOP" },
      ],
    }),
  }),
});

export const {
  useGetOrganizersQuery,
  useGetOrganizerByIdQuery,
  useGetTopOrganizersQuery,
  useViewOrganizerMutation,
} = organizersApi;
