/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PassViewToggleBtn from "@/components/shared/PassViewToggleBtn";
import { cn } from "@/lib/utils";
import { useChangePasswordMutation } from "@/redux/api/auth/authApi";
import { selectUser } from "@/redux/features/user/authSlice";
import { useAppSelector } from "@/redux/hook";
import { Icons } from "@/utils/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import DeleteAccountModal from "./DeleteAccountModal";

// --- Schemas ---

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});

type DeleteAccountData = z.infer<typeof deleteAccountSchema>;

// --- Component ---

export default function SecurityTab() {
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteData, setPendingDeleteData] =
    useState<DeleteAccountData | null>(null);
    
  const user = useAppSelector(selectUser);

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
    password: false,
  });

  // Change Password Form
  const {
    register: registerChangePwd,
    handleSubmit: handleChangePwdSubmit,
    formState: { errors: changePwdErrors },
    reset: resetChangePwd,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Delete Account Form
  const {
    register: registerDeleteAcc,
    handleSubmit: handleDeleteAccSubmit,
    formState: { errors: deleteAccErrors },
    reset: resetDeleteAcc,
  } = useForm<DeleteAccountData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const onChangePassword = async (data: ChangePasswordData) => {
    try {
      const payload = {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const result = await changePassword(payload).unwrap();

      if (result?.success) {
        toast.success(result.message || "Password changed successfully");
        resetChangePwd();
        setShowPasswords((prev) => ({
          ...prev,
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        }));
      }
    } catch (error: any) {
      const errMsg =
        error?.message || error?.data?.message || "Something went wrong!";
      toast.error(errMsg);
    }
  };

  const onDeleteAccountRequest = (data: DeleteAccountData) => {
    setPendingDeleteData(data);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteData) return;
    setIsDeletingAccount(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeletingAccount(false);
    setShowDeleteModal(false);
    toast.success("Account deleted successfully");
    resetDeleteAcc();
    setShowPasswords((prev) => ({ ...prev, password: false }));
    setPendingDeleteData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Change Password Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-lg mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Icons.BsLockFill className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Change Password
          </h2>
        </div>

        <form
          onSubmit={handleChangePwdSubmit(onChangePassword)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-muted-foreground">
              Current Password
            </label>
            <input
              type={showPasswords.currentPassword ? "text" : "password"}
              placeholder="Enter your current password"
              {...registerChangePwd("currentPassword")}
              className={cn(
                "w-full h-12 bg-transparent border rounded-xl px-4 pr-12 text-foreground focus:outline-none transition-colors",
                changePwdErrors.currentPassword
                  ? "border-error focus:border-error"
                  : "border-border focus:border-brand",
              )}
            />
            <PassViewToggleBtn
              field="currentPassword"
              showPassword={showPasswords.currentPassword}
              setShowPassword={setShowPasswords}
            />
            {changePwdErrors.currentPassword && (
              <span className="text-xs text-error">
                {changePwdErrors.currentPassword.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-muted-foreground">
              New Password
            </label>
            <input
              type={showPasswords.newPassword ? "text" : "password"}
              placeholder="Enter a new password"
              {...registerChangePwd("newPassword")}
              className={cn(
                "w-full h-12 bg-transparent border rounded-xl px-4 pr-12 text-foreground focus:outline-none transition-colors",
                changePwdErrors.newPassword
                  ? "border-error focus:border-error"
                  : "border-border focus:border-brand",
              )}
            />
            <PassViewToggleBtn
              field="newPassword"
              showPassword={showPasswords.newPassword}
              setShowPassword={setShowPasswords}
            />
            {changePwdErrors.newPassword && (
              <span className="text-xs text-error">
                {changePwdErrors.newPassword.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-muted-foreground">
              Confirm Password
            </label>
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              placeholder="Enter new confirm password"
              {...registerChangePwd("confirmPassword")}
              className={cn(
                "w-full h-12 bg-transparent border rounded-xl px-4 pr-12 text-foreground focus:outline-none transition-colors",
                changePwdErrors.confirmPassword
                  ? "border-error focus:border-error"
                  : "border-border focus:border-brand",
              )}
            />
            <PassViewToggleBtn
              field="confirmPassword"
              showPassword={showPasswords.confirmPassword}
              setShowPassword={setShowPasswords}
            />
            {changePwdErrors.confirmPassword && (
              <span className="text-xs text-error">
                {changePwdErrors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full h-12 mt-4 golden-gradient-card border-none! hover:opacity-90 text-primary-foreground font-semibold hover:cursor-pointer disabled:opacity-50 transition-all duration-300 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {isChangingPassword ? "Saving..." : "Confirm"}
          </button>
        </form>
      </div>

      {/* Delete Account Card - Hidden for SUPER_ADMIN */}
      {user?.role !== "SUPER_ADMIN" && (
        <>
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-lg mx-auto shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Icons.FaTrashCan className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-semibold text-foreground">
                Delete Account
              </h2>
            </div>

            <form
              onSubmit={handleDeleteAccSubmit(onDeleteAccountRequest)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  type={showPasswords.password ? "text" : "password"}
                  placeholder="Enter your password"
                  {...registerDeleteAcc("password")}
                  className={cn(
                    "w-full h-12 bg-transparent border rounded-xl px-4 pr-12 text-foreground focus:outline-none transition-colors",
                    deleteAccErrors.password
                      ? "border-error focus:border-error"
                      : "border-border focus:border-brand",
                  )}
                />
                <PassViewToggleBtn
                  field="password"
                  showPassword={showPasswords.password}
                  setShowPassword={setShowPasswords}
                />
                {deleteAccErrors.password && (
                  <span className="text-xs text-error">
                    {deleteAccErrors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isDeletingAccount}
                className="w-full h-12 mt-4 golden-gradient-card border-none! hover:opacity-90 text-primary-foreground font-semibold hover:cursor-pointer disabled:opacity-50 transition-all duration-300 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {isDeletingAccount ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>

          <DeleteAccountModal
            open={showDeleteModal}
            loading={isDeletingAccount}
            onConfirm={handleConfirmDelete}
            onClose={() => {
              if (!isDeletingAccount) {
                setShowDeleteModal(false);
                setPendingDeleteData(null);
              }
            }}
          />
        </>
      )}
    </motion.div>
  );
}
