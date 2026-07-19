// isAuthenticated = true/false

import { useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { decodeJWT } from "@/utils/decodeJWT";

const useAuth = () => {
  const token = useAppSelector((state) => state?.auth?.accessToken);
  const refreshToken = useAppSelector((state) => state?.auth?.refreshToken);

  useEffect(() => {
    if (token && !Cookies.get("accessToken")) {
      let accessExpires: Date | undefined;
      const decodedAccess = decodeJWT<{ exp?: number }>(token);
      if (decodedAccess?.exp) {
        accessExpires = new Date(decodedAccess.exp * 1000);
      }
      Cookies.set("accessToken", token, { expires: accessExpires || 7 });
    }

    if (refreshToken && !Cookies.get("refreshToken")) {
      let refreshExpires: Date | undefined;
      const decodedRefresh = decodeJWT<{ exp?: number }>(refreshToken);
      if (decodedRefresh?.exp) {
        refreshExpires = new Date(decodedRefresh.exp * 1000);
      }
      Cookies.set("refreshToken", refreshToken, { expires: refreshExpires || 30 });
    }
  }, [token, refreshToken]);

  return !!token;
};
export default useAuth;

