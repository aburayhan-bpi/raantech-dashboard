import { baseApi } from "../baseApi";

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  alternatePhone?: string;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomerResponse {
  success: boolean;
  message: string;
  data: ICustomer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<ICustomerResponse, string>({
      query: (query) => ({
        url: `/customers${query ? `?${query}` : ""}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),
    getCustomerById: build.query<{ data: ICustomer }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),
    createCustomer: build.mutation<{ data: ICustomer }, Partial<ICustomer>>({
      query: (data) => ({
        url: "/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: build.mutation<
      { data: ICustomer },
      { id: string; data: Partial<ICustomer> }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Customers", id },
        "Customers",
      ],
    }),
    deleteCustomer: build.mutation<{ data: ICustomer }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
