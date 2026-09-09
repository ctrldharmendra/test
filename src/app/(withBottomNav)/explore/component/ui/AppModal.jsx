"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";

export default function AppModal({
  open,
  onClose,
  title,
  children,
  showClose = true,
  height = "auto",
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[101] mx-auto w-full max-w-[600px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="overflow-hidden rounded-t-[30px] border border-white/10 bg-neutral-950 shadow-[0_-20px_80px_rgba(0,0,0,0.5)]"
              style={{
                height: height === "auto" ? undefined : height,
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 pt-4">
                <h2 className="text-lg font-bold text-white">
                  {title}
                </h2>

                {showClose && (
                  <button
                    onClick={onClose}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-full bg-white/10
                      text-white/70
                      transition
                      hover:bg-white/15
                      hover:text-white
                      active:scale-90
                    "
                  >
                    <FaXmark />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}