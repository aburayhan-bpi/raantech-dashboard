import { baseApi } from "../baseApi";
import {
  ICategoriesResponse,
  ICategoryResponse,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "@/types/global";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ICategoriesResponse, string | void>({
      query: (queryString: string | void) =>
        `/categories${queryString ? `?${queryString}` : ""}`,
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<ICategoryResponse, ICreateCategoryPayload>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<ICategoryResponse, IUpdateCategoryPayload>({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<ICategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
