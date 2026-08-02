"use client";
import { ISupplier } from "@/types/global";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, Download, Upload } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { Pagination } from "@/components/dashboard/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useGetSuppliersQuery } from "@/redux/api/supplier/supplierApi";
import SupplierModal from "./SupplierModal";
import ExcelImportModal from "@/components/shared/ExcelImportModal";
import DeleteSupplierModal from "./DeleteSupplierModal";

export default function SuppliersClient() {
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const previousSearch = useRef<string>(debouncedSearch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<ISupplier | null>(null);

  const currentUser = useSelector(selectUser);
  const userPermissions = currentUser?.permissions || [];
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const canCreate = isSuperAdmin || userPermissions.includes("suppliers:create");
  const canUpdate = isSuperAdmin || userPermissions.includes("suppliers:update");
  const canDelete = isSuperAdmin || userPermissions.includes("suppliers:delete");

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    
    if (previousSearch.current === null && !debouncedSearch) {
      previousSearch.current = debouncedSearch;
      return;
    }

    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const { data, isLoading, isFetching, refetch } = useGetSuppliersQuery(sp.toString());

  const suppliers = data?.data || [];
  const meta = data?.meta;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (supplier: ISupplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (supplier: ISupplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product suppliers and their balances
          </p>
        </div>
        {canCreate && (
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              variant="outline"
              onClick={() => window.open('/api/v1/suppliers/export', '_blank')}
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
              btnText="Add Supplier"
              variant="default"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, phone or company..."
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
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Due
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || isFetching ? (
                <TableRowsSkeleton cols={5} rows={5} />
              ) : suppliers.length > 0 ? (
                suppliers.map((supplier: ISupplier, index: number) => (
                  <tr
                    key={supplier.id || `supplier-${index}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0089A7]/10 border border-[#0089A7]/20 flex items-center justify-center shrink-0 text-[#0089A7]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-normal text-sm text-slate-800">{supplier.name}</p>
                          {supplier.company && (
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              {supplier.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {supplier.phone}
                        </p>
                        {supplier.email && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {supplier.email}
                          </p>
                        )}
                        {supplier.address && (
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{supplier.address}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                      <span className={supplier.totalDue > 0 ? "text-red-500" : "text-emerald-500"}>
                        ৳ {supplier.totalDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-normal border ${
                          supplier.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="p-2 text-slate-400 hover:text-[#0089A7] hover:bg-[#0089A7]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(supplier)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPage > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
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

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={selectedSupplier}
      />
      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        supplier={supplierToDelete}
      />
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Suppliers"
        templateUrl="/api/v1/suppliers/export"
        importUrl="/api/v1/suppliers/import"
        onSuccess={() => refetch()}
      />
    </div>
  );
}
