"use client";

import {
  IoEllipsisHorizontal,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoShareOutline,
} from "react-icons/io5";

export default function FeedLoading() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[600px]">
        {/* ================= POST HEADER ================= */}
        <header className="flex h-[62px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-800" />

            {/* User info */}
            <div className="space-y-1.5">
              {/* Name */}
              <div className="h-3.5 w-20 animate-pulse rounded bg-zinc-700" />

              {/* Username */}
              <div className="h-2.5 w-14 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>

          {/* Time + menu */}
          <div className="flex items-center gap-4">
            <div className="h-2.5 w-10 animate-pulse rounded bg-zinc-800" />

            <IoEllipsisHorizontal className="text-[20px] text-zinc-700" />
          </div>
        </header>

        {/* ================= IMAGE / MEDIA ================= */}
        <section className="px-[7px]">
          <div
            className="
              relative
              aspect-[4/5]
              w-full
              overflow-hidden
              bg-[#111]
              animate-pulse
            "
          >
            {/* Image placeholder */}

            {/* Center image loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-zinc-700 border-t-zinc-400" />
            </div>

            {/* Fake image composition */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-[12%] top-[18%] h-[30%] w-[55%] rounded-lg bg-zinc-600" />

              <div className="absolute right-[10%] top-[12%] h-[25%] w-[28%] rotate-12 rounded bg-zinc-500" />

              <div className="absolute bottom-[12%] left-[18%] h-[20%] w-[65%] rounded-full bg-zinc-700" />
            </div>

            {/* Shimmer */}
            <div
              className="
                absolute
                inset-y-0
                -left-[100%]
                w-[45%]
                skew-x-[-20deg]
                bg-gradient-to-r
                from-transparent
                via-white/[0.06]
                to-transparent
                animate-[shimmer_2s_infinite]
              "
            />
          </div>
        </section>

        {/* ================= ACTIONS ================= */}
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex items-center gap-5">
            {/* Like */}
            <IoHeartOutline className="text-[24px] text-zinc-700" />

            {/* Comment */}
            <IoChatbubbleOutline className="text-[23px] text-zinc-700" />

            {/* Share */}
            <IoShareOutline className="text-[23px] text-zinc-700" />
          </div>

          {/* Right side placeholder */}
          <div className="h-2.5 w-8 animate-pulse rounded bg-zinc-800" />
        </div>

        {/* ================= POST CONTENT ================= */}
        <div className="px-5 pb-5 pt-3">
          {/* Likes */}
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-700" />

          {/* Caption */}
          <div className="mt-3 space-y-2">
            <div className="h-3 w-[85%] animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-[60%] animate-pulse rounded bg-zinc-800" />
          </div>

          {/* Timestamp */}
          <div className="mt-4 h-2.5 w-12 animate-pulse rounded bg-zinc-800" />
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-900" />

        {/* ================= SECOND LOADING POST ================= */}
        <div className="mt-1">
          {/* Header */}
          <header className="flex h-[62px] items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />

              <div className="space-y-1.5">
                <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-700" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>

            <IoEllipsisHorizontal className="text-[20px] text-zinc-700" />
          </header>

          {/* Second image */}
          <div className="px-[7px]">
            <div className="relative aspect-[4/5] w-full animate-pulse bg-[#111]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>

      {/* ================= CUSTOM ANIMATION ================= */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }

          100% {
            left: 150%;
          }
        }
      `}</style>
    </main>
  );
}
