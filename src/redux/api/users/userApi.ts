import { baseApi } from "../baseApi";
import { 
  IUsersResponse, 
  IInviteUserResponse,
  IUpdateUserResponse,
  IDeleteUserResponse,
  IInviteUserPayload, 
  IUpdateUserPayload 
} from "@/types/global";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<IUsersResponse, void>({
      query: () => "/users",
      providesTags: ["Users"],
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
  }),
});

export const {
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
