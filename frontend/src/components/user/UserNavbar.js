"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineSquares2X2, HiOutlineBars3 } from "react-icons/hi2";
import { getStoredUser } from "@/lib/auth";
import NotificationBell from "@/components/shared/NotificationBell";
import NavbarUserMenu from "@/components/shared/NavbarUserMenu";

const brandIconBox =
  "inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700";

export default function UserNavbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  useEffect(() => setUser(getStoredUser()), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-stretch border-stone-200 bg-white/95  backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2 border-stone-200 pl-3 pr-2 sm:gap-3 md:w-56 md:shrink-0 md:border-r md:px-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-0.5 rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 md:hidden"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="h-6 w-6" />
        </button>
        <Link
          href="/dashboard"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 font-semibold text-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 md:gap-3"
        >
          <span className={brandIconBox}>
            <HiOutlineSquares2X2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="truncate text-sm sm:text-base">Inventory</span>
        </Link>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 px-4 md:px-6">
        <NotificationBell />
        <NavbarUserMenu user={user} />
      </div>
    </header>
  );
}
