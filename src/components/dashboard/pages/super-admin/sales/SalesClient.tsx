"use client";
import { Pagination } from "@/components/dashboard/pagination";
import ConfirmModal from "@/components/shared/ConfirmModal";
import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useBulkDeleteSalesMutation,
  useGetSalesQuery,
} from "@/redux/api/sale/salesApi";
import { selectUser } from "@/redux/features/user/authSlice";
import { ISale, PaymentStatus, SaleStatus } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { format } from "date-fns";
import {
  Calendar,
  Edit2,
  Eye,
  Facebook,
  FileText,
  Globe,
  Plus,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
// import ViewSaleModal from "./ViewSaleModal"; // To be implemented

export default function SalesClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split("/").slice(0, 3).join("/");
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(sp.get("status") || "ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(
    sp.get("paymentStatus") || "ALL",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const previousFilters = useRef({
    search: debouncedSearch,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
  });

  // const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const [selectedSale, setSelectedSale] = useState<ISale | null>(null);

  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bulkDeleteSales, { isLoading: isBulkDeleting }] =
    useBulkDeleteSalesMutation();

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
      paymentStatus: paymentStatusFilter,
    };

    const currentParams: Record<string, string | null> = { page: "1" };

    if (debouncedSearch) currentParams.search = debouncedSearch;
    else currentParams.search = null;

    if (statusFilter !== "ALL") currentParams.status = statusFilter;
    else currentParams.status = null;

    if (paymentStatusFilter !== "ALL")
      currentParams.paymentStatus = paymentStatusFilter;
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
    router.push(`${basePath}/sales/${sale.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100/60 text-emerald-700";
      case "PENDING":
        return "bg-amber-100/60 text-amber-700";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-rose-100/60 text-rose-700";
      default:
        return "bg-slate-100/80 text-slate-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100/60 text-emerald-700";
      case "PARTIAL":
        return "bg-amber-100/60 text-amber-700";
      case "REFUND_DUE":
        return "bg-rose-100/60 text-rose-700";
      case "REFUNDED":
        return "bg-purple-100/60 text-purple-700";
      case "CANCELLED":
      case "DUE":
        return "bg-rose-100/60 text-rose-700";
      default:
        return "bg-slate-100/80 text-slate-700";
    }
  };

  const getSourceDetails = (source: string) => {
    switch (source) {
      case "FACEBOOK":
        return {
          icon: <Facebook className="w-3 h-3" />,
          color: "bg-blue-100 text-blue-700",
          label: "Facebook",
        };
      case "WEBSITE":
        return {
          icon: <Globe className="w-3 h-3" />,
          color: "bg-purple-100 text-purple-700",
          label: "Website",
        };
      case "WHATSAPP":
        return {
          icon: <Smartphone className="w-3 h-3" />,
          color: "bg-green-100 text-green-700",
          label: "WhatsApp",
        };
      case "DIRECT_MANUAL":
        return {
          icon: <Store className="w-3 h-3" />,
          color: "bg-slate-100 text-slate-700",
          label: "Direct/POS",
        };
      default:
        return {
          icon: <FileText className="w-3 h-3" />,
          color: "bg-slate-100 text-slate-700",
          label: source || "Other",
        };
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSales(sales.map((sale: ISale) => sale.id));
    } else {
      setSelectedSales([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedSales((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteSales({ ids: selectedSales }).unwrap();
      toast.success(`${selectedSales.length} orders deleted successfully!`);
      setSelectedSales([]);
      setIsDeleteModalOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete orders");
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
          <div className="flex items-center gap-3">
            {selectedSales.length > 0 && isSuperAdmin && (
              <CustomButton
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isBulkDeleting}
                icon={<Trash2 className="w-4 h-4 mr-1" />}
                btnText={`Delete (${selectedSales.length})`}
                className="bg-rose-500 hover:bg-rose-600 border-none text-white hover:cursor-pointer"
              />
            )}
            <Link href={`${basePath}/sales/add`} className="">
              <CustomButton
                icon={<ShoppingCart className="w-4 h-4 mr-1" />}
                btnText="Create Order (POS)"
                variant="default"
                className="hover:cursor-pointer"
              />
            </Link>
          </div>
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-40">
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

            <div className="w-full sm:w-40">
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
        <div className="overflow-x-auto min-h-100">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">
                  <Checkbox
                    checked={
                      sales.length > 0 && selectedSales.length === sales.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(checked as boolean)
                    }
                    className="border border-brand/50 hover:cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Order Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
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
                    key={sale.id || `sale-${index}`}
                    className={`hover:bg-slate-50/80 transition-colors group ${selectedSales.includes(sale.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedSales.includes(sale.id)}
                        onCheckedChange={() => handleSelectOne(sale.id)}
                        className="border border-brand/40 hover:cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-sm text-slate-800">
                          {sale.saleNo}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {sale.saleDate
                            ? format(new Date(sale.saleDate), "dd MMM yyyy")
                            : format(new Date(sale.createdAt), "dd MMM yyyy")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-slate-700">
                          {sale.customer?.name || "N/A"}
                        </p>
                        {sale.customer?.phone && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sale.customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 font-medium">
                          ৳ {sale.totalAmount.toLocaleString()}
                        </p>
                        {sale.dueAmount > 0 && (
                          <p className="text-[11px] text-rose-500">
                            Due: ৳ {sale.dueAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 flex flex-col items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${getPaymentStatusColor(
                            sale.paymentStatus,
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                          {formatStatusText(sale.paymentStatus)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {sale.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${getStatusColor(
                          sale.status,
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                        {formatStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const sourceData = getSourceDetails(
                          sale.source || "OTHER",
                        );
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${sourceData.color}`}
                          >
                            {sourceData.icon}
                            {sourceData.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(sale)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors group"
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
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <FileText className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        No orders found
                      </h3>
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
        {meta && meta.totalPage > 1 && sales.length > 0 && (
          <div className="px-6 py-0 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
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
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete Selected Orders"
        description={`Are you sure you want to delete ${selectedSales.length} selected orders? This will also return the stock for these items if they aren't cancelled or returned.`}
        confirmText="Delete"
        cancelText="Cancel"
        tone="danger"
        loading={isBulkDeleting}
        onConfirm={handleBulkDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
