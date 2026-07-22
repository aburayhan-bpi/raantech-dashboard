import React from "react";
import { AlertTriangle } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useDeleteCategoryMutation } from "@/redux/api/category/categoryApi";
import { toast } from "sonner";
import { ICategory } from "./CategoryClient";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ICategory | null;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
}: DeleteCategoryModalProps) {
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    try {
      await deleteCategory(category._id).unwrap();
      toast.success("Category deleted successfully");
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      toast.error(err?.data?.error || "Failed to delete category");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Delete Category?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete <strong className="text-slate-700">{category.name}</strong>? This action cannot be undone.
            </p>
          </div>

          <div className="pt-4 flex gap-3 w-full">
            <CustomButton
              type="button"
              onClick={onClose}
              variant="outline"
              btnText="Cancel"
              className="flex-1"
            />
            <CustomButton
              type="button"
              onClick={handleDelete}
              variant="destructive"
              btnText="Delete"
              loading={isLoading}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
