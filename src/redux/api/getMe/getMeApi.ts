import { IGetProfileResponse } from "@/types/global";
import baseApi from "../baseApi";

const getMeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<IGetProfileResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<unknown, FormData>({
      query: (body) => ({
        url: "/auth/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery, useUpdateProfileMutation } =
  getMeApi;
