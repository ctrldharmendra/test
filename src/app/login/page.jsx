"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import toast from "react-hot-toast";
import { setLoggedInUserId } from "@/redux/slices/stateSlice";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaHeart,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa6";
import GoogleSignInButton from "@/components/GoogleSignInButton/GoogleSignInButton";




export default function LoginPage() {
  const router = useRouter();
const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);


  const [formData, setFormData] = useState({
    email: "a@gmail.com",
    password: "1",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      // console.log(data?.success, "DAADDA")
      // console.log(data?.message, "message")
      // console.log(data?.user, "user")


      if(data?.success == true){

        dispatch(setLoggedInUserId(data?.user?.id))
        toast.success("Login successful");
        router.replace("/explore");

      }

      

      if (!response.ok) {
        toast.error(data.message || "Invalid email or password");
        return;
      }
      // console.log(data?.user?.id, "data?.user?.id")
      // console.log(response)


    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#080808] px-1 py-8 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-rose-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[130px]" />

      {/* Decorative hearts */}
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity }} className="pointer-events-none absolute left-[10%] top-[15%] text-2xl text-rose-500/20">
        <FaHeart />
      </motion.div>

      <motion.div animate={{ y: [0, 15, 0], rotate: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} className="pointer-events-none absolute bottom-[18%] right-[10%] text-3xl text-pink-500/20">
        <FaHeart />
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-5 flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
              <FaHeart className="text-lg text-white" />
            </div>

            <span className="text-2xl font-black tracking-tight">
              Dateish<span className="text-rose-500">.</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-3 max-w-xs text-sm leading-6 text-white/40">
            Login to discover new people and continue your connections.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-3 shadow-2xl backdrop-blur-2xl sm:p-7">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold text-white/65">
                Email address
              </label>

              <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-rose-500/70 focus-within:bg-rose-500/[0.04]">
                <FaEnvelope className="shrink-0 text-sm text-white/30 transition group-focus-within:text-rose-400" />

                <input id="email" name="email" type="email" value={formData.email} onChange={
                  (e)=>{
                    setFormData({...formData, email: e.target.value})
                  }
                } placeholder="Enter your email" autoComplete="email" required className="w-full min-w-0 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/25" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-white/65">
                  Password
                </label>

                <Link href="/forgot-password" className="text-[11px] font-semibold text-rose-400 transition hover:text-rose-300">
                  Forgot password?
                </Link>
              </div>

              <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-rose-500/70 focus-within:bg-rose-500/[0.04]">
                <FaLock className="shrink-0 text-sm text-white/30 transition group-focus-within:text-rose-400" />

                <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e)=>{
                  setFormData({...formData, password: e.target.value})
                }} placeholder="Enter your password" autoComplete="current-password" required className="w-full min-w-0 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/25" />

                <button type="button" onClick={() => setShowPassword((previous) => !previous)} aria-label={showPassword ? "Hide password" : "Show password"} className="shrink-0 text-white/30 transition hover:text-white/80">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

                    <div className="flex w-full items-center gap-2 py-2 text-sm text-slate-600">
            
                 
                                <div className="h-px w-full bg-slate-200"></div>
                                OR
                                <div className="h-px w-full bg-slate-200"></div>
                            </div>
                    <div className="flex w-full items-center gap-2 py-2 text-sm">
                        <GoogleSignInButton />
                      </div> 

            {/* Submit */}
            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_35px_rgba(244,63,94,0.2)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Connect
                  <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center text-xs text-white/35">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-rose-400 transition hover:text-rose-300">
              Create account
            </Link>
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-[10px] text-white/20">
          Connect with people who match your vibe.
        </p>
      </motion.section>
    </main>
  );
}