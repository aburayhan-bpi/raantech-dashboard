import { baseApi } from "../baseApi";
import { 
  IUsersResponse, 
  IInviteUserResponse,
  IUpdateUserResponse,
  IDeleteUserResponse,
  IInviteUserPayload, 
  IUpdateUserPayload,
  IBaseResponse,
  ITeamUser
} from "@/types/global";

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query<IBaseResponse<ITeamUser>, void>({
      query: () => "/profile",
      providesTags: ["Users"],
    }),
    updateProfile: builder.mutation<IBaseResponse<ITeamUser>, { name?: string; profileImage?: string; address?: string }>({
      query: (payload) => ({
        url: "/profile",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Users"],
    }),
    requestPasswordOtp: builder.mutation<IBaseResponse<null>, { currentPassword: string }>({
      query: (payload) => ({
        url: "/profile/password/request-otp",
        method: "POST",
        body: payload,
      }),
    }),
    changePassword: builder.mutation<IBaseResponse<null>, Record<string, string>>({
      query: (payload) => ({
        url: "/profile/password",
        method: "PUT",
        body: payload,
      }),
    }),
    getUsers: builder.query<IUsersResponse, string | void>({
      query: (queryString) => `/users${queryString ? `?${queryString}` : ''}`,
      providesTags: ["Users"],
    }),
    getUserById: builder.query<IBaseResponse<ITeamUser>, string>({
      query: (id) => `/users/${id}`,
    }),
    inviteUser: builder.mutation<IInviteUserResponse, IInviteUserPayload>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<IUpdateUserResponse, { id: string; payload: IUpdateUserPayload }>({
      query: ({ id, payload }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation<IDeleteUserResponse, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    restoreUser: builder.mutation<IBaseResponse<ITeamUser>, string>({
      query: (id) => ({
        url: `/users/${id}/restore`,
        method: "PUT",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRequestPasswordOtpMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useLazyGetUserByIdQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} = userApi;
