import { baseApi } from "../baseApi";
import {
  ICreateProductPayload,
  IUpdateProductPayload,
  IProductsResponse,
  IProductResponse,
  IProductStatsResponse,
} from "@/types/global";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<IProductsResponse, string | void>({
      query: (queryString: string | void) =>
        `/products${queryString ? `?${queryString}` : ""}`,
      providesTags: ["Products"],
    }),
    getProductBySlug: builder.query<IProductResponse, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, arg) => [{ type: "Products", id: arg }],
    }),
    getProductStats: builder.query<IProductStatsResponse, void>({
      query: () => `/products/stats`,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<IProductResponse, ICreateProductPayload>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation<
      IProductResponse,
      { slug: string; data: IUpdateProductPayload }
    >({
      query: ({ slug, data }) => ({
        url: `/products/${slug}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation<void, { slug: string; hard?: boolean }>({
      query: ({ slug, hard }) => ({
        url: `/products/${slug}${hard ? '?hard=true' : ''}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
