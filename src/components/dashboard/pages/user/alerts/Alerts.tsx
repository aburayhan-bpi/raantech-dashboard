"use client";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_ALERTS = [
  {
    id: 1,
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 241,
    createdAt: "Jun 10, 2026",
    active: true,
  },
  {
    id: 2,
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 315,
    createdAt: "Jun 12, 2026",
    active: true,
  },
  {
    id: 3,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 126,
    createdAt: "Jun 14, 2026",
    active: false,
  },
  {
    id: 4,
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 707,
    createdAt: "Jun 15, 2026",
    active: true,
  },
  {
    id: 5,
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 220,
    createdAt: "Jun 18, 2026",
    active: false,
  },
  {
    id: 6,
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 138,
    createdAt: "Jun 20, 2026",
    active: true,
  },
];

type FilterType = "All" | "Active" | "Disable";

export default function Alerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState<FilterType>("All");
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert,
      ),
    );
  };

  const handleDelete = async () => {
    if (itemToDelete !== null) {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const alertToRemove = alerts.find((a) => a.id === itemToDelete);
      setAlerts((prev) => prev.filter((alert) => alert.id !== itemToDelete));
      toast.success(`${alertToRemove?.symbol} alert removed successfully.`);

      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "Active") return alert.active;
    if (filter === "Disable") return !alert.active;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-6 sm:space-y-8 min-w-0">
      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
        {(["All", "Active", "Disable"] as FilterType[]).map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all hover:cursor-pointer whitespace-nowrap shrink-0",
                isActive
                  ? "border-brand text-brand bg-transparent"
                  : "border-border text-muted-foreground hover:bg-white/5",
              )}
            >
              {tab} Alert
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4 w-full min-w-0">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={alert.id}
              className="w-full rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 hover:bg-white/5 transition-colors overflow-hidden"
            >
              {/* Left Group */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 flex-[1.5] min-w-0">
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>

                  {/* Price Alert */}
                  <div className="flex flex-col min-w-0 flex-1 truncate">
                    <span className="golden-gradient-text font-medium text-sm sm:text-base truncate">
                      Price Alert
                    </span>
                    <span className="text-foreground text-sm sm:text-base truncate">
                      In {alert.price}$
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 flex-2 min-w-0 ml-13 sm:ml-0">
                  {/* Symbol Info */}
                  <div className="flex flex-col min-w-0 w-full truncate">
                    <span className="text-foreground font-semibold text-sm sm:text-base truncate">
                      {alert.symbol}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm truncate">
                      ({alert.name})
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-xs sm:text-sm text-muted-foreground w-full mt-1 sm:mt-0">
                    Created {alert.createdAt}
                  </div>
                </div>
              </div>

              {/* Actions & Toggle Group */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 mt-2 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-none border-border ml-13 lg:ml-0 pl-0 lg:pl-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium min-w-14 text-right",
                      alert.active ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {alert.active ? "Active" : "Disable"}
                  </span>

                  {/* Toggle Switch */}
                  <div
                    onClick={() => toggleAlert(alert.id)}
                    className={cn(
                      "w-11 h-6 rounded-full p-1 flex items-center transition-colors hover:cursor-pointer shadow-inner shrink-0",
                      alert.active ? "bg-success" : "bg-muted-foreground/30",
                    )}
                  >
                    <motion.div
                      layout
                      className="w-4 h-4 rounded-full bg-foreground shadow-sm"
                      animate={{
                        x: alert.active ? 20 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 border-l border-border/50 pl-4 sm:pl-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setItemToDelete(alert.id)}
                    className="text-error hover:bg-error/10 p-1.5 sm:p-2 rounded-lg transition-colors hover:cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      router.push(
                        `/dashboard/user/asset/${alert.symbol.toLowerCase()}`,
                      )
                    }
                    className="text-foreground hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-colors hover:cursor-pointer"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-muted-foreground"
          >
            No alerts found.
          </motion.div>
        )}
      </div>

      <ConfirmModal
        open={itemToDelete !== null}
        title="Delete Alert"
        description="Are you sure you want to delete this alert? This action cannot be undone."
        confirmText="Delete"
        tone="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
      />
    </div>
  );
}
