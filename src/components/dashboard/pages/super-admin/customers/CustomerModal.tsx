"use client";
import { ICustomer } from "@/types/global";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin } from "lucide-react";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "@/redux/api/customer/customerApi";
import CustomButton from "@/components/shared/CustomButton";
import { toast } from "sonner";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: ICustomer | null;
}

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAlternatePhone(customer.alternatePhone || "");
      setEmail(customer.email || "");
      setAddress(customer.address || "");
    } else {
      setName("");
      setPhone("");
      setAlternatePhone("");
      setEmail("");
      setAddress("");
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Name and Phone are required.");
      return;
    }

    const payload = {
      name,
      phone,
      alternatePhone: alternatePhone || undefined,
      email: email || undefined,
      address: address || undefined,
    };

    try {
      if (customer) {
        await updateCustomer({ id: customer.id, data: payload }).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully");
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-medium text-slate-800">
            {customer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alt Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none h-20"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              icon={<X className="w-4 h-4" />} btnText="Cancel"
              disabled={isLoading}
            />
            <CustomButton
              type="submit"
              variant="default"
              btnText={customer ? "Save Changes" : "Create Customer"}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
