import {
  PurchasePaymentMethod,
  PurchasePaymentStatus,
  PurchaseStatus,
} from "@/types/backend";
import { baseApi } from "../baseApi";
import { IProduct } from "../product/productApi";
import { ISupplier } from "../supplier/supplierApi";

export interface IPurchaseItem {
  product: IProduct;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchase {
  _id: string;
  purchaseNo: string;
  supplier: ISupplier;
  items: IPurchaseItem[];

  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;

  paidAmount: number;
  dueAmount: number;

  paymentStatus: PurchasePaymentStatus;
  paymentMethod: PurchasePaymentMethod;

  purchaseDate: string;
  note?: string;
  status: PurchaseStatus;

  createdBy: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseResponse {
  data: IPurchase[];
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SinglePurchaseResponse {
  data: IPurchase;
  message: string;
}

export interface ICreatePurchasePayload {
  supplier: string;
  items: {
    product: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: PurchasePaymentMethod;
  purchaseDate?: string;
  note?: string;
}

export interface IPurchasePayment {
  _id: string;
  purchase: string;
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  paymentDate: string;
  note?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface IAddPaymentPayload {
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  paymentDate?: string;
  note?: string;
}

export const purchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query<
      PurchaseResponse,
      {
        search?: string;
        supplierId?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.supplierId)
          queryParams.append("supplierId", params.supplierId);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return {
          url: `/purchases${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Purchases"],
    }),

    getPurchaseById: builder.query<SinglePurchaseResponse, string>({
      query: (id) => ({
        url: `/purchases/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Purchases", id }],
    }),

    createPurchase: builder.mutation<
      SinglePurchaseResponse,
      ICreatePurchasePayload
    >({
      query: (data) => ({
        url: "/purchases",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Purchases", "Products", "Suppliers"],
    }),

    getPurchasePayments: builder.query<IPurchasePayment[], string>({
      query: (id) => ({
        url: `/purchases/${id}/payments`,
        method: "GET",
      }),
      transformResponse: (response: { data: { history: IPurchasePayment[] } }) =>
        response.data.history,
      providesTags: (_result, _error, id) => [
        { type: "Purchases", id: `payments-${id}` },
      ],
    }),

    addPurchasePayment: builder.mutation<
      IPurchasePayment,
      { id: string; data: IAddPaymentPayload }
    >({
      query: ({ id, data }) => ({
        url: `/purchases/${id}/payments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Purchases", id },
        { type: "Purchases", id: `payments-${id}` },
        "Purchases",
      ],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useGetPurchasePaymentsQuery,
  useAddPurchasePaymentMutation,
} = purchaseApi;
