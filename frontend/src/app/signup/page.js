"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineUserPlus } from "react-icons/hi2";
import { getApiUrl } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(getApiUrl("/roles"))
      .then((res) => res.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!roleId) {
      setErr("Please select a role");
      return;
    }
    try {
      const res = await fetch(getApiUrl("/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, roleIds: [roleId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      router.push("/login");
    } catch (e) {
      setErr(e.message || "Signup failed");
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 text-[15px] border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5";

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 bg-stone-100 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,115,119,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(13,115,119,0.06),transparent)]">
      <div className="flex w-full max-w-5xl gap-4 px-0 rounded-md bg-white items-stretch justify-center flex-wrap sm:flex-nowrap">
        <div className="w-full max-w-md p-7 shrink-0">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600">
              <HiOutlineUserPlus className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 mb-1 text-center">Create account</h1>
          <p className="text-sm text-stone-500 mb-6 text-center">Join and pick your role</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelClass}>Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className={inputClass + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
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
                  className={inputClass + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>Role</label>
              <div className="relative">
                <HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                <select
                  id="role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className={inputClass + " cursor-pointer pl-10"}
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 text-[15px] font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 active:scale-[0.99] transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineUserPlus className="w-5 h-5" />
              Create account
            </button>
          </form>
          <p className="mt-6 pt-5 border-t border-stone-200 text-sm text-stone-500 text-center">
            Have an account? <Link href="/login" className="font-medium text-teal-600 hover:text-teal-700 hover:underline">Sign in</Link>
          </p>
        </div>
        <div className="hidden sm:flex w-[50%] min-w-[400px] rounded-2xl overflow-hidden items-center justify-center p-4">
          <img src="/img/Sign%20up-pana.png" alt="Sign up" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
