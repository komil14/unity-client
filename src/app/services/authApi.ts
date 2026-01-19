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
    }),
    signup: build.mutation<AuthResponse, SignupInput>({
      query: (body) => ({
        url: "/member/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Me", id: "ME" }],
    }),
    updateProfile: build.mutation<MemberDto, UpdateProfileInput>({
      query: (body) => {
        console.log("updateProfile query called with body:", body);
        return {
          url: "/member/profile",
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, err) => {
        console.log(
          "updateProfile invalidatesTags - result:",
          result,
          "error:",
          err,
        );
        return [{ type: "Me", id: "ME" }];
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log("updateProfile onQueryStarted - arg:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("updateProfile - got data response:", data);
          // Update the cached auth data
          dispatch(
            authApi.util.updateQueryData("checkAuth", undefined, (draft) => {
              console.log(
                "Updating cache - draft.member before:",
                draft.member,
              );
              if (draft.member) {
                Object.assign(draft.member, data);
                console.log(
                  "Updated cache - draft.member after:",
                  draft.member,
                );
              }
            }),
          );
        } catch (err) {
          console.error("Failed to update cache:", err);
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
