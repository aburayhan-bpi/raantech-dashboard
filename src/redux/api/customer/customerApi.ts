import { baseApi } from "../baseApi";
import { ICustomer, ICustomerResponse, ISingleCustomerResponse } from "@/types/global";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<ICustomerResponse, string>({
      query: (query) => ({
        url: `/customers${query ? `?${query}` : ""}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),
    getCustomerById: build.query<ISingleCustomerResponse, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),
    createCustomer: build.mutation<ISingleCustomerResponse, Partial<ICustomer>>({
      query: (data) => ({
        url: "/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: build.mutation<
      ISingleCustomerResponse,
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
    deleteCustomer: build.mutation<ISingleCustomerResponse, string>({
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
