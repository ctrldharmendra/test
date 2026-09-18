
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FaCircleExclamation,
  FaXmark,
} from "react-icons/fa6";

export default function ConfirmationModal({
  open,
  title = "Are you sure?",
  description = "Do you want to change this setting?",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="
              fixed inset-0 z-[90]
              bg-black/75
              backdrop-blur-sm
            "
          />

          {/* Modal wrapper */}
          <div
            className="
              fixed inset-0 z-[100]
              flex items-end
              justify-center
              px-3
              pb-3
              sm:items-center
              sm:px-4
              sm:pb-0
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full
                z-[999999999999999999999999999999999999999999999999999999999999999999999999]
                max-w-[430px]
                overflow-hidden
                rounded-[28px]
                border border-white/[0.08]
                bg-[#151515]
                p-5
                shadow-[0_20px_80px_rgba(0,0,0,0.65)]
                sm:rounded-[26px]
              "
            >
              {/* Close */}
              <button
                type="button"
                onClick={onCancel}
                className="
                  absolute
                  right-4
                  top-4
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  bg-white/[0.06]
                  text-white/40
                  transition
                  hover:bg-white/10
                  hover:text-white
                  active:scale-90
                "
              >
                <FaXmark className="text-xs" />
              </button>

              {/* Icon */}
              <div
                className="
                  mb-4
                  flex h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-red-500/10
                  text-red-500
                "
              >
                <FaCircleExclamation className="text-lg" />
              </div>

              {/* Content */}
              <div className="pr-8">
                <h2 className="text-lg font-bold text-white">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {description}
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="
                    rounded-2xl
                    border border-white/[0.08]
                    bg-white/[0.05]
                    px-4 py-3.5
                    text-sm
                    font-semibold
                    text-white/70
                    transition
                    hover:bg-white/[0.08]
                    active:scale-[0.98]
                  "
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  className="
                    rounded-2xl
                    bg-red-500
                    px-4 py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_8px_30px_rgba(239,68,68,0.2)]
                    transition
                    hover:bg-red-600
                    active:scale-[0.98]
                  "
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
