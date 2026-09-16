

"use client"
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaArrowRight,
  FaComments,
  FaUserGroup,
  FaBolt,
  FaStar,
  FaCheck,
} from "react-icons/fa6";
import { useSelector } from "react-redux";

export default function Home() {
const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);


// console.log(loggedInUserId)
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#080808] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-rose-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-[35%] h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[600px] flex-col px-5 sm:max-w-3xl lg:max-w-6xl lg:px-10">

        {/* Header */}
        <header className="flex items-center justify-between py-5 sm:py-7">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
              <FaHeart className="text-base text-white" />
            </div>

            <span className="text-xl font-extrabold tracking-tight">
              Dateish<span className="text-rose-500">.</span>
            </span>
          </Link>
    { !loggedInUserId && (
      
          <Link href="/login" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/10 active:scale-95">
            Login
          </Link>
    )}
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center pb-8 pt-8 text-center sm:pt-12 lg:grid lg:grid-cols-2 lg:gap-14 lg:text-left">

          {/* Hero copy */}
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 flex flex-col items-center lg:items-start">

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/[0.08] px-3.5 py-2 text-[11px] font-medium text-rose-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              Real people. Real connections.
            </motion.div>

            <h1 className="max-w-xl text-[clamp(2.5rem,10vw,4.8rem)] font-black leading-[1.05] tracking-[-0.055em]">
              Your people.
              <br />
              Your{" "}
              <span className="bg-gradient-to-r from-pink-400 via-rose-500 to-orange-400 bg-clip-text text-transparent">
                kind of vibe.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/45 sm:text-base sm:leading-8">
              Discover amazing people around you, share your moments, and build connections that feel real.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
              <Link href={loggedInUserId ? "/explore" : "/signup"} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_35px_rgba(244,63,94,0.2)] transition hover:brightness-110 active:scale-[0.97]">
                {loggedInUserId ? "Go to Home page" : "Create Account"}
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </Link>

      { !loggedInUserId && (
        <Link href="/login" className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] active:scale-[0.97]">
          Login
        </Link>
      )}

            </div>

            {/* Small trust row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-white/30 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <FaCheck className="text-rose-400" />
                Free to join
              </span>
              <span className="flex items-center gap-1.5">
                <FaCheck className="text-rose-400" />
                Discover nearby
              </span>
              <span className="flex items-center gap-1.5">
                <FaCheck className="text-rose-400" />
                Made for connections
              </span>
            </div>
          </motion.div>

          {/* Animated social preview */}
          <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="relative mt-14 flex w-full items-center justify-center lg:mt-0">

            {/* Decorative rings */}
            <div className="absolute h-[270px] w-[270px] rounded-full border border-white/[0.045] sm:h-[360px] sm:w-[360px]" />
            <div className="absolute h-[220px] w-[220px] rounded-full border border-rose-500/[0.08] sm:h-[300px] sm:w-[300px]" />

            {/* Floating profile card */}
            <motion.div animate={{ y: [0, -12, 0], rotate: [-7, -5, -7] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute left-0 top-5 z-20 w-[132px] rounded-2xl border border-white/10 bg-[#171313]/90 p-3 text-left shadow-2xl backdrop-blur-xl sm:left-3 sm:w-40">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-rose-500 text-xl shadow-lg sm:h-14 sm:w-14">
                👩🏻
              </div>
              <p className="truncate text-xs font-bold text-white sm:text-sm">Sophia, 24</p>
              <p className="mt-1 text-[10px] text-white/40">2.4 km away</p>
              <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </motion.div>

            {/* Main app card */}
            <motion.div animate={{ y: [0, 8, 0], rotate: [3, 1, 3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 w-[220px] overflow-hidden rounded-[32px] border border-white/15 bg-[#151111] p-2 shadow-[0_25px_80px_rgba(244,63,94,0.15)] sm:w-[270px] sm:rounded-[38px] sm:p-2.5">

              <div className="relative aspect-[0.73] overflow-hidden rounded-[25px] bg-gradient-to-br from-rose-300 via-pink-500 to-red-950 sm:rounded-[30px]">

                {/* Abstract profile visual */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_25%),linear-gradient(145deg,#fda4af,#be123c_55%,#450a0a)]" />

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <FaHeart className="text-white" />
                    Connect
                  </div>

                  <span className="rounded-full bg-black/20 px-2 py-1 text-[9px] text-white/80 backdrop-blur-md">
                    Discover
                  </span>
                </div>

                {/* Profile avatar */}
                <div className="absolute left-1/2 top-[36%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/20 bg-gradient-to-br from-amber-100 via-rose-300 to-rose-700 text-7xl shadow-2xl sm:h-36 sm:w-36">
                  👩🏻‍🦰
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-left sm:bottom-5 sm:left-5 sm:right-5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-extrabold sm:text-xl">Mia, 22</h3>
                    <FaCheck className="rounded-full bg-blue-500 p-1 text-[15px]" />
                  </div>

                  <p className="mt-1 flex items-center gap-1 text-[10px] text-white/70">
                    <span>📍</span>
                    1.8 km away
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-md">
                      <FaBolt className="text-xs" />
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-xl">
                      <FaHeart className="text-lg" />
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-md">
                      <FaComments className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating message card */}
            <motion.div animate={{ y: [0, 10, 0], rotate: [8, 10, 8] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="absolute -right-1 bottom-5 z-20 w-[135px] rounded-2xl border border-white/10 bg-[#171313]/95 p-3 text-left shadow-2xl backdrop-blur-xl sm:-right-2 sm:w-44">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-purple-600 text-sm">
                  👨🏻
                </div>
                <div>
                  <p className="text-[10px] font-bold sm:text-xs">Alex</p>
                  <p className="text-[9px] text-emerald-400">New connection</p>
                </div>
              </div>
              <p className="text-[10px] leading-4 text-white/50">
                Hey! Nice to meet you 👋
              </p>
              <div className="mt-2 flex items-center gap-1 text-[9px] text-rose-400">
                <FaHeart />
                <span>Good vibes only</span>
              </div>
            </motion.div>

            {/* Decorative heart */}
            <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-8 right-10 text-3xl text-rose-500/70 sm:right-20">
              <FaHeart />
            </motion.div>

            {/* Floating star */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-0 left-10 text-xl text-amber-300/70">
              <FaStar />
            </motion.div>
          </motion.div>
        </section>

        {/* Minimal bottom hint */}
        <footer className="pb-5 text-center text-[10px] text-white/20 sm:pb-7">
          Connect with people who match your vibe.
        </footer>
      </div>
    </main>

  );
}
