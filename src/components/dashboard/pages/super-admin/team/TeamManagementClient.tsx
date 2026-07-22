/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import {
  Loader2,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/dashboard/pagination";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useLazyGetUserByIdQuery,
  useRestoreUserMutation,
} from "@/redux/api/users/userApi";
import { selectUser } from "@/redux/features/user/authSlice";
import { ITeamUser } from "@/types/global";
import { useSelector } from "react-redux";
import { Controller } from "react-hook-form";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_sales", label: "Sales & Exchange" },
  { id: "manage_products", label: "Products" },
  { id: "manage_categories", label: "Categories" },
  { id: "manage_customers", label: "Customers" },
  { id: "manage_expenses", label: "Expenses" },
];

// --- Validation Schemas ---
const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "STAFF"]),
  permissions: z.array(z.string()).optional(),
});
type InviteFormData = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "STAFF"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  permissions: z.array(z.string()).optional(),
});
type EditFormData = z.infer<typeof editSchema>;

export default function TeamManagementClient() {
  const currentUser = useSelector(selectUser);
  const searchParams = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentLimit = Number(searchParams.get("limit")) || 10;
  const isDeletedFilter = searchParams.get("isDeleted") === "true";

  // Construct query string for RTK Query
  const queryString = new URLSearchParams();
  queryString.set("page", currentPage.toString());
  queryString.set("limit", currentLimit.toString());
  if (debouncedSearch) queryString.set("search", debouncedSearch);
  if (isDeletedFilter) queryString.set("isDeleted", "true");

  const { data, isLoading, isError, refetch } = useGetUsersQuery(queryString.toString());
  const users = data?.data || [];
  const meta = data?.meta;

  const previousSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [restoreUser, { isLoading: isRestoring }] = useRestoreUserMutation();
  const [getUserById, { isFetching: isFetchingUser }] = useLazyGetUserByIdQuery();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [editModalData, setEditModalData] = useState<ITeamUser | null>(null);
  const [deleteModalData, setDeleteModalData] = useState<ITeamUser | null>(null);
  const [restoreModalData, setRestoreModalData] = useState<ITeamUser | null>(null);

  // Invite Form
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    control: controlInvite,
    formState: { errors: inviteErrors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", role: "STAFF", permissions: [] },
  });

  const onInvite = async (formData: InviteFormData) => {
    try {
      await inviteUser(formData).unwrap();
      toast.success("User invited successfully!");
      setIsInviteModalOpen(false);
      resetInviteForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to invite user");
    }
  };

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    control: controlEdit,
    formState: { errors: editErrors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const openEditModal = async (user: ITeamUser) => {
    try {
      const targetId = user._id || (user as any).id;
      const response = await getUserById(targetId).unwrap();
      const freshUser = response.data;
      if (freshUser) {
        resetEditForm({
          name: freshUser.name,
          email: freshUser.email,
          role: freshUser.role as "ADMIN" | "STAFF",
          status: (freshUser.status as any) || "ACTIVE",
          permissions: freshUser.permissions || [],
        });
        setEditModalData(freshUser);
      }
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  const onEdit = async (formData: EditFormData) => {
    if (!editModalData) return;
    try {
      const targetId = editModalData._id || (editModalData as any).id;
      await updateUser({ id: targetId, payload: formData }).unwrap();
      toast.success("User updated successfully!");
      setEditModalData(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  const onDeleteConfirm = async () => {
    if (!deleteModalData) return;
    try {
      const targetId = deleteModalData._id || (deleteModalData as any).id;
      await deleteUser(targetId).unwrap();
      toast.success("User deleted successfully!");
      setDeleteModalData(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const onRestoreConfirm = async () => {
    if (!restoreModalData) return;
    try {
      const targetId = restoreModalData._id || (restoreModalData as any).id;
      await restoreUser(targetId).unwrap();
      toast.success("User restored successfully!");
      setRestoreModalData(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to restore user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
            <ShieldAlert className="w-3 h-3" /> Super Admin
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case "STAFF":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            <Shield className="w-3 h-3" /> Staff
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your admins and staff members
          </p>
        </div>
        <div className="flex items-center gap-3">

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0089A7] hover:bg-[#007B96] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#0089A7]/20"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer group bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Checkbox
              checked={isDeletedFilter}
              onCheckedChange={(checked) => setParams({ isDeleted: checked ? "true" : null, page: "1" })}
              className="border-slate-300 text-rose-500 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 data-[state=checked]:text-white transition-colors"
            />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              Show Deleted
            </span>
          </label>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined At</th>
                {isDeletedFilter && <th className="px-6 py-4">Deleted At</th>}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr key="loading">
                  <td
                    colSpan={isDeletedFilter ? 6 : 5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0089A7]" />
                    Loading users...
                  </td>
                </tr>
              ) : isError ? (
                <tr key="error">
                  <td
                    colSpan={isDeletedFilter ? 6 : 5}
                    className="px-6 py-12 text-center text-red-500"
                  >
                    Failed to load users. Please try again.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr key="empty">
                  <td
                    colSpan={isDeletedFilter ? 6 : 5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id || (user as any).id || index}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0089A7]/10 flex items-center justify-center text-[#0089A7] font-bold text-sm uppercase overflow-hidden relative">
                          {user.profileImage && user.profileImage !== "/logo.png" ? (
                            <Image draggable={false} 
                              src={user.profileImage} 
                              alt={user.name} 
                              fill
                              className="object-cover" 
                            />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          user.status === "INACTIVE"
                            ? "text-slate-400"
                            : "text-emerald-600",
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            user.status === "INACTIVE"
                              ? "bg-slate-400"
                              : "bg-emerald-500",
                          )}
                        ></span>
                        {user.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </td>
                    {isDeletedFilter && (
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-rose-500">
                        {user.deletedAt ? format(new Date(user.deletedAt), "MMM dd, yyyy") : "-"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(user._id || (user as any).id) !== currentUser?.id &&
                      user.role !== "SUPER_ADMIN" ? (
                        <div className="flex items-center justify-end gap-2">
                          {user.isDeleted ? (
                            <button
                              onClick={() => setRestoreModalData(user)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Restore User"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                disabled={isFetchingUser}
                                className="p-1.5 text-slate-400 hover:text-[#0089A7] hover:bg-[#0089A7]/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Edit User"
                              >
                                {isFetchingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setDeleteModalData(user)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50">
            <Pagination 
              currentPage={meta.page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
            />
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">
                Invite New User
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleInviteSubmit(onInvite)}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  {...registerInvite("name")}
                  className={cn(
                    "w-full h-10 px-3 bg-white border border-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] outline-none transition-all",
                    inviteErrors.name && "border-red-500",
                  )}
                  placeholder="John Doe"
                />
                {inviteErrors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {inviteErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  {...registerInvite("email")}
                  type="email"
                  className={cn(
                    "w-full h-10 px-3 bg-white border border-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] outline-none transition-all",
                    inviteErrors.email && "border-red-500",
                  )}
                  placeholder="john@example.com"
                />
                {inviteErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {inviteErrors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <Controller
                  name="role"
                  control={controlInvite}
                  render={({ field }) => (
                    <CustomDropdown
                      options={[
                        { value: "STAFF", label: "Staff" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Role"
                    />
                  )}
                />
                {inviteErrors.role && (
                  <p className="text-xs text-red-500 mt-1">
                    {inviteErrors.role.message}
                  </p>
                )}
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Module Permissions
                </label>
                <Controller
                  name="permissions"
                  control={controlInvite}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_PERMISSIONS.map((permission) => {
                        const isChecked = field.value?.includes(permission.id) || false;
                        return (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                const next = checked
                                  ? [...current, permission.id]
                                  : current.filter((id) => id !== permission.id);
                                field.onChange(next);
                              }}
                              className="border-slate-300 text-[#0089A7] data-[state=checked]:bg-[#0089A7] data-[state=checked]:border-[#0089A7] data-[state=checked]:text-white transition-colors"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                              {permission.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 h-10 bg-[#0089A7] hover:bg-[#007B96] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isInviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-800">Edit User</h3>
              <button
                onClick={() => setEditModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit(onEdit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  {...registerEdit("name")}
                  className={cn(
                    "w-full h-10 px-3 bg-white border border-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] outline-none transition-all",
                    editErrors.name && "border-red-500",
                  )}
                />
                {editErrors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  {...registerEdit("email")}
                  type="email"
                  className={cn(
                    "w-full h-10 px-3 bg-white border border-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] outline-none transition-all",
                    editErrors.email && "border-red-500",
                  )}
                />
                {editErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <Controller
                  name="role"
                  control={controlEdit}
                  render={({ field }) => (
                    <CustomDropdown
                      options={[
                        { value: "STAFF", label: "Staff" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Role"
                    />
                  )}
                />
                {editErrors.role && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.role.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <Controller
                  name="status"
                  control={controlEdit}
                  render={({ field }) => (
                    <CustomDropdown
                      options={[
                        { value: "ACTIVE", label: "Active" },
                        { value: "INACTIVE", label: "Inactive" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Status"
                    />
                  )}
                />
              </div>

              {/* Permissions Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Module Permissions
                </label>
                <Controller
                  name="permissions"
                  control={controlEdit}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_PERMISSIONS.map((permission) => {
                        const isChecked = field.value?.includes(permission.id) || false;
                        return (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                const next = checked
                                  ? [...current, permission.id]
                                  : current.filter((id) => id !== permission.id);
                                field.onChange(next);
                              }}
                              className="border-slate-300 text-[#0089A7] data-[state=checked]:bg-[#0089A7] data-[state=checked]:border-[#0089A7] data-[state=checked]:text-white transition-colors"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                              {permission.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setEditModalData(null)}
                  className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 h-10 bg-[#0089A7] hover:bg-[#007B96] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Delete User?
              </h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  {deleteModalData.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalData(null)}
                className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Restore User?
              </h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to restore{" "}
                <span className="font-semibold text-slate-700">
                  {restoreModalData.name}
                </span>
                ? They will regain access to their account.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setRestoreModalData(null)}
                className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onRestoreConfirm}
                disabled={isRestoring}
                className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 cursor-pointer"
              >
                {isRestoring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Restore"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
