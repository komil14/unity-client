import { api } from "./api";
import type {
  MemberDto,
  AuthResponse,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
} from "../../libs/types/api";

export type {
  MemberDto,
  AuthResponse,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("checkAuth", undefined, (draft) => {
              draft.member = data.member;
            }),
          );
        } catch {
          // let invalidatesTags handle refetch on error
        }
      },
    }),
    signup: build.mutation<AuthResponse, SignupInput>({
      query: (body) => ({
        url: "/member/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Me", id: "ME" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData("checkAuth", undefined, (draft) => {
              draft.member = data.member;
            }),
          );
        } catch {
          // let invalidatesTags handle refetch on error
        }
      },
    }),
    updateProfile: build.mutation<MemberDto, UpdateProfileInput | FormData>({
      query: (body) => {
        // If body is FormData (image upload), send as-is
        // If body is a plain object (text fields), convert to FormData for multer compatibility
        let formBody: FormData;
        if (body instanceof FormData) {
          formBody = body;
        } else {
          formBody = new FormData();
          Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formBody.append(key, String(value));
            }
          });
        }
        return {
          url: "/member/profile",
          method: "POST",
          body: formBody,
        };
      },
      invalidatesTags: () => {
        return [{ type: "Me", id: "ME" }];
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update the cached auth data
          dispatch(
            authApi.util.updateQueryData("checkAuth", undefined, (draft) => {
              if (draft.member) {
                Object.assign(draft.member, data);
              }
            }),
          );
        } catch {
          // Cache update failed silently
        }
      },
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
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApi;
