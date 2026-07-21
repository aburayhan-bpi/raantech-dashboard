"use client";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { cn } from "@/lib/utils";
import { Icons } from "@/utils/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Static non-changeable email
  const userEmail = "example123@gmail.com";

  // Image upload state
  const [previewImage, setPreviewImage] = useState(
    "https://i.pravatar.cc/150?u=hamid",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Hamid",
      lastName: "Hasan",
    },
  });

  // Current display data
  const [currentData, setCurrentData] = useState({
    firstName: "Hamid",
    lastName: "Hasan",
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    toast.success("Logged out successfully");
    // Handle actual logout routing here
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentData(data);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    reset(currentData);
    setIsEditing(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        toast.success("Profile photo updated");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-border mb-4 bg-muted relative">
                <Image draggable={false}
                  src={previewImage}
                  alt="Avatar"
                  fill
                  sizes="96px"
                  className="object-cover"
                  
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {currentData.firstName} {currentData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">{userEmail}</p>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full h-12 golden-gradient-card border-none! hover:opacity-90 text-primary-foreground font-semibold hover:cursor-pointer disabled:opacity-50 transition-all duration-300 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                Edit Profile
              </button>
            </div>

            <div className="mt-6 flex justify-center w-full max-w-lg mx-auto">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-14 rounded-2xl bg-error/5 border border-error/20 flex items-center justify-center gap-2 transition-all hover:bg-error/10 hover:cursor-pointer"
              >
                <Icons.ImExit className="w-5 h-5 text-error" />
                <span className="text-foreground font-medium">Log Out</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col w-full max-w-lg mx-auto shadow-sm">
              {/* Image Upload Area */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-muted relative">
                    <Image draggable={false}
                      src={previewImage}
                      alt="Avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                      
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center text-primary-foreground border-2 border-card hover:cursor-pointer transition-transform hover:scale-105 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={cn(
                      "w-full h-12 bg-transparent border rounded-xl px-4 text-foreground focus:outline-none transition-colors",
                      errors.firstName
                        ? "border-error focus:border-error"
                        : "border-border focus:border-brand",
                    )}
                  />
                  {errors.firstName && (
                    <span className="text-xs text-error">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={cn(
                      "w-full h-12 bg-transparent border rounded-xl px-4 text-foreground focus:outline-none transition-colors",
                      errors.lastName
                        ? "border-error focus:border-error"
                        : "border-border focus:border-brand",
                    )}
                  />
                  {errors.lastName && (
                    <span className="text-xs text-error">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name (Not Changeable)
                  </label>
                  <input
                    type="text"
                    value={userEmail}
                    disabled
                    className="w-full h-12 bg-transparent border border-border rounded-xl px-4 text-muted-foreground focus:outline-none cursor-not-allowed opacity-70"
                  />
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground font-medium transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 golden-gradient-card  border-none! text-primary-foreground font-semibold transition-all hover:opacity-90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Saving..." : "Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showLogoutModal}
        title="Log Out"
        description="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        tone="danger"
        loading={isLoggingOut}
        onConfirm={handleLogout}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
      />
    </div>
  );
}
