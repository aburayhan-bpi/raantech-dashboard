"use client";

import { Pagination } from "@/components/dashboard/pagination";
import ConfirmModal from "@/components/shared/ConfirmModal";
import ExcelImportModal from "@/components/shared/ExcelImportModal";
import CustomButton from "@/components/shared/CustomButton";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import {
  IProduct,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/redux/api/product/productApi";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { Plus, Search, Trash2, Edit2, ArchiveRestore, Download, Upload } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ProductModal from "./ProductModal";
import ProductsStats from "./ProductsStats";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";

export default function ProductsClient() {
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const currentUser = useSelector(selectUser);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const userPermissions = currentUser?.permissions || [];
  const canCreate = isSuperAdmin || userPermissions.includes("products:create");
  const canUpdate = isSuperAdmin || userPermissions.includes("products:update");
  const canDelete = isSuperAdmin || userPermissions.includes("products:delete");

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const previousSearch = React.useRef(debouncedSearch);

  const [isDeletedView, setIsDeletedView] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [productToRestore, setProductToRestore] = useState<IProduct | null>(
    null,
  );
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    
    if (previousSearch.current === null && !debouncedSearch) {
      previousSearch.current = debouncedSearch;
      return;
    }

    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(
    `${sp.toString()}${isDeletedView ? "&isDeleted=true" : ""}`,
  );

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isRestoring }] =
    useUpdateProductMutation();

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  const handleEdit = (product: IProduct) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = (product: IProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreClick = (product: IProduct) => {
    setProductToRestore(product);
    setIsRestoreModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      // If we are in "Trash" view, we do hard delete. Otherwise, soft delete.
      await deleteProduct({
        slug: productToDelete.slug,
        hard: isDeletedView,
      }).unwrap();

      toast.success(
        isDeletedView
          ? "Product permanently deleted"
          : "Product moved to trash",
      );
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete product");
    }
  };

  const confirmRestore = async () => {
    if (!productToRestore) return;

    try {
      await updateProduct({
        slug: productToRestore.slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { isDeleted: false } as any,
      }).unwrap();

      toast.success("Product restored successfully");
      setIsRestoreModalOpen(false);
      setProductToRestore(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to restore product");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Products Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your inventory, prices, and product details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canDelete && (
            <CustomButton
              variant="outline"
              onClick={() => setIsDeletedView(!isDeletedView)}
              className={cn(
                isDeletedView && "bg-error/10 text-error border-error/20",
              )}
              btnText={
                <div className="flex items-center gap-2">
                  {isDeletedView ? (
                    <ArchiveRestore className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeletedView ? "View Active" : "View Trash"}
                </div>
              }
            />
          )}
          <CustomButton
            variant="outline"
            onClick={() => window.open('/api/v1/products/export', '_blank')}
            btnText={
              <div className="flex items-center text-slate-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </div>
            }
          />
          {canCreate && (
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
          )}
          {canCreate && (
            <CustomButton
              onClick={handleAddNew}
              variant="default"
              btnText={
                <div className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </div>
              }
            />
          )}
        </div>
      </div>

      {!isDeletedView && <ProductsStats />}

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-visible">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown
              options={[
                { label: "All Status", value: "" },
                { label: "Active", value: "ACTIVE" },
                { label: "Out of Stock", value: "OUT_OF_STOCK" },
                { label: "Discontinued", value: "DISCONTINUED" },
              ]}
              value={sp.get("status") || ""}
              onChange={(val) => setParams({ status: val || null, page: "1" })}
              placeholder="Filter by Status"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded"></div>
                          <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                        <div className="h-3 w-20 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-slate-100 shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-xs text-slate-400">
                              No Img
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 truncate max-w-50">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            SKU: {product.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {product.category?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          ৳{product.sellingPrice}
                        </span>
                        <span className="text-xs text-slate-500">
                          Buy: ৳{product.buyingPrice}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            product.stock === 0
                              ? "text-error"
                              : product.stock <= product.alertQuantity
                                ? "text-warning"
                                : "text-success",
                          )}
                        >
                          {product.stock} {product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full",
                          product.status === "ACTIVE" &&
                            "bg-success/10 text-success",
                          product.status === "DRAFT" &&
                            "bg-slate-100 text-slate-700",
                          product.status === "OUT_OF_STOCK" &&
                            "bg-error/10 text-error",
                          product.status === "DISCONTINUED" &&
                            "bg-warning/10 text-warning",
                        )}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isDeletedView ? (
                          <>
                            {canUpdate && (
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {canUpdate && (
                              <button
                                onClick={() => handleRestoreClick(product)}
                                className="p-2 text-slate-400 hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                                title="Restore"
                              >
                                <ArchiveRestore className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                title="Permanent Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > meta.limit && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
            />
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />

      {/* Delete/Hard Delete Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        title={isDeletedView ? "Permanent Delete Product" : "Move to Trash"}
        description={
          isDeletedView
            ? "WARNING: Are you sure you want to PERMANENTLY delete this product? This action cannot be undone and all data related to this product will be lost forever."
            : "Are you sure you want to delete this product? The product will be moved to Trash and you can restore it later."
        }
        confirmText={isDeletedView ? "Delete Permanently" : "Move to Trash"}
        tone="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Restore Modal */}
      <ConfirmModal
        open={isRestoreModalOpen}
        title="Restore Product"
        description="Are you sure you want to restore this product from trash? It will be active again."
        confirmText="Restore Product"
        tone="default"
        loading={isRestoring}
        onConfirm={confirmRestore}
        onClose={() => setIsRestoreModalOpen(false)}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Products"
        templateUrl="/api/v1/products/export"
        importUrl="/api/v1/products/import"
        onSuccess={() => refetch()}
      />
    </div>
  );
}
