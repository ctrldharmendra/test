"use client";

import {
  IoClose,
  IoChevronForward,
  IoChevronBack,
  IoHeartOutline,
  IoAdd,
  IoHome,
  IoCompassOutline,
  IoSearch,
  IoChatbubbleOutline,
  IoPersonOutline,
  IoLocationSharp,
} from "react-icons/io5";

import { FaVenusMars, FaBirthdayCake } from "react-icons/fa";

export default function ExploreLoading() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[600px] px-5">

        {/* ================= HEADER ================= */}
        <header className="flex items-start justify-between pt-4">
          <div>
            {/* Discover */}
            <div className="h-6 w-28 animate-pulse rounded-md bg-zinc-800" />

            {/* People near you */}
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-zinc-800" />
          </div>

          {/* Close button */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#202020]">
            <IoClose className="text-[21px] text-zinc-600" />
          </div>
        </header>

        {/* ================= FILTERS ================= */}
        <div className="mt-6 flex gap-2 overflow-hidden">

          {/* Any */}
          <div className="flex h-[42px] shrink-0 items-center gap-2 rounded-full border border-zinc-800 bg-[#202020] px-4">
            <FaVenusMars className="text-[14px] text-zinc-600" />

            <div className="h-3 w-7 animate-pulse rounded bg-zinc-700" />

            <IoChevronForward className="text-[15px] text-zinc-600" />
          </div>

          {/* Distance */}
          <div className="flex h-[42px] shrink-0 items-center gap-2 rounded-full border border-zinc-800 bg-[#202020] px-4">
            <IoLocationSharp className="text-[16px] text-zinc-600" />

            <div className="h-3 w-10 animate-pulse rounded bg-zinc-700" />

            <IoChevronForward className="text-[15px] text-zinc-600" />
          </div>

          {/* Age */}
          <div className="flex h-[42px] shrink-0 items-center gap-2 rounded-full border border-zinc-800 bg-[#202020] px-4">
            <FaBirthdayCake className="text-[15px] text-zinc-600" />

            <div className="h-3 w-12 animate-pulse rounded bg-zinc-700" />

            <IoChevronForward className="text-[15px] text-zinc-600" />
          </div>
        </div>

        {/* ================= PROFILE CARD ================= */}
        <section
          className="
            relative
            mt-3
            h-[560px]
            overflow-hidden
            rounded-[28px]
            border
            border-zinc-800
            bg-[#171717]
          "
        >
          {/* Main image skeleton */}
          <div
            className="
              absolute
              inset-0
              animate-pulse
              bg-gradient-to-br
              from-zinc-800
              via-zinc-700
              to-zinc-900
            "
          />

          {/* Fake window/image details */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[8%] top-[7%] h-[42%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[29%] top-[7%] h-[42%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[50%] top-[7%] h-[42%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[71%] top-[7%] h-[42%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[8%] top-[48%] h-[27%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[29%] top-[48%] h-[27%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[50%] top-[48%] h-[27%] w-[13%] rounded-md bg-zinc-600" />

            <div className="absolute left-[71%] top-[48%] h-[27%] w-[13%] rounded-md bg-zinc-600" />
          </div>

          {/* Bottom dark gradient */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[55%]
              bg-gradient-to-t
              from-black/95
              via-black/50
              to-transparent
            "
          />

          {/* ================= TOP LEFT BADGE ================= */}
          <div className="absolute left-4 top-4 h-8 w-12 animate-pulse rounded-full bg-zinc-700/80" />

          {/* ================= DISTANCE BADGE ================= */}
          <div className="absolute right-4 top-4 flex h-8 w-16 items-center justify-center gap-1 rounded-full bg-zinc-700/80">
            <IoLocationSharp className="text-[13px] text-zinc-500" />

            <div className="h-2.5 w-7 animate-pulse rounded bg-zinc-500" />
          </div>

          {/* ================= PROFILE INFO ================= */}
          <div className="absolute bottom-[76px] left-7 right-7">

            {/* Name */}
            <div className="h-8 w-32 animate-pulse rounded-md bg-zinc-600" />

            {/* Username */}
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-zinc-700" />

            {/* Location */}
            <div className="mt-4 flex items-center gap-2">
              <IoLocationSharp className="text-[15px] text-zinc-600" />

              <div className="h-3 w-20 animate-pulse rounded bg-zinc-700" />
            </div>
          </div>

          {/* ================= VISIT PROFILE ================= */}
          <div
            className="
              absolute
              bottom-7
              left-7
              right-7
              flex
              h-12
              items-center
              justify-center
              rounded-2xl
              bg-zinc-600/80
            "
          >
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-500" />
          </div>
        </section>

        {/* ================= CARD ACTIONS ================= */}
        <div className="mt-1 flex items-center justify-center gap-4">

          {/* Previous */}
          <button
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-zinc-800
              bg-[#161616]
            "
          >
            <IoChevronBack className="text-[23px] text-zinc-700" />
          </button>

          {/* Like */}
          <button
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-white
            "
          >
            <IoHeartOutline className="text-[23px] text-zinc-300" />
          </button>

          {/* Next */}
          <button
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-zinc-800
              bg-[#161616]
            "
          >
            <IoChevronForward className="text-[23px] text-zinc-700" />
          </button>
        </div>

        {/* ================= BOTTOM NAV ================= */}
        <nav
          className="
            fixed
            bottom-0
            left-1/2
            z-50
            h-[70px]
            w-full
            max-w-[600px]
            -translate-x-1/2
            border
            border-zinc-800
            bg-[#0d0d0d]
          "
        >
          <div className="flex h-full items-center justify-around">

            {/* Home */}
            <NavIcon>
              <IoHome />
            </NavIcon>

            {/* Compass */}
            <NavIcon>
              <IoCompassOutline />
            </NavIcon>

            {/* Search */}
            <NavIcon>
              <IoSearch />
            </NavIcon>

            {/* Add */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <IoAdd className="text-[28px] text-black" />
            </div>

            {/* Messages */}
            <NavIcon>
              <IoChatbubbleOutline />
            </NavIcon>

            {/* Heart */}
            <NavIcon>
              <IoHeartOutline />
            </NavIcon>

            {/* Profile */}
            <NavIcon>
              <IoPersonOutline />
            </NavIcon>

          </div>
        </nav>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>
    </main>
  );
}


/* ================= NAV ICON ================= */

function NavIcon({ children }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center text-[22px] text-zinc-700">
      {children}
    </div>
  );
}
