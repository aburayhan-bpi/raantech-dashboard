"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Calendar, CheckCircle2 } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { Pagination } from "@/components/dashboard/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, usePathname } from "next/navigation";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useGetPurchasesQuery, IPurchase } from "@/redux/api/purchase/purchaseApi";
import { format } from "date-fns";
import Link from "next/link";
import ViewPurchaseModal from "./ViewPurchaseModal";
import { Eye } from "lucide-react";

export default function PurchasesClient() {
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const previousSearch = useRef<string>(debouncedSearch);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<IPurchase | null>(null);

  const currentUser = useSelector(selectUser);
  const userPermissions = currentUser?.permissions || [];
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const canCreate = isSuperAdmin || userPermissions.includes("purchases:create");

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const { data, isLoading, isFetching } = useGetPurchasesQuery({
    search: sp.get("search") || undefined,
    page: Number(sp.get("page")) || 1,
  });

  const purchases = data?.data || [];
  const meta = data?.meta;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleView = (purchase: IPurchase) => {
    setSelectedPurchase(purchase);
    setIsViewModalOpen(true);
  };

  if (selectedPurchase && isViewModalOpen) {
    const updatedPurchase = purchases.find(
      (p: IPurchase) => p._id === selectedPurchase._id
    );
    if (updatedPurchase && JSON.stringify(updatedPurchase) !== JSON.stringify(selectedPurchase)) {
      setSelectedPurchase(updatedPurchase);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIAL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNPAID":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchases</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product purchases and supplier payments
          </p>
        </div>
        {canCreate && (
          <Link href={`${basePath}/purchases/add`}>
            <CustomButton
              icon={<Plus className="w-4 h-4" />}
              btnText="Add Purchase"
              variant="default"
            />
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by Purchase No..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Purchase Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || isFetching ? (
                <TableRowsSkeleton cols={5} rows={5} />
              ) : purchases.length > 0 ? (
                purchases.map((purchase: IPurchase, index: number) => (
                  <tr
                    key={purchase._id || `purchase-${index}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-700">{purchase.purchaseNo}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {purchase.purchaseDate ? format(new Date(purchase.purchaseDate), "dd MMM yyyy") : format(new Date(purchase.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-700">{purchase.supplier?.name || "N/A"}</p>
                        {purchase.supplier?.company && (
                          <p className="text-xs text-slate-500 mt-0.5">{purchase.supplier.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-700">
                          ৳ {purchase.totalAmount.toLocaleString()}
                        </p>
                        {purchase.dueAmount > 0 && (
                          <p className="text-xs font-medium text-rose-500">
                            Due: ৳ {purchase.dueAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPaymentStatusColor(
                            purchase.paymentStatus
                          )}`}
                        >
                          {purchase.paymentStatus}
                        </span>
                        <p className="text-[11px] font-medium text-slate-500 uppercase">
                          {purchase.paymentMethod}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          purchase.status
                        )}`}
                      >
                        {purchase.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleView(purchase)}
                        className="p-2 text-slate-400 hover:text-[#0089A7] hover:bg-[#0089A7]/10 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              showSummary={true}
            />
          </div>
        )}
      </div>

      <ViewPurchaseModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        purchase={selectedPurchase}
      />
    </div>
  );
}
