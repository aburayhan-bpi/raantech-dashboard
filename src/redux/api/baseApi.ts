/**
 * Base API Configuration using Redux Toolkit Query
 */
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { logout, setTokens } from "../features/user/authSlice";
import type { RootState } from "../store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken || Cookies.get("accessToken");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const hasHeader = (args: string | FetchArgs, headerName: string) => {
  if (typeof args === "string" || !args.headers) return false;

  const normalized = headerName.toLowerCase();
  const { headers } = args;

  if (headers instanceof Headers) {
    return headers.get(headerName) === "true";
  }

  if (Array.isArray(headers)) {
    return headers.some(
      ([key, value]) => key.toLowerCase() === normalized && value === "true",
    );
  }

  const headerMap = headers as Record<string, string>;
  return headerMap[headerName] === "true" || headerMap[normalized] === "true";
};

// token refresh with wrapper
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isLoginRequest =
      typeof args === "string"
        ? args.includes("/auth/login")
        : args.url?.includes("/auth/login");

    if (isLoginRequest || hasHeader(args, "x-skip-auth-logout")) {
      return result;
    }

    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken || Cookies.get("refreshToken");

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const newTokens = refreshResult.data as {
          accessToken: string;
          refreshToken?: string;
        };
        api.dispatch(setTokens(newTokens));
        // Retry original
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    } else {
      api.dispatch(logout());
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Users", "Tracking", "ActivityLogs", "Categories"],
  keepUnusedDataFor: 120,
  refetchOnMountOrArgChange: 120,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

export default baseApi;
