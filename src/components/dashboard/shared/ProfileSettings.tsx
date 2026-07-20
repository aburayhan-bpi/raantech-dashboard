"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar,
  Key,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  Camera,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation, 
  useChangePasswordMutation 
} from "@/redux/api/users/userApi";
import { useLazyGetMeQuery } from "@/redux/api/getMe/getMeApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/user/authSlice";
import { uploadImageToImgBB } from "@/lib/uploadImage";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: profileResponse, isLoading: isProfileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [getMe] = useLazyGetMeQuery();
  const dispatch = useDispatch();

  const user = profileResponse?.data;

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
      });
    }
  }, [user, resetProfile]);

  const fetchAndSetFreshData = async () => {
    try {
      const freshData = await getMe().unwrap();
      if (freshData?.data) {
        dispatch(setUser(freshData.data));
      }
    } catch (err) {
      console.error("Failed to fetch fresh user data:", err);
    }
  };

  const onProfileSubmit = async (data: UpdateProfileForm) => {
    try {
      await updateProfile({ name: data.name }).unwrap();
      await fetchAndSetFreshData();
      toast.success("Profile updated successfully!");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadImageToImgBB(file);
      await updateProfile({ profileImage: imageUrl }).unwrap();
      await fetchAndSetFreshData();
      toast.success("Profile image updated!");
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password updated successfully!");
      resetPassword();
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update password");
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0089A7]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile and security preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex border-b border-slate-200/60">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "text-[#0089A7] border-b-2 border-[#0089A7] bg-slate-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === "security"
                ? "text-[#0089A7] border-b-2 border-[#0089A7] bg-slate-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            Security
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-[#0089A7]/10 flex items-center justify-center text-[#0089A7] text-4xl font-bold uppercase shadow-inner border-2 border-[#0089A7]/20 overflow-hidden">
                    {user.profileImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  
                  {/* Image Upload Overlay */}
                  <div 
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className={`absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center transition-opacity cursor-pointer text-white ${isUploadingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-semibold">Change</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="pt-6 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      {...registerProfile("name")}
                      className={`w-full h-11 px-4 bg-slate-50 border ${profileErrors.name ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                    />
                    {profileErrors.name && (
                      <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" /> Email Address (Read-only)
                    </label>
                    <div className="flex items-center h-11 px-4 bg-slate-100/60 border border-slate-200 text-sm text-slate-500 rounded-xl">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> Account Created
                    </label>
                    <div className="flex items-center h-11 px-4 bg-slate-100/60 border border-slate-200 text-sm text-slate-500 rounded-xl">
                      {user.createdAt ? format(new Date(user.createdAt), "MMMM dd, yyyy") : "-"}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="h-11 px-6 bg-[#0089A7] hover:bg-[#007B96] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-[#0089A7]/20 flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#0089A7]" /> Change Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ensure your account is using a long, random password to stay
                  secure.
                </p>
              </div>

              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("currentPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${passwordErrors.currentPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("newPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${passwordErrors.newPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className={`w-full h-11 px-4 bg-slate-50 border ${passwordErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"} text-sm rounded-xl outline-none transition-all`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="h-11 px-6 bg-[#0089A7] hover:bg-[#007B96] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-[#0089A7]/20 flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
