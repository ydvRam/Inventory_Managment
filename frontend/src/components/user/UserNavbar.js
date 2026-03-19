"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineSquares2X2, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle, HiOutlineBars3 } from "react-icons/hi2";
import { getStoredUser, clearAuth } from "@/lib/auth";
import NotificationBell from "@/components/shared/NotificationBell";

export default function UserNavbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  useEffect(() => setUser(getStoredUser()), []);

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-white border-b border-stone-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
        <Link
          href="/dashboard"
          className="group relative flex items-center gap-2 font-semibold text-stone-800"
        >
          <HiOutlineSquares2X2 className="w-6 h-6 text-teal-600" />
          <span>Inventory</span>
          <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1.5 px-2.5 py-1.5 bg-black text-white text-xs font-medium rounded-lg border border-stone-600 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
            Dashboard
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Link
          href="/user"
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 text-sm text-stone-600"
        >
          <HiOutlineUserCircle className="w-5 h-5" />
          <span>{user?.name || user?.email || "Profile"}</span>
          <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1.5 px-2.5 py-1.5 bg-black text-white text-xs font-medium rounded-lg border border-stone-600 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
            Profile
          </span>
        </Link>
        <button
          onClick={logout}
          className="hidden md:flex group relative items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 text-sm text-stone-600"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          Logout
          <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1.5 px-2.5 py-1.5 bg-black text-white text-xs font-medium rounded-lg border border-stone-600 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}
