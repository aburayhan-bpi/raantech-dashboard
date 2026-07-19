"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface PlanData {
  id?: string;
  name: string;
  price: string;
  highlight: boolean;
  features: string[];
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PlanData | null;
  onSave: (data: PlanData) => void;
}

const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors relative flex items-center shrink-0 cursor-pointer",
      checked ? "bg-brand" : "bg-muted-foreground",
    )}
  >
    <div
      className={cn(
        "w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform shadow-md",
        checked ? "translate-x-5 sm:translate-x-6" : "translate-x-0",
      )}
    />
  </button>
);

export default function PlanModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: PlanModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [highlight, setHighlight] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen && !prevIsOpen) {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price);
      setHighlight(initialData.highlight);
      setFeatures(
        initialData.features.length > 0 ? initialData.features : [""],
      );
    } else {
      setName("");
      setPrice("");
      setHighlight(false);
      setFeatures([""]);
    }
    setPrevIsOpen(true);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    if (newFeatures.length === 0) newFeatures.push("");
    setFeatures(newFeatures);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const newFeatures = [...features];
    newFeatures[index] = val;
    setFeatures(newFeatures);
  };

  const handleSubmit = () => {
    onSave({
      id: initialData?.id,
      name,
      price,
      highlight,
      features: features.filter((f) => f.trim() !== ""),
    });
    onClose();
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg max-h-[90vh] bg-popover border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Glow effect at top left */}
        <div
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(255, 212, 81, 0.15)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-6 relative z-10">
          <h2 className="text-lg font-semibold text-white absolute left-1/2 -translate-x-1/2">
            {initialData ? "Edit Plan" : "Create New Plan"}
          </h2>
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full px-6 mx-auto h-px bg-white/5 relative z-10" />

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10">
          {/* Plan Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">Plan Name</label>
            <input
              type="text"
              placeholder="Enter plan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Plan Price */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">
              Plan Price ($)
            </label>
            <input
              type="text"
              placeholder="Enter plan price amount"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {/* Highlight */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Highlight</label>
            <Switch checked={highlight} onChange={setHighlight} />
          </div>

          {/* Plan Feature */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white">
              Plan Feature
            </label>
            <div className="flex flex-col gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Explain plan feature"
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
                  />
                  <button
                    onClick={() => handleRemoveFeature(idx)}
                    className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-red-500 stroke-[2.5]" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddFeature}
                className="w-full h-10 rounded-xl bg-white flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 text-green-500 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-4 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/20 bg-accent text-gray-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl golden-gradient-card border-none! text-black text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
