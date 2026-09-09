
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaXmark,
  FaHeart,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import Image from "next/image";

export default function LikeUsersSheet({
  open,
  onClose,
  users = [],
}) {
  // Prevent background scrolling while sheet is open
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              fixed inset-0 z-[90]
              bg-black/70
              backdrop-blur-[2px]
            "
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
            className="
              fixed inset-x-0 bottom-0 z-[100]
              mx-auto
              flex max-h-[80dvh]
              w-full max-w-[600px]
              flex-col
              overflow-hidden
              rounded-t-[28px]
              border-t border-white/10
              bg-[#111111]
              shadow-[0_-20px_60px_rgba(0,0,0,0.5)]
            "
          >
            {/* Handle */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Likes
                </h2>

                <p className="mt-0.5 text-xs text-white/40">
                  {users.length}{" "}
                  {users.length === 1 ? "person" : "people"} liked this
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  bg-white/[0.07]
                  text-white/60
                  transition
                  hover:bg-white/10
                  hover:text-white
                  active:scale-90
                "
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            {/* Search */}
            {/* <div className="px-4 pb-3">
              <div
                className="
                  flex items-center gap-3
                  rounded-xl
                  border border-white/[0.08]
                  bg-white/[0.05]
                  px-3.5 py-3
                "
              >
                <FaMagnifyingGlass className="text-xs text-white/30" />

                <input
                  type="text"
                  placeholder="Search likes..."
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                  "
                />
              </div>
            </div> */}

            {/* Users */}
            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                px-3
                pb-[calc(env(safe-area-inset-bottom)+20px)]
              "
            >
              {users?.length > 0 ? (
                <div className="space-y-1">
                  {users?.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="
                        flex w-full
                        items-center gap-3
                        rounded-2xl
                        px-2.5 py-3
                        text-left
                        transition
                        hover:bg-white/[0.04]
                        active:scale-[0.98]
                      "
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Image
                        width={10}
                        height={10}
                          src={user?.dp}
                          alt={user?.username || "ALT"}
                          className="
                            h-12 w-12
                            rounded-full
                            object-cover
                            ring-1 ring-white/10
                          "
                        />

                        {user.online && (
                          <span
                            className="
                              absolute
                              bottom-0 right-0
                              h-3.5 w-3.5
                              rounded-full
                              border-2
                              border-[#111111]
                              bg-green-500
                            "
                          />
                        )}
                      </div>

                      {/* User info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.fullName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-white/40">
                          @{user.username}
                        </p>
                      </div>

                      {/* Like icon */}
                      <div
                        className="
                          flex h-9 w-9
                          shrink-0
                          items-center justify-center
                          rounded-full
                          bg-red-500/10
                          text-red-500
                        "
                      >
                        <FaHeart className="text-xs" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div
                    className="
                      mx-auto mb-3
                      flex h-14 w-14
                      items-center justify-center
                      rounded-full
                      bg-white/[0.06]
                    "
                  >
                    <FaHeart className="text-lg text-white/20" />
                  </div>

                  <p className="text-sm text-white/50">
                    No likes yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
