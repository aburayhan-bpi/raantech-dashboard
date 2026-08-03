import { baseApi } from "../baseApi";
import { ITrashResponse, ITrashMutationResponse } from "@/types/global";

interface ITrashQueryParams {
  type: string;
  page?: string;
  limit?: string;
  search?: string;
}

export const trashApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTrashItems: build.query<ITrashResponse, ITrashQueryParams>({
      query: (params) => {
        let url = `/trash?type=${params.type}`;
        if (params.page) url += `&page=${params.page}`;
        if (params.limit) url += `&limit=${params.limit}`;
        if (params.search) url += `&search=${params.search}`;
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Trash"],
    }),
    restoreTrashItem: build.mutation<ITrashMutationResponse, { type: string; id: string }>({
      query: ({ type, id }) => ({
        url: `/trash/restore/${type}/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Trash", "Products", "Categories", "Suppliers", "Users"],
    }),
    hardDeleteTrashItem: build.mutation<ITrashMutationResponse, { type: string; id: string }>({
      query: ({ type, id }) => ({
        url: `/trash/hard-delete/${type}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trash"],
    }),
  }),
});

export const {
  useGetTrashItemsQuery,
  useRestoreTrashItemMutation,
  useHardDeleteTrashItemMutation,
} = trashApi;
