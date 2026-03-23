"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, clearAuth, isAdmin } from "@/lib/auth";

function getInitials(u) {
  const name = u?.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const email = (u?.email || "").trim();
  if (email.length >= 2) return email.slice(0, 2).toUpperCase();
  return "?";
}

function getRoleLabels(user) {
  const roles = user?.roles ?? [];
  return roles
    .map((r) => {
      const name = typeof r === "string" ? r : r?.name;
      if (!name) return null;
      const s = String(name);
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    })
    .filter(Boolean);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function logout() {
    clearAuth();
    router.push("/login");
  }

  if (user === null) {
    return (
      <div className="py-8">
        <p className="text-stone-500 text-sm">Loading profile…</p>
      </div>
    );
  }

  if (!user.id) {
    return null;
  }

  const admin = isAdmin(user);
  const roleLabels = getRoleLabels(user);
  const dashboardHref = admin ? "/admin/dashboard" : "/dashboard";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Profile</h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Signed-in account and access. Use your dashboard for day-to-day work.
        </p>
      </header>

      <div className="w-full lg:flex lg:gap-8 items-start">
        {/* Left: profile content */}
        <div className="lg:w-[65%] w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-800 ring-2 ring-teal-200/80"
              aria-hidden
            >
              {getInitials(user)}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-medium text-stone-900 truncate">{user.name || "No name set"}</p>
              <p className="text-sm text-stone-500 truncate">{user.email ?? "—"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden divide-y divide-stone-100">
            <section className="px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-3">Account</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-stone-500 mb-0.5">Name</dt>
                  <dd className="text-stone-900 font-medium">{user.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-stone-500 mb-0.5">Email</dt>
                  <dd className="text-stone-900 break-all">{user.email ?? "—"}</dd>
                </div>
              </dl>
            </section>

            <section className="px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-3">Access</h2>
              {roleLabels.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {roleLabels.map((label) => (
                    <li
                      key={label}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-sm font-medium"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-600">No role assigned</p>
              )}
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={dashboardHref}
              className="inline-flex justify-center px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Go to dashboard
            </Link>
            {admin && (
              <Link
                href="/admin/products"
                className="inline-flex justify-center px-4 py-2.5 border border-stone-300 text-stone-800 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
              >
                Products
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex justify-center px-4 py-2.5 border border-stone-300 text-stone-800 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex justify-center px-4 py-2.5 border border-stone-300 text-stone-800 text-sm font-medium rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-800 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Right: illustration (large screens) */}
        <div
          className="hidden lg:flex lg:w-[35%] shrink-0 mt-8 lg:mt-0 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 self-start"
          aria-hidden="true"
        >
          <img
            src="/img/profile.png"
            alt=""
            className="w-full max-h-[min(440px,70vh)] object-contain object-center"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
