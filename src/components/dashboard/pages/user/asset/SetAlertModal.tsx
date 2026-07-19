"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface SetAlertModalProps {
  onClose: () => void;
}

const Checkbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <div
    className="flex items-center gap-3 cursor-pointer select-none group"
    onClick={onChange}
  >
    <div
      className={cn(
        "w-5 h-5 rounded-[5px] flex items-center justify-center transition-all",
        checked
          ? "bg-brand border-none"
          : "border-[1.5px] border-muted-foreground/40 bg-transparent group-hover:border-muted-foreground/70",
      )}
    >
      {checked && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
    </div>
    <span
      className={cn(
        "text-[15px] font-medium transition-colors",
        checked
          ? "golden-gradient-text"
          : "text-[#b4b4b4] group-hover:text-foreground",
      )}
    >
      {label}
    </span>
  </div>
);

const NumberControl = ({
  value,
  onDecrease,
  onIncrease,
  onChange,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (val: number) => void;
}) => (
  <div className="flex items-center gap-2 select-none">
    <button
      onClick={onDecrease}
      className="w-7 h-7 rounded-md bg-[#252525] hover:bg-[#303030] flex items-center justify-center transition-colors shrink-0"
    >
      <Minus className="w-3.5 h-3.5 text-[#b4b4b4]" />
    </button>
    <input
      type="number"
      min="0"
      value={value.toString()}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        onChange(isNaN(val) ? 0 : val);
      }}
      className="w-14 h-7 text-center rounded-md border border-border bg-[#1a1a1a] text-sm font-medium text-foreground outline-none focus:border-brand/50 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none appearance-none"
    />
    <button
      onClick={onIncrease}
      className="w-7 h-7 rounded-md bg-[#252525] hover:bg-[#303030] flex items-center justify-center transition-colors shrink-0"
    >
      <Plus className="w-3.5 h-3.5 text-[#b4b4b4]" />
    </button>
  </div>
);

export default function SetAlertModal({ onClose }: SetAlertModalProps) {
  const [alerts, setAlerts] = useState({
    price: { enabled: true, value: 241 },
    breakout: { enabled: false, value: 235 },
    signal: { enabled: false, value: "Bullish" },
    volume: { enabled: false, value: 2.5 },
  });

  const [delivery, setDelivery] = useState({
    email: false,
    push: false,
    discord: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateValue = (
    key: "price" | "breakout" | "volume",
    amount: number,
  ) => {
    setAlerts((prev) => {
      // For volume use smaller step, else 1
      const newValue = Number((prev[key].value + amount).toFixed(1));
      return {
        ...prev,
        [key]: { ...prev[key], value: newValue > 0 ? newValue : 0 },
      };
    });
  };

  const setExactValue = (
    key: "price" | "breakout" | "volume",
    value: number,
  ) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: value > 0 ? value : 0 },
    }));
  };

  const toggleDelivery = (key: keyof typeof delivery) => {
    setDelivery((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log("=== Asset Alert Configuration ===");
    console.log({ alerts, delivery });
    toast.success("Alert successfully set!");
    onClose();
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    // No onClick on the background to ensure it only closes via X button
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121212] border border-white/10 w-105 max-w-[90vw] rounded-24 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 relative">
          <h2 className="text-base font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
            Set Alert
          </h2>
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-white/5 mb-2" />

        {/* Body */}
        <div className="px-6 pb-6 pt-2 space-y-6">
          {/* Alerts Group */}
          <div className="space-y-4">
            {/* Price Alert */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={alerts.price.enabled}
                onChange={() => toggleAlert("price")}
                label="Price Alert ($)"
              />
              <NumberControl
                value={alerts.price.value}
                onDecrease={() => updateValue("price", -1)}
                onIncrease={() => updateValue("price", 1)}
                onChange={(val) => setExactValue("price", val)}
              />
            </div>

            {/* Breakout Alert */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={alerts.breakout.enabled}
                onChange={() => toggleAlert("breakout")}
                label="Breakout Alert ($)"
              />
              <NumberControl
                value={alerts.breakout.value}
                onDecrease={() => updateValue("breakout", -1)}
                onIncrease={() => updateValue("breakout", 1)}
                onChange={(val) => setExactValue("breakout", val)}
              />
            </div>

            {/* Signal Alert */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={alerts.signal.enabled}
                onChange={() => toggleAlert("signal")}
                label="Signal Alert"
              />
              <div className="flex items-center gap-2" ref={dropdownRef}>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-7 px-3 rounded-md border border-border bg-[#1a1a1a] flex items-center gap-2 text-sm font-medium hover:bg-[#252525] transition-colors"
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        alerts.signal.value === "Bullish"
                          ? "bg-success"
                          : "bg-error",
                      )}
                    />
                    <span className="text-foreground text-xs">
                      {alerts.signal.value}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-28 bg-[#1a1a1a] border border-border rounded-lg shadow-xl overflow-hidden z-20">
                      <button
                        onClick={() => {
                          setAlerts((p) => ({
                            ...p,
                            signal: { ...p.signal, value: "Bullish" },
                          }));
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />{" "}
                        Bullish
                      </button>
                      <button
                        onClick={() => {
                          setAlerts((p) => ({
                            ...p,
                            signal: { ...p.signal, value: "Bearish" },
                          }));
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-error" />{" "}
                        Bearish
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-7 h-7 rounded-md bg-[#252525] hover:bg-[#303030] flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-[#b4b4b4]" />
                </button>
              </div>
            </div>

            {/* Volume Alert */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={alerts.volume.enabled}
                onChange={() => toggleAlert("volume")}
                label="Volume Alert (Million)"
              />
              <NumberControl
                value={alerts.volume.value}
                onDecrease={() => updateValue("volume", -0.1)}
                onIncrease={() => updateValue("volume", 0.1)}
                onChange={(val) => setExactValue("volume", val)}
              />
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Delivery Methods */}
          <div className="space-y-4 pt-1">
            <Checkbox
              checked={delivery.email}
              onChange={() => toggleDelivery("email")}
              label="Email"
            />
            <Checkbox
              checked={delivery.push}
              onChange={() => toggleDelivery("push")}
              label="Push Notification"
            />
            <Checkbox
              checked={delivery.discord}
              onChange={() => toggleDelivery("discord")}
              label="Discord Alerts"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 hover:cursor-pointer rounded-xl font-bold text-[15px] text-black golden-gradient-card border-none! hover:opacity-90 transition-opacity"
            >
              Set Alert
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
