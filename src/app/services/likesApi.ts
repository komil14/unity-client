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

export type CheckLikesBatchInput = {
  likeGroup: LikeGroup;
  likeRefIds: string[];
};

export type CheckLikesBatchResponse = {
  likedRefIds: string[];
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
        const likeTag = {
          type: "Like" as const,
          id: `${arg.likeGroup}:${arg.likeRefId}`,
        };

        switch (arg.likeGroup) {
          case "EVENT":
            return [
              likeTag,
              { type: "Event" as const, id: arg.likeRefId },
              { type: "Event" as const, id: "LIST" },
            ];
          case "GROUP":
            return [likeTag, { type: "Group" as const, id: arg.likeRefId }];
          case "MEMBER":
            return [likeTag, { type: "Organizer" as const, id: arg.likeRefId }];
          default:
            return [likeTag];
        }
      },
    }),

    checkLikesBatch: build.query<CheckLikesBatchResponse, CheckLikesBatchInput>(
      {
        query: (body) => ({
          url: "/like/exists-batch",
          method: "POST",
          body,
        }),
        providesTags: (_result, _error, arg) =>
          arg.likeRefIds.map((id) => ({
            type: "Like" as const,
            id: `${arg.likeGroup}:${id}`,
          })),
      }
    ),
  }),
});

export const { useToggleLikeMutation, useCheckLikesBatchQuery } = likesApi;
