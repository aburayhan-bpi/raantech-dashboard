"use client";

import CustomButton from "@/components/shared/CustomButton";
import { Icons } from "@/utils/icons";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteAccountModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function DeleteAccountModal({
  open,
  loading = false,
  onConfirm,
  onClose,
}: DeleteAccountModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, loading]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
            onClick={() => !loading && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-101 w-full max-w-sm rounded-3xl border border-border bg-card/85 p-6 shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => !loading && onClose()}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-error flex items-center justify-center mb-4 mt-2 shadow-lg shadow-error/20">
              <Icons.FaTrashCan className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold text-error mb-2">
              Delete Account
            </h3>

            <p className="text-sm text-muted-foreground text-center mb-8 max-w-60">
              Are you sure you want to delete your account?
            </p>

            <div className="flex items-center gap-4 w-full mt-4">
              <CustomButton
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                btnText="Cancel"
                className="flex-1 h-12 rounded-2xl bg-white/5 border border-border text-foreground hover:bg-white/10 hover:text-foreground transition-colors disabled:opacity-50 hover:cursor-pointer"
              />
              <CustomButton
                type="button"
                variant="default"
                onClick={onConfirm}
                disabled={loading}
                loading={loading}
                btnText="Delete"
                className="flex-1 h-12 rounded-2xl border-none bg-error text-white hover:bg-error/90 transition-colors hover:cursor-pointer disabled:opacity-50"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
