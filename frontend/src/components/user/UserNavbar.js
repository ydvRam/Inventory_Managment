"use client";

import Link from "next/link";
import { HiOutlineSquares2X2, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle, HiOutlineBell } from "react-icons/hi2";
import { getStoredUser, clearAuth } from "@/lib/auth";

export default function UserNavbar() {
  const user = getStoredUser();

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-white border-b border-stone-200">
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="group relative p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1.5 px-2.5 py-1.5 bg-black text-white text-xs font-medium rounded-lg border border-stone-600 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
            Notifications
          </span>
        </button>
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
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 text-sm text-stone-600"
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
