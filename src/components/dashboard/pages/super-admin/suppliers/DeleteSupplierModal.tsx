"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteSupplierMutation, ISupplier } from "@/redux/api/supplier/supplierApi";

interface DeleteSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: ISupplier | null;
}

export default function DeleteSupplierModal({
  isOpen,
  onClose,
  supplier,
}: DeleteSupplierModalProps) {
  const [deleteSupplier, { isLoading }] = useDeleteSupplierMutation();

  if (!isOpen || !supplier) return null;

  const handleDelete = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supplierId = supplier._id || (supplier as any).id;
      await deleteSupplier(supplierId).unwrap();
      toast.success("Supplier deleted successfully");
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      toast.error(err?.data?.error || "Failed to delete supplier");
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
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">
              Delete Supplier
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-700">&quot;{supplier.name}&quot;</span>? 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
