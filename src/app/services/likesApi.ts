import { api } from "./api";

export type LikeGroup = "MEMBER" | "EVENT" | "GROUP" | "ARTICLE" | "COMMENT";

export type ToggleLikeInput = {
  likeGroup: LikeGroup;
  likeRefId: string;
};

export type ToggleLikeResponse = {
  status: "liked" | "unliked";
  data: unknown;
};

export const likesApi = api.injectEndpoints({
  endpoints: (build) => ({
    toggleLike: build.mutation<ToggleLikeResponse, ToggleLikeInput>({
      query: (body) => ({
        url: "/like/toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => {
        switch (arg.likeGroup) {
          case "EVENT":
            return [
              { type: "Event" as const, id: arg.likeRefId },
              { type: "Event" as const, id: "LIST" },
            ];
          case "GROUP":
            return [{ type: "Group" as const, id: arg.likeRefId }];
          case "MEMBER":
            return [{ type: "Organizer" as const, id: arg.likeRefId }];
          default:
            return [];
        }
      },
    }),
  }),
});

export const { useToggleLikeMutation } = likesApi;
