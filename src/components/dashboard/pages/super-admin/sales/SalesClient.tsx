"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Calendar, CheckCircle2, ShoppingCart, Eye, FileText, Edit2 } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { Pagination } from "@/components/dashboard/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useGetSalesQuery, ISale } from "@/redux/api/sale/salesApi";
import { format } from "date-fns";
import Link from "next/link";
import { SaleStatus, PaymentStatus } from "@/types/global";
// import ViewSaleModal from "./ViewSaleModal"; // To be implemented

export default function SalesClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(sp.get("status") || "ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(sp.get("paymentStatus") || "ALL");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const previousFilters = useRef({
    search: debouncedSearch,
    status: statusFilter,
    paymentStatus: paymentStatusFilter
  });

  // const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

  const currentUser = useSelector(selectUser);
  const userPermissions = currentUser?.permissions || [];
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const canCreate = isSuperAdmin || userPermissions.includes("sales:create");

  useEffect(() => {
    // Only update if filters actually changed
    if (
      previousFilters.current.search === debouncedSearch &&
      previousFilters.current.status === statusFilter &&
      previousFilters.current.paymentStatus === paymentStatusFilter
    ) {
      return;
    }

    previousFilters.current = {
      search: debouncedSearch,
      status: statusFilter,
      paymentStatus: paymentStatusFilter
    };

    const currentParams: Record<string, string | null> = { page: "1" };
    
    if (debouncedSearch) currentParams.search = debouncedSearch;
    else currentParams.search = null;

    if (statusFilter !== "ALL") currentParams.status = statusFilter;
    else currentParams.status = null;

    if (paymentStatusFilter !== "ALL") currentParams.paymentStatus = paymentStatusFilter;
    else currentParams.paymentStatus = null;

    setParams(currentParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, paymentStatusFilter]);

  const { data, isLoading, isFetching } = useGetSalesQuery({
    search: sp.get("search") || undefined,
    status: sp.get("status") || undefined,
    paymentStatus: sp.get("paymentStatus") || undefined,
    page: Number(sp.get("page")) || 1,
  });

  const sales = data?.data || [];
  const meta = data?.meta;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleView = (sale: ISale) => {
    router.push(`${basePath}/sales/${sale._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-rose-50 text-rose-700 border-rose-200";
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
      case "REFUND_DUE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "REFUNDED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CANCELLED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "DUE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales & Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer orders and POS transactions
          </p>
        </div>
        {canCreate && (
          <Link href={`${basePath}/sales/add`}>
            <CustomButton
              icon={<ShoppingCart className="w-4 h-4 mr-1" />}
              btnText="Create Order (POS)"
              variant="default"
            />
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by Order ID, Phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-[160px]">
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All Status", value: "ALL" },
                  { label: "Pending", value: SaleStatus.PENDING },
                  { label: "Processing", value: SaleStatus.PROCESSING },
                  { label: "Shipped", value: SaleStatus.SHIPPED },
                  { label: "Completed", value: SaleStatus.COMPLETED },
                  { label: "Cancelled", value: SaleStatus.CANCELLED },
                  { label: "Refunded", value: SaleStatus.REFUNDED },
                ]}
                placeholder="Status"
                triggerClassName="bg-slate-50 border-slate-200 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <CustomDropdown
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                options={[
                  { label: "All Payments", value: "ALL" },
                  { label: "Paid", value: PaymentStatus.PAID },
                  { label: "Due", value: PaymentStatus.DUE },
                  { label: "Partial", value: PaymentStatus.PARTIAL },
                ]}
                placeholder="Payment"
                triggerClassName="bg-slate-50 border-slate-200 py-2 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table / Content */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Order Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer
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
                <TableRowsSkeleton cols={6} rows={5} />
              ) : sales.length > 0 ? (
                sales.map((sale: ISale, index: number) => (
                    <tr
                      key={sale._id || `sale-${index}`}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">{sale.saleNo}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {sale.saleDate ? format(new Date(sale.saleDate), "dd MMM yyyy") : format(new Date(sale.createdAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-700">{sale.customer?.name || "N/A"}</p>
                          {sale.customer?.phone && (
                            <p className="text-xs text-slate-500 mt-0.5">{sale.customer.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-700">
                            ৳ {sale.totalAmount.toLocaleString()}
                          </p>
                          {sale.dueAmount > 0 && (
                            <p className="text-xs font-medium text-rose-500">
                              Due: ৳ {sale.dueAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPaymentStatusColor(
                              sale.paymentStatus
                            )}`}
                          >
                            {sale.paymentStatus}
                          </span>
                          <p className="text-[11px] font-medium text-slate-500 uppercase">
                            {sale.paymentMethod}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            sale.status
                          )}`}
                        >
                          {sale.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(sale)}
                            className="p-2 text-slate-400 hover:text-[#0089A7] hover:bg-[#0089A7]/10 rounded-lg transition-colors group"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleView(sale)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group"
                            title="Edit Order"
                          >
                            <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        {searchTerm 
                          ? `No orders found matching "${searchTerm}". Try adjusting your search query.` 
                          : "You haven't created any sales or POS orders yet. Create your first order to get started."}
                      </p>
                      {canCreate && !searchTerm && (
                        <Link href={`${basePath}/sales/add`}>
                          <CustomButton
                            icon={<Plus className="w-4 h-4 mr-1" />}
                            btnText="Create First Order"
                            variant="default"
                          />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && sales.length > 0 && (
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

      {/* <ViewSaleModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        sale={selectedSale}
      /> */}
    </div>
  );
}
