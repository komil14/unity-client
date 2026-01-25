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
  // Accept either eventId or articleId; backend reuses articleId for both
  eventId?: string;
  articleId?: string;
}

export interface GetCommentsParams {
  eventId?: string;
  articleId?: string;
  page?: number;
  limit?: number;
}

export const commentsApi = api.injectEndpoints({
  overrideExisting: false,
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
      query: ({ commentContent, eventId, articleId }) => {
        const targetId = eventId ?? articleId;
        if (!targetId) {
          throw new Error("Either eventId or articleId must be provided");
        }
        return {
          url: "/comment/create",
          method: "POST",
          // Backend expects `articleId`; reuse eventId when provided
          body: {
            commentContent,
            articleId: targetId,
          },
        };
      },
      invalidatesTags: (_result, _err, { eventId, articleId }) => [
        { type: "Comment", id: eventId ?? articleId ?? "LIST" },
      ],
    }),
  }),
});

export const { useGetCommentsQuery, useCreateCommentMutation } = commentsApi;
