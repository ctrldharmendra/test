"use client";

import {
  IoArrowBack,
  IoCheckmark,
  IoEllipsisHorizontal,
} from "react-icons/io5";

export default function NotificationLoading() {
  const notifications = Array.from({ length: 9 });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[600px]">
        {/* ================= HEADER ================= */}
        <header className="relative flex h-[52px] items-center justify-center border-b border-zinc-900">
          {/* Back button */}
          <div className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1b1b1b]">
            <IoArrowBack className="text-[20px] text-zinc-600" />
          </div>

          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-[105px] animate-pulse rounded bg-zinc-800" />

            {/* Notification count */}
            <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-700" />
          </div>
        </header>

        {/* ================= MARK ALL READ ================= */}
        <div className="flex justify-end px-5 py-6">
          <div className="flex items-center gap-2">
            <IoCheckmark className="text-[15px] text-zinc-600" />

            <div className="h-3 w-[90px] animate-pulse rounded bg-zinc-800" />
          </div>
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <div className="space-y-1 px-2">
          {notifications.map((_, index) => (
            <NotificationSkeleton
              key={index}
              highlighted={index < 4}
            />
          ))}
        </div>

        {/* Bottom spacing */}
        <div className="h-10" />
      </div>
    </main>
  );
}


/* =========================================================
   NOTIFICATION SKELETON
========================================================= */

function NotificationSkeleton({ highlighted }) {
  return (
    <div
      className={`
        relative
        flex
        min-h-[72px]
        items-center
        rounded-[20px]
        px-3
        py-2.5
        ${highlighted ? "bg-[#303030]" : "bg-transparent"}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-[48px] w-[48px] animate-pulse rounded-full bg-zinc-700" />

        {/* Notification type badge */}
        <div
          className="
            absolute
            -bottom-1
            -right-1
            flex
            h-[30px]
            w-[30px]
            animate-pulse
            items-center
            justify-center
            rounded-full
            border-[2px]
            border-[#080808]
            bg-zinc-700
          "
        />
      </div>

      {/* Notification content */}
      <div className="ml-3 min-w-0 flex-1">
        {/* First line */}
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-[72px] animate-pulse rounded bg-zinc-600" />

          <div className="h-3 w-[125px] animate-pulse rounded bg-zinc-700" />
        </div>

        {/* Second line */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2.5 w-7 animate-pulse rounded bg-zinc-700" />

          <div className="h-1 w-1 rounded-full bg-zinc-700" />

          {highlighted && (
            <div className="h-2.5 w-6 animate-pulse rounded bg-zinc-700" />
          )}
        </div>
      </div>

      {/* Three dots */}
      <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center">
        <IoEllipsisHorizontal className="text-[18px] text-zinc-700" />
      </div>
    </div>
  );
}
