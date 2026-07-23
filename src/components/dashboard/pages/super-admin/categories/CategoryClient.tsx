"use client";

import CustomButton from "@/components/shared/CustomButton";
import { TableRowsSkeleton } from "@/components/shared/TableRowsSkeleton";
import { Pagination } from "@/components/dashboard/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { format } from "date-fns";
import { Edit2, Image as ImageIcon, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export default function CategoryClient() {
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const [searchTerm, setSearchTerm] = useState(sp.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const previousSearch = useRef(debouncedSearch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);

  const currentUser = useSelector(selectUser);
  const userPermissions = currentUser?.permissions || [];
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const canCreate = isSuperAdmin || userPermissions.includes('categories:create');
  const canUpdate = isSuperAdmin || userPermissions.includes('categories:update');
  const canDelete = isSuperAdmin || userPermissions.includes('categories:delete');

  useEffect(() => {
    if (previousSearch.current === debouncedSearch) return;
    previousSearch.current = debouncedSearch;
    setParams({ search: debouncedSearch || null, page: "1" });
  }, [debouncedSearch, setParams]);

  const { data, isLoading, isFetching } = useGetCategoriesQuery(sp.toString());

  const categories = data?.data || [];
  const meta = data?.meta;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (category: ICategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: ICategory) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product categories
          </p>
        </div>
        {canCreate && (
          <CustomButton
            onClick={handleAdd}
            icon={<Plus className="w-4 h-4" />}
            btnText="Add Category"
            variant="default"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search categories..."
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
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || isFetching ? (
                <TableRowsSkeleton cols={4} rows={5} />
              ) : categories.length > 0 ? (
                categories.map((category: ICategory, index: number) => (
                  <tr
                    key={category._id || `category-${index}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-medium text-slate-700">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 line-clamp-1">
                        {category.description || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(category.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-slate-400 hover:text-[#0089A7] hover:bg-[#0089A7]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(category)}
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
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No categories found.
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={categoryToDelete}
      />
    </div>
  );
}
