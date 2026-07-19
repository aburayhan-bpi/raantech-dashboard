"use client";

import { Icons } from "@/utils/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New user registered. John Smith created a new account.",
    time: "8 min ago",
  },
  {
    id: 2,
    title:
      "Premium subscription activated. Sarah Wilson upgraded to Premium plan.",
    time: "15 min ago",
  },
  {
    id: 3,
    title:
      "AI Signal system updated\nNew market analysis data has been processed.",
    time: "30 min ago",
  },
  {
    id: 4,
    title:
      "Payment received.\n$49 subscription payment completed successfully.",
    time: "1 hour ago",
  },
];

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  // Lock body scroll when open to prevent background scrolling
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

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Safe portal rendering (respecting SSR rules, no synchronous effects)
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Centered Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full bg-brand/16 max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-brand/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-4 relative shrink-0 border-b border-brand/10">
              <h2 className="text-sm sm:text-base font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
                Notification
              </h2>
              <div className="w-full flex justify-end relative z-10">
                <motion.button
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{
                    type: "keyframes",
                    stiffness: 900,
                    damping: 600,
                  }}
                  onClick={onClose}
                  className="group text-gray-400 hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-brand/10 transition-all"
                  aria-label="Close modal"
                >
                  <Icons.MdOutlineClose className="w-4 h-4 sm:w-5 sm:h-5 " />
                </motion.button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex flex-col p-2 sm:p-3 overflow-y-auto custom-scrollbar">
              {NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-brand/5 rounded-xl sm:rounded-2xl transition-colors cursor-pointer hover:cursor-pointer group"
                >
                  {/* Dot Indicator */}
                  <div className="pt-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 group-hover:w-2 group-hover:h-2 rounded-full bg-white/60 group-hover:bg-brand transition-all duration-300 ease-in-out shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_8px_var(--brand)]" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-snug whitespace-pre-line group-hover:text-foreground transition-colors">
                      {notif.title}
                    </p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium">
                      {notif.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// style={{
//               backgroundColor:
//                 "color-mix(in srgb, var(--brand) 6%, rgba(11, 11, 11, 0.85))",
//               backdropFilter: "blur(40px)",
//               WebkitBackdropFilter: "blur(40px)",
//             }}
