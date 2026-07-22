import { baseApi } from "../baseApi";
import { IActivityLogResponse } from "@/types/global";

export const activityLogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getActivityLogs: builder.query<IActivityLogResponse, string | void>({
      query: (queryString) => `/activity-logs${queryString ? `?${queryString}` : ''}`,
      providesTags: ["ActivityLogs"],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
