import { api } from "./api";

export type MemberDto = {
  _id: string;
  memberType: "USER" | "ORG" | "ADMIN" | string;
  memberStatus: "ACTIVE" | "BLOCK" | "DELETE" | "PENDING" | string;
  memberNick: string;
  memberPhone: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints?: number;
  memberLikes?: number;
  memberViews?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  member: MemberDto;
  accessToken: string;
};

export type LoginInput = {
  memberNick: string;
  memberPassword: string;
};

export type SignupInput = {
  memberType: "USER" | "ORG";
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
};

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    checkAuth: build.query<{ member: MemberDto }, void>({
      query: () => "/member/check-auth",
      providesTags: [{ type: "Me", id: "ME" }],
    }),
    login: build.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: "/member/login",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Me", id: "ME" }],
    }),
    signup: build.mutation<AuthResponse, SignupInput>({
      query: (body) => ({
        url: "/member/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Me", id: "ME" }],
    }),
    logout: build.mutation<{ ok: boolean }, void>({
      query: () => ({ url: "/member/logout", method: "POST" }),
      invalidatesTags: [{ type: "Me", id: "ME" }],
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
} = authApi;
