"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import CustomButton from "@/components/shared/CustomButton";

type ConfirmModalTone = "default" | "danger";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmModalTone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "default",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close confirm dialog"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-101 w-full max-w-md rounded-24 border border-border bg-background p-5 shadow-[0_20px_60px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className=" inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:cursor-pointer hover:bg-muted hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <CustomButton
            type="button"
            variant="outline"
            className="w-full sm:w-auto hover:cursor-pointer bg-transparent text-foreground border-white/10 hover:bg-white/5 hover:text-foreground transition-colors"
            onClick={onClose}
            disabled={loading}
            btnText={cancelText}
          />

          <CustomButton
            type="button"
            variant="default"
            className={`w-full sm:w-auto hover:cursor-pointer border-none transition-all ${
              tone === "danger"
                ? "bg-[#ff4757] text-white hover:bg-[#ff4757]/90"
                : "bg-linear-to-r from-[#ffd451] via-[#fff7a4] to-[#ffd73c] text-black hover:opacity-90"
            }`}
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            btnText={confirmText}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
