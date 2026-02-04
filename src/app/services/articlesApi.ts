import { api } from "./api";
import type {
  Article,
  ArticleDto,
  ArticleInput,
  ArticleInquiry,
  GetArticlesResponse,
} from "@/libs/types/article";

export interface CreateArticleInput {
  boardTitle: string;
  boardContent: string;
  boardImage?: File;
}

export type {
  Article,
  ArticleDto,
  ArticleInput,
  ArticleInquiry,
  GetArticlesResponse,
};

const normalizeArticlesResponse = (
  response: GetArticlesResponse | Article[]
): GetArticlesResponse => {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: 1,
      limit: response.length,
      total: response.length,
      totalPages: 1,
    };
  }

  return response;
};

export const articlesApi = api.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /board/all - Fetch articles with pagination and search
     */
    getArticles: build.query<GetArticlesResponse, ArticleInquiry | void>({
      query: (params) => ({
        url: "/board/all",
        params: params
          ? {
              page: params.page ?? 1,
              limit: params.limit ?? 10,
              order: params.order ?? "createdAt",
              search: params.search ?? undefined,
            }
          : undefined,
      }),
      transformResponse: (response: GetArticlesResponse | Article[]) =>
        normalizeArticlesResponse(response),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((article) => ({
                type: "Article" as const,
                id: article._id,
              })),
              { type: "Article" as const, id: "LIST" },
            ]
          : [{ type: "Article" as const, id: "LIST" }],
    }),

    /**
     * GET /board/detail/:id - Fetch single article with view increment
     */
    getArticleById: build.query<ArticleDto, string>({
      query: (id) => `/board/detail/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Article", id }],
    }),

    /**
     * POST /board/create - Create new article
     */
    createArticle: build.mutation<ArticleDto, CreateArticleInput>({
      query: (body) => {
        const formData = new FormData();
        formData.append("boardTitle", body.boardTitle);
        formData.append("boardContent", body.boardContent);

        if (body.boardImage) {
          formData.append("boardImage", body.boardImage);
        }

        return {
          url: "/board/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Article", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Optionally update the list with the newly created article
          dispatch(
            articlesApi.util.updateQueryData(
              "getArticles",
              undefined,
              (draft) => {
                if (draft?.items) {
                  draft.items.unshift(data);
                  draft.total = (draft.total ?? 0) + 1;
                }
              },
            ),
          );
        } catch {
          // ignore
        }
      },
    }),

    /**
     * GET /board/all with memberId filter - Fetch author's articles
     */
    getArticlesByAuthor: build.query<
      GetArticlesResponse,
      { memberId: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/board/all",
        params: {
          memberId: params.memberId,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          order: "createdAt",
        },
      }),
      transformResponse: (response: GetArticlesResponse | Article[]) =>
        normalizeArticlesResponse(response),
      providesTags: (result, _err, arg) =>
        result?.items
          ? [
              ...result.items.map((article) => ({
                type: "Article" as const,
                id: article._id,
              })),
              { type: "Article" as const, id: `AUTHOR_${arg.memberId}` },
            ]
          : [{ type: "Article" as const, id: `AUTHOR_${arg.memberId}` }],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useGetArticlesByAuthorQuery,
  useLazyGetArticlesQuery,
  useLazyGetArticleByIdQuery,
} = articlesApi;
