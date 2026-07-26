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
  paymentStatus: SalePaymentStatus;
  paymentMethod: SalePaymentMethod;
  saleDate: string;
  courierDetails?: string;
  note?: string;
  status: SaleStatus;
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
  }),
  overrideExisting: true,
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useGetSalePaymentsQuery,
  useAddSalePaymentMutation,
  useUpdateSaleMutation,
} = salesApi;
