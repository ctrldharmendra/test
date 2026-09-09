"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import toast from "react-hot-toast";
import { setLoggedInUserId } from "@/redux/slices/stateSlice";
import { useDispatch } from "react-redux";




export default function LoginPage() {
  const router = useRouter();
const dispatch = useDispatch();
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
        router.push("/explore");

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
    <main className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Login to your account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"
        >
          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiLogIn />

              {loading ? "Logging in..." : "Login"}
            </button>

          </div>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Signup
          </button>
        </p>
      </div>
    </main>
  );
}