import { baseApi } from "../baseApi";

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  buyingPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  tax: number;
  stock: number;
  alertQuantity: number;
  unit: string;
  sku?: string;
  barcode?: string;
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  tags: string[];
  isDeleted: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventoryValue: number;
  totalRetailValue: number;
}

export interface IProductsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: IProduct[];
}

export interface IProductResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IProduct;
}

export interface IProductStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IProductStats;
}

export interface ICreateProductPayload {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  buyingPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  tax?: number;
  stock: number;
  alertQuantity?: number;
  unit?: string;
  sku?: string;
  barcode?: string;
  images?: string[];
  status?: string;
  tags?: string[];
}

export type IUpdateProductPayload = Partial<ICreateProductPayload>;

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
