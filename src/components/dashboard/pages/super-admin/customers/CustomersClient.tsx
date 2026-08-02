"use client";
import { ICustomer } from "@/types/global";
import { Pagination } from "@/components/dashboard/pagination";
import ConfirmModal from "@/components/shared/ConfirmModal";
import CustomButton from "@/components/shared/CustomButton";
import ExcelImportModal from "@/components/shared/ExcelImportModal";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeleteCustomerMutation,
  useGetCustomersQuery } from "@/redux/api/customer/customerApi";
import { selectUser } from "@/redux/features/user/authSlice";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import {
  Download,
  Edit2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import CustomerModal from "./CustomerModal";

export default function CustomersClient() {
  const user = useSelector(selectUser);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const userPermissions = user?.permissions || [];
  const canCreate = isSuperAdmin || userPermissions.includes("customers:create");
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [deleteCustomer] = useDeleteCustomerMutation();

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

  const { data, isLoading, isFetching, refetch } = useGetCustomersQuery(
    sp.toString(),
  );

  const customers = data?.data || [];
  const meta = data?.meta;

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: ICustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: ICustomer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(customerToDelete.id).unwrap();
      toast.success("Customer deleted successfully");
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store customers and their purchase history.
          </p>
        </div>
        {canCreate && (
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              variant="outline"
              onClick={() => window.open("/api/v1/customers/export", "_blank")}
              btnText={
                <div className="flex items-center text-slate-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </div>
              }
            />
            <CustomButton
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              btnText={
                <div className="flex items-center text-slate-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </div>
              }
            />
            <CustomButton
              onClick={handleAdd}
              icon={<Plus className="w-4 h-4" />}
              btnText="Add Customer"
              variant="default"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-visible">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Total Purchases</th>
                {canCreate && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading || isFetching ? (
                <TableRowsSkeleton cols={canCreate ? 4 : 3} rows={5} />
              ) : customers.length > 0 ? (
                customers.map((customer: ICustomer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-slate-700">
                          {customer.name}
                        </div>
                        {customer.address && (
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-37.5">
                              {customer.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center text-xs text-slate-500">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        ৳{customer.totalPurchases.toFixed(2)}
                      </span>
                    </td>
                    {canCreate && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Link
                            href={`/dashboard/${user?.role === "SUPER_ADMIN" ? "super-admin" : user?.role?.toLowerCase()}/customers/${customer.id}`}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canCreate ? 4 : 3}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900 mb-1">
                        No customers found
                      </p>
                      <p className="text-sm">
                        {searchTerm
                          ? `No results match "${searchTerm}"`
                          : "Start by adding your first customer"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPage > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
            />
          </div>
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Customers"
        templateUrl="/api/v1/customers/export"
        importUrl="/api/v1/customers/import"
        onSuccess={() => refetch()}
      />
    </div>
  );
}
