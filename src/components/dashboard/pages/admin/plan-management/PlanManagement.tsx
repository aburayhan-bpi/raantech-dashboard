"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PlusCircle,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import PlanModal, { PlanData } from "./PlanModal";

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
      checked ? "bg-brand" : "bg-gray-500/50",
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

const DEFAULT_PLANS: PlanData[] = [
  {
    id: "1",
    name: "Free",
    price: "0",
    highlight: false,
    features: [
      "5 stocks on watchlist",
      "Basic AI signals (delayed)",
      "End-of-day price alerts (3 max)",
      "Daily market summary",
      "Community forum access",
    ],
  },
  {
    id: "2",
    name: "Premium",
    price: "120",
    highlight: true,
    features: [
      "Unlimited watchlist",
      "Real-time AI buy/sell signals",
      "Unlimited instant alerts",
      "Multi-timeframe S/R analysis",
      "AI price target projections",
      "Volume confirmation signals",
      "Momentum & trend scoring",
      "Premium Discord community",
      "Priority email support",
      "API access (coming soon)",
    ],
  },
];

export default function PlanManagement() {
  const [plans, setPlans] = useState<PlanData[]>(DEFAULT_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanData | null>(null);

  const handleToggleHighlight = (id: string, highlight: boolean) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, highlight } : p)));
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanData) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = (planData: PlanData) => {
    if (planData.id) {
      setPlans(plans.map((p) => (p.id === planData.id ? planData : p)));
    } else {
      setPlans([
        ...plans,
        { ...planData, id: Math.random().toString(36).substring(7) },
      ]);
    }
  };

  const handleDeletePlan = () => {
    if (planToDelete) {
      setPlans(plans.filter((p) => p.id !== planToDelete.id));
      setPlanToDelete(null);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col min-w-0 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-0">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-brand" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Pricing Plan Management
        </h1>
      </div>

      <div className="flex flex-col xl:flex-row flex-wrap gap-6 w-full items-stretch px-0">
        <AnimatePresence mode="popLayout">
          {plans.map((plan, index) => {
            const isPremium = plan.highlight;

            if (isPremium) {
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-1 w-full xl:min-w-80 max-w-sm xl:max-w-md relative isolate rounded-3xl shadow-2xl overflow-hidden bg-brand/5 border border-brand/20"
                >
                  <div className="absolute inset-0 bg-[url('/subscription_card_bg_grid.png')] bg-cover bg-center -z-20" />
                  <div
                    className="absolute inset-0 -z-10"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(255, 212, 81, 0.35) 0%, transparent 60%)",
                    }}
                  />

                  <div className="p-8 flex flex-col h-full w-full relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand fill-brand" />
                        <h2 className="text-xl font-bold golden-gradient-text">
                          {plan.name}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">
                          Highlight
                        </span>
                        <Switch
                          checked={plan.highlight}
                          onChange={(v) => handleToggleHighlight(plan.id!, v)}
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-5xl font-bold text-white leading-none">
                        {plan.price}$
                      </span>
                      <span className="text-gray-400 text-sm mb-1">/month</span>
                    </div>

                    <div className="w-full h-px bg-brand/20 mb-8" />

                    <div className="flex-1 flex flex-col gap-4 mb-10">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
                          <span className="text-sm text-white leading-tight wrap-break-word pr-2">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-auto shrink-0">
                      <button
                        onClick={() => handleOpenEdit(plan)}
                        className="flex-1 h-11 rounded-xl bg-white text-black text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Edit Plan
                      </button>
                      <button
                        onClick={() => setPlanToDelete(plan)}
                        className="w-11 h-11 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-1 w-full xl:min-w-80 max-w-sm xl:max-w-md bg-card rounded-3xl border border-white/10 p-8 flex flex-col shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      Highlight
                    </span>
                    <Switch
                      checked={plan.highlight}
                      onChange={(v) => handleToggleHighlight(plan.id!, v)}
                    />
                  </div>
                </div>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-5xl font-bold text-white leading-none">
                    {plan.price}$
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/month</span>
                </div>

                <div className="w-full h-px bg-white/10 mb-8" />

                <div className="flex-1 flex flex-col gap-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      <span className="text-sm text-gray-300 leading-tight wrap-break-word pr-2">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-auto shrink-0">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 h-11 rounded-xl bg-white text-black text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => setPlanToDelete(plan)}
                    className="w-11 h-11 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Create New Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: plans.length * 0.1 }}
          onClick={handleOpenCreate}
          className="flex-1 w-full xl:min-w-80 max-w-sm xl:max-w-md h-72 xl:h-auto min-h-72 bg-card rounded-3xl border border-white/5 hover:border-white/20 hover:bg-accent transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-white shrink-0"
        >
          <div className="flex flex-col items-center gap-4">
            <PlusCircle className="w-8 h-8" />
            <span className="text-lg font-semibold">Create New Plan</span>
          </div>
        </motion.div>
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingPlan}
        onSave={handleSavePlan}
      />

      {typeof document !== "undefined" &&
        planToDelete &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-popover border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Delete Plan?
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Are you sure you want to delete the{" "}
                <strong className="text-white">{planToDelete.name}</strong>{" "}
                plan? This action cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setPlanToDelete(null)}
                  className="flex-1 py-2.5 text-sm rounded-xl border border-white/20 bg-accent text-gray-300 font-semibold hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>,
          document.body,
        )}
    </div>
  );
}
