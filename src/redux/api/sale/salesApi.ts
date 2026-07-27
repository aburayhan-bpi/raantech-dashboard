import { baseApi } from "../baseApi";
import { ICustomer } from "@/models/Customer";
import { IProduct } from "@/models/Product";
import {
  SaleStatus,
  SalePaymentStatus,
  SalePaymentMethod,
} from "@/types/backend";

export interface ISaleItem {
  _id?: string;
  product: IProduct;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale {
  _id: string;
  saleNo: string;
  customer: ICustomer;
  items: ISaleItem[];
  subTotal: number;
  discount: number;
  tax: number;
  shippingCharge: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  refundedAmount?: number;
  paymentStatus: SalePaymentStatus;
  paymentMethod: SalePaymentMethod;
  saleDate: string;
  courierDetails?: string;
  note?: string;
  status: SaleStatus;
  statusHistory?: {
    _id: string;
    status: SaleStatus;
    note?: string;
    updatedBy?: {
      _id: string;
      name: string;
    };
    date: string;
  }[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ISalePayment {
  _id: string;
  sale: string;
  amount: number;
  paymentMethod: SalePaymentMethod;
  paymentDate: string;
  note?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ISaleRefund {
  _id: string;
  sale: string;
  amount: number;
  refundMethod: string;
  refundDate: string;
  note?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SalesResponse {
  success: boolean;
  data: ISale[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreateSaleRequest {
  customer: {
    _id?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subTotal: number;
  discount?: number;
  tax?: number;
  shippingCharge?: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMethod: SalePaymentMethod;
  courierDetails?: string;
  note?: string;
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<
      { data: ISale[]; meta: { total: number; page: number; limit: number; totalPages: number } },
      { page?: number; limit?: number; search?: string; status?: string; paymentStatus?: string }
    >({
      query: (params) => {
        let url = `/sales?page=${params.page || 1}&limit=${params.limit || 10}`;
        if (params.search) url += `&search=${encodeURIComponent(params.search)}`;
        if (params.status) url += `&status=${encodeURIComponent(params.status)}`;
        if (params.paymentStatus) url += `&paymentStatus=${encodeURIComponent(params.paymentStatus)}`;
        return url;
      },
      providesTags: ["Sale"],
    }),
    
    getSaleById: builder.query<{ data: ISale }, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: "Sale", id }],
    }),

    createSale: builder.mutation<{ success: boolean; data: ISale; message: string }, CreateSaleRequest>({
      query: (data) => ({
        url: "/sales",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sale", "Customers", "Products"],
    }),

    getSalePayments: builder.query<{ success: boolean; history: ISalePayment[] }, string>({
      query: (saleId) => `/sales/${saleId}/payments`,
      providesTags: (result, error, saleId) => [{ type: "SalePayment", id: saleId }],
    }),

    addSalePayment: builder.mutation<
      { success: boolean; data: ISalePayment; message: string },
      { saleId: string; amount: number; paymentMethod: SalePaymentMethod; paymentDate?: string; note?: string }
    >({
      query: (data) => ({
        url: "/sales/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sale", "SalePayment"],
    }),

    getSaleRefunds: builder.query<{ success: boolean; history: ISaleRefund[] }, string>({
      query: (saleId) => `/sales/${saleId}/refunds`,
      providesTags: (result, error, saleId) => [{ type: "SaleRefund" as const, id: saleId }],
    }),

    addSaleRefund: builder.mutation<
      { success: boolean; data: ISaleRefund; message: string },
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
      { success: boolean; message: string; data: ISale },
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
      { success: boolean; message: string; data: ISale },
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
} = salesApi;
