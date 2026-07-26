import { baseApi } from "../baseApi";

export interface ISupplier {
  _id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  status: "ACTIVE" | "INACTIVE";
  totalDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierResponse {
  data: ISupplier[];
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleSupplierResponse {
  data: ISupplier;
  message: string;
}

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<
      SupplierResponse,
      string | void
    >({
      query: (queryString) => ({
        url: `/suppliers${queryString ? `?${queryString}` : ""}`,
        method: "GET",
      }),
      providesTags: ["Suppliers"],
    }),

    getSupplierById: builder.query<SingleSupplierResponse, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Suppliers", id }],
    }),

    createSupplier: builder.mutation<SingleSupplierResponse, Partial<ISupplier>>({
      query: (data) => ({
        url: "/suppliers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Suppliers"],
    }),

    updateSupplier: builder.mutation<
      SingleSupplierResponse,
      { id: string; data: Partial<ISupplier> }
    >({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Suppliers",
        { type: "Suppliers", id },
      ],
    }),

    deleteSupplier: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Suppliers"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
