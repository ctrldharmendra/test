"use client";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen max-w-[600px] mx-auto bg-[#050505] text-white">
      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #171717 25%,
            #2a2a2a 50%,
            #171717 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <div className="h-[39px] border-b border-[#1b1b1b] flex items-center px-4">
        {/* Back */}
        <div className="w-5 h-5 skeleton rounded-full" />

        {/* Username */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="w-16 h-3 skeleton rounded" />
        </div>

        {/* More */}
        <div className="ml-auto w-5 h-5 skeleton rounded-full" />
      </div>

      {/* ================= PROFILE ================= */}
      <div className="pt-6">
        <div className="flex items-center px-1 gap-5">

          {/* Profile Image */}
          <div className="w-[120px] h-[120px] rounded-full bg-[#202020] p-[3px]">
            <div className="w-full h-full rounded-full skeleton" />
          </div>

          {/* Posts */}
          <div className="flex flex-col gap-2">
            <div className="w-8 h-5 skeleton rounded" />
            <div className="w-9 h-3 skeleton rounded" />
          </div>
        </div>

        {/* Name */}
        <div className="mt-5">
          <div className="w-36 h-5 skeleton rounded" />

          <div className="mt-2 w-16 h-3 skeleton rounded" />
        </div>

        {/* Message Button */}
        <div className="mt-5 h-[44px] w-[280px] bg-[#f5f5f5] rounded-xl flex items-center justify-center mx-auto">
          <div className="w-28 h-3.5 bg-[#d0d0d0] rounded skeleton" />
        </div>
      </div>

      {/* ================= USER INFO ================= */}
      <div className="grid grid-cols-2 gap-2 mt-3">

        <InfoCard />
        <InfoCard />

        <InfoCard />
        <InfoCard />

      </div>

      {/* ================= POSTS HEADER ================= */}
      <div className="mt-5 border-t border-[#1d1d1d] pt-4">

        <div className="w-14 h-4 skeleton rounded" />

        <div className="mt-1 w-10 h-3 skeleton rounded" />

      </div>

      {/* ================= POSTS GRID ================= */}
      <div className="grid grid-cols-3 gap-[2px] mt-3">

        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square skeleton"
          />
        ))}

      </div>

      {/* ================= BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-[#171918] border-t border-[#242424] flex items-center justify-around">

        <NavItem />
        <NavItem />
        <NavItem />

        {/* Add Button */}
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <div className="relative w-5 h-5">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-5 bg-black rounded" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-5 h-[2px] bg-black rounded" />
          </div>
        </div>

        <NavItem />
        <NavItem />

        {/* Profile */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 skeleton rounded-full" />
          <div className="w-8 h-2 skeleton rounded" />
        </div>

      </div>
    </div>
  );
}


/* ================= INFO CARD ================= */

function InfoCard() {
  return (
    <div className="h-[78px] rounded-xl border border-[#242424] bg-[#111] px-3 py-3">

      {/* Icon */}
      <div className="w-4 h-4 skeleton rounded-full mb-2" />

      {/* Main text */}
      <div className="w-24 h-3.5 skeleton rounded" />

      {/* Label */}
      <div className="mt-1.5 w-14 h-2.5 skeleton rounded opacity-60" />

    </div>
  );
}


/* ================= NAV ITEM ================= */

function NavItem() {
  return (
    <div className="w-6 h-6 skeleton rounded-md opacity-70" />
  );
}
