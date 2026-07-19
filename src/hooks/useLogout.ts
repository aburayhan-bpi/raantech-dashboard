import { useLogoutMutation } from "@/redux/api/auth/authApi";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      toast.success("Logout successful!");
    } catch {
      //   toast.error("Server logout failed. Local session cleared anyway.");
    } finally {
      dispatch(logout());
      router.replace("/");
      router.refresh();
    }
  };

  return { handleLogout, isLoading };
}
