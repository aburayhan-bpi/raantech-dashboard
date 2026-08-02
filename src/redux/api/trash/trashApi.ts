import { baseApi } from "../baseApi";
import { ITrashResponse, ITrashMutationResponse } from "@/types/global";

export const trashApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTrashItems: build.query<ITrashResponse, string>({
      query: (type) => ({
        url: `/trash?type=${type}`,
        method: "GET",
      }),
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
