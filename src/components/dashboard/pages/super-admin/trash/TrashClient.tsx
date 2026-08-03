"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useGetTrashItemsQuery, useRestoreTrashItemMutation, useHardDeleteTrashItemMutation } from "@/redux/api/trash/trashApi";
import { ITrashItem } from "@/types/global";
import { ArchiveRestore, Trash2, AlertCircle, Search } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/dashboard/pagination";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef } from "react";

type TabType = "products" | "categories" | "suppliers" | "users";

export default function TrashClient() {
  const user = useSelector(selectUser);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const router = useRouter();

  if (user && !isSuperAdmin) {
    router.push("/dashboard/super-admin");
  }

  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const activeTab = (sp.get("type") as TabType) || "products";
  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const previousSearch = useRef<string | null>(null);

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    if (previousSearch.current === null && !debouncedSearch) {
      previousSearch.current = debouncedSearch;
      return;
    }
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const { data, isLoading, isFetching } = useGetTrashItemsQuery({
    type: activeTab,
    page: sp.get("page") || "1",
    limit: sp.get("limit") || "10",
    search: debouncedSearch || undefined,
  });

  const items = data?.data || [];
  const meta = data?.meta;

  const [restoreItem] = useRestoreTrashItemMutation();
  const [hardDeleteItem] = useHardDeleteTrashItemMutation();

  const [itemToRestore, setItemToRestore] = useState<ITrashItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ITrashItem | null>(null);

  const handleRestore = async () => {
    if (!itemToRestore) return;
    try {
      await restoreItem({ type: activeTab, id: itemToRestore.id }).unwrap();
      toast.success("Item restored successfully");
      setItemToRestore(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to restore item");
    }
  };

  const handleHardDelete = async () => {
    if (!itemToDelete) return;
    try {
      await hardDeleteItem({ type: activeTab, id: itemToDelete.id }).unwrap();
      toast.success("Item permanently deleted");
      setItemToDelete(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete item");
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-xl font-semibold">Access Denied</p>
        <p className="text-sm">Only Super Admin can access the Recycle Bin.</p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "products", label: "Products" },
    { id: "categories", label: "Categories" },
    { id: "suppliers", label: "Suppliers" },
    { id: "users", label: "Users & Team" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recycle Bin</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage deleted items. You can restore them or delete them permanently.
          </p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSearchTerm("");
                setParams({ type: tab.id, search: null, page: "1" });
              }}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Deleted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || isFetching ? (
                <tr key="loading">
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{item.name || item.email || "Unnamed Item"}</p>
                      {item.phone && <p className="text-xs text-slate-500">{item.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.deletedAt ? format(new Date(item.deletedAt), "dd MMM yyyy, hh:mm a") : format(new Date(item.updatedAt || new Date()), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setItemToRestore(item)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Restore"
                        >
                          <ArchiveRestore className="w-4 h-4" /> Restore
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No deleted items found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPage > 1 && (
          <div className="px-6 py-0 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!itemToRestore}
        onClose={() => setItemToRestore(null)}
        onConfirm={handleRestore}
        title="Restore Item"
        description="Are you sure you want to restore this item? It will be active again."
      />

      <ConfirmModal
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleHardDelete}
        title="Delete Permanently"
        description="Are you sure you want to permanently delete this item? This action CANNOT be undone and all associated data might be lost."
      />
    </div>
  );
}
