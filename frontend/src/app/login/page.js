"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { getApiUrl, setAuth, isAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setAuth(data.access_token, data.user);
      router.push(isAdmin(data.user) ? "/admin/dashboard" : "/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,115,119,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(26, 91, 94, 0.06),transparent)]">
      <div className="flex w-full max-w-4xl gap-8 items-stretch bg-white rounded-2xl justify-center flex-wrap sm:flex-nowrap p-6">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shrink-0">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-teal-100 text-teal-600">
            <HiOutlineArrowRightOnRectangle className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mb-1 text-center">Welcome back</h1>
        <p className="text-sm text-stone-500 mb-6 text-center">Sign in to your account</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full pl-10 pr-3.5 py-2.5 text-[15px] border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:border-transparent"
            />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-3.5 py-2.5 text-[15px] border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:border-transparent"
            />
            </div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            className="w-full py-3 px-4 text-[15px] font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:scale-[0.99] transition-colors flex items-center justify-center gap-2"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Sign in
          </button>
        </form>
        <p className="mt-6 pt-5 border-t border-stone-200 text-sm text-stone-500 text-center">
          No account? <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-700 hover:underline">Sign up</Link>
        </p>
      </div>
      <div className="hidden sm:flex w-[40%] min-w-[400px] rounded-2xl overflow-hidden items-center justify-center p-4">
        <img src="/img/Sign%20in-pana.png" alt="Sign in" className="w-full h-full object-contain" />
      </div>
      </div>
    </div>
  );
}
