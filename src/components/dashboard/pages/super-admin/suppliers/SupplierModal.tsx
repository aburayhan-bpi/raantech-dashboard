"use client";

import { useState, useEffect } from "react";
import { X, Building2, Phone, Mail, MapPin } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { toast } from "sonner";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  ISupplier,
} from "@/redux/api/supplier/supplierApi";
import { SupplierStatus } from "@/types/backend";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: ISupplier | null;
}

export default function SupplierModal({
  isOpen,
  onClose,
  supplier,
}: SupplierModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<SupplierStatus>("ACTIVE");

  const [createSupplier, { isLoading: isCreating }] =
    useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] =
    useUpdateSupplierMutation();

  const isEditing = !!supplier;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setName(supplier?.name || "");
        setCompany(supplier?.company || "");
        setPhone(supplier?.phone || "");
        setEmail(supplier?.email || "");
        setAddress(supplier?.address || "");
        setStatus(supplier?.status || "ACTIVE");
      }, 0);
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      const payload = {
        name,
        company,
        phone,
        email,
        address,
        status,
      };

      if (isEditing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supplierId = supplier._id || (supplier as any).id;
        await updateSupplier({ id: supplierId, data: payload }).unwrap();
        toast.success("Supplier updated successfully");
      } else {
        await createSupplier(payload).unwrap();
        toast.success("Supplier created successfully");
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      toast.error(err?.data?.error || "Failed to save supplier");
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
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? "Edit Supplier" : "Add New Supplier"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-slate-700">
              Company Name (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Ltd."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="supplier@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-slate-700">
              Address (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address..."
                rows={2}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <div className="flex bg-slate-100 p-1 rounded-xl w-max">
              <button
                type="button"
                onClick={() => setStatus("ACTIVE")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === "ACTIVE"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("INACTIVE")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === "INACTIVE"
                    ? "bg-white text-rose-500 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <CustomButton
              type="button"
              onClick={onClose}
              variant="outline"
              icon={<X className="w-4 h-4" />} btnText="Cancel"
            />
            <CustomButton
              type="submit"
              variant="default"
              btnText={isEditing ? "Save Changes" : "Add Supplier"}
              loading={isLoading}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
