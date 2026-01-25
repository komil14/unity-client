import { api } from "./api";

export interface CommentDto {
  _id: string;
  commentStatus: string;
  commentContent: string;
  articleId: string;
  memberId: string;
  commentLikes: number;
  createdAt: string;
  updatedAt: string;
  memberData?: {
    _id: string;
    memberNick: string;
    memberImage?: string;
    memberType: string;
    isVerified?: boolean;
  };
}

export interface CommentInput {
  commentContent: string;
  articleId: string;
}

export interface GetCommentsParams {
  eventId?: string;
  articleId?: string;
  page?: number;
  limit?: number;
}

export const commentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query<CommentDto[], GetCommentsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.eventId) queryParams.append("eventId", params.eventId);
        if (params?.articleId)
          queryParams.append("articleId", params.articleId);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));

        return {
          url: "/comment/all",
          params: Object.fromEntries(queryParams),
        };
      },
      providesTags: (result, _err, params) => [
        {
          type: "Comment",
          id: params?.eventId || params?.articleId || "LIST",
        },
      ],
    }),

    createComment: build.mutation<CommentDto, CommentInput>({
      query: (input) => ({
        url: "/comment/create",
        method: "POST",
        body: input,
      }),
      async onQueryStarted({ articleId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Invalidate comments list for this event/article
          dispatch(
            commentsApi.util.invalidateTags([
              { type: "Comment", id: articleId },
            ]),
          );
        } catch {
          // ignore
        }
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: "Comment", id: result.articleId }]
          : [{ type: "Comment", id: "LIST" }],
    }),
  }),
});

export const { useGetCommentsQuery, useCreateCommentMutation } = commentsApi;
