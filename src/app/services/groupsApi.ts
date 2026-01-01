import { api } from "./api";

export type MemberData = {
  _id: string;
  memberNick: string;
  memberType: string;
  memberStatus: string;
  memberImage?: string;
  memberDesc?: string;
  isVerified?: boolean;
};

export type GroupDto = {
  _id: string;
  groupStatus: string;
  groupName: string;
  groupDesc: string;
  groupImage?: string;
  groupCategories?: string[];
  memberId: string;
  memberCount: number;
  groupLikes: number;
  groupViews: number;
  createdAt: string;
  updatedAt: string;
  memberData?: MemberData;
};

export type GroupDetailDto = GroupDto & {
  meJoined?: boolean;
  groupMemberRole?: string;
  joinDate?: string;
};

export type GetGroupsParams = {
  page?: number;
  limit?: number;
  order?: string;
  search?: string;
  memberId?: string;
};

export type JoinGroupInput = {
  groupId: string;
};

export type JoinGroupResponse = {
  joined: boolean;
  message?: string;
};

export type CreateGroupInput = {
  groupName: string;
  groupDesc: string;
  groupCategories?: string[] | string;
  groupImage?: File;
};

export type UpdateGroupInput = {
  _id: string;
  groupName?: string;
  groupDesc?: string;
  groupCategories?: string[] | string;
  groupImage?: File;
};

function toCategoriesValue(
  value: string[] | string | undefined
): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.join(",");
  return value;
}

export const groupsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGroups: build.query<GroupDto[], GetGroupsParams | void>({
      query: (params) => ({
        url: "/group/all",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((g) => ({ type: "Group" as const, id: g._id })),
              { type: "Group" as const, id: "LIST" },
            ]
          : [{ type: "Group" as const, id: "LIST" }],
    }),

    getGroupById: build.query<GroupDetailDto, string>({
      query: (id) => `/group/detail/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Group", id }],
    }),

    joinGroup: build.mutation<JoinGroupResponse, JoinGroupInput>({
      query: (body) => ({
        url: "/group/join",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Group", id: arg.groupId },
        { type: "Group", id: "LIST" },
      ],
    }),

    getMyGroups: build.query<GroupDto[], void>({
      query: () => "/group/my",
      providesTags: [{ type: "Group", id: "MY" }],
    }),

    createGroup: build.mutation<GroupDto, CreateGroupInput>({
      query: (input) => {
        const formData = new FormData();
        formData.set("groupName", input.groupName);
        formData.set("groupDesc", input.groupDesc);
        const cats = toCategoriesValue(input.groupCategories);
        if (cats) formData.set("groupCategories", cats);
        if (input.groupImage) formData.set("groupImage", input.groupImage);

        return {
          url: "/group/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Group", id: "LIST" }],
    }),

    updateGroup: build.mutation<GroupDto, UpdateGroupInput>({
      query: (input) => {
        const formData = new FormData();
        formData.set("_id", input._id);
        if (input.groupName !== undefined)
          formData.set("groupName", input.groupName);
        if (input.groupDesc !== undefined)
          formData.set("groupDesc", input.groupDesc);
        const cats = toCategoriesValue(input.groupCategories);
        if (cats !== undefined) formData.set("groupCategories", cats);
        if (input.groupImage) formData.set("groupImage", input.groupImage);

        return {
          url: "/group/update",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: "Group", id: arg._id },
        { type: "Group", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useJoinGroupMutation,
  useGetMyGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
} = groupsApi;
