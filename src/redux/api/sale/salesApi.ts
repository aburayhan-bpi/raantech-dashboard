import { baseApi } from "../baseApi";
import { SalePaymentMethod } from "@/types/backend";
import {
  ISale,
  ISaleRefund,
  ICreateSaleRequest,
  SalesResponse,
  SingleSaleResponse,
  SalePaymentsResponse,
  SaleRefundsResponse,
  SingleSalePaymentResponse,
  SingleSaleRefundResponse,
} from "@/types/global";

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<
      SalesResponse,
      { page?: number; limit?: number; search?: string; status?: string; paymentStatus?: string; customer?: string }
    >({
      query: (params) => {
        let url = `/sales?page=${params.page || 1}&limit=${params.limit || 10}`;
        if (params.search) url += `&search=${encodeURIComponent(params.search)}`;
        if (params.status) url += `&status=${encodeURIComponent(params.status)}`;
        if (params.paymentStatus) url += `&paymentStatus=${encodeURIComponent(params.paymentStatus)}`;
        if (params.customer) url += `&customer=${encodeURIComponent(params.customer)}`;
        return url;
      },
      providesTags: ["Sale"],
    }),
    
    getSaleById: builder.query<SingleSaleResponse, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: "Sale", id }],
    }),

    createSale: builder.mutation<SingleSaleResponse, ICreateSaleRequest>({
      query: (data) => ({
        url: "/sales",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sale", "Customers", "Products"],
    }),

    getSalePayments: builder.query<SalePaymentsResponse, string>({
      query: (saleId) => `/sales/${saleId}/payments`,
      providesTags: (result, error, saleId) => [{ type: "SalePayment", id: saleId }],
    }),

    addSalePayment: builder.mutation<
      SingleSalePaymentResponse,
      { saleId: string; amount: number; paymentMethod: SalePaymentMethod; paymentDate?: string; note?: string }
    >({
      query: (data) => ({
        url: "/sales/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sale", "SalePayment"],
    }),

    getSaleRefunds: builder.query<SaleRefundsResponse, string>({
      query: (saleId) => `/sales/${saleId}/refunds`,
      providesTags: (result, error, saleId) => [{ type: "SaleRefund" as const, id: saleId }],
    }),

    addSaleRefund: builder.mutation<
      SingleSaleRefundResponse,
      { id: string; data: Partial<ISaleRefund> }
    >({
      query: ({ id, data }) => ({
        url: `/sales/${id}/refunds`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sale" as const, id },
        "Sale",
        { type: "SaleRefund" as const, id },
      ],
    }),

    updateSale: builder.mutation<
      SingleSaleResponse,
      { id: string; data: Partial<ISale> & { paymentAmount?: number; paymentMethod?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sale", id },
        "Sale",
      ],
    }),

    partialReturnSale: builder.mutation<
      SingleSaleResponse,
      { id: string; returnItems: { productId: string; returnQuantity: number }[] }
    >({
      query: ({ id, returnItems }) => ({
        url: `/sales/${id}/return`,
        method: "POST",
        body: { returnItems },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sale" as const, id },
        "Sale",
        "Products",
      ],
    }),
    bulkDeleteSales: builder.mutation<{ success: boolean; message: string }, { ids: string[] }>({
      query: (data) => ({
        url: "/sales/bulk",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Sale", "Products"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useGetSalePaymentsQuery,
  useAddSalePaymentMutation,
  useGetSaleRefundsQuery,
  useAddSaleRefundMutation,
  useUpdateSaleMutation,
  usePartialReturnSaleMutation,
  useBulkDeleteSalesMutation,
} = salesApi;
