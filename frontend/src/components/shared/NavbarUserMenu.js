"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiOutlineChevronDown, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { clearAuth } from "@/lib/auth";

function getInitials(u) {
  if (!u) return "?";
  const name = u.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const email = (u.email || "").trim();
  if (email.length >= 2) return email.slice(0, 2).toUpperCase();
  return "?";
}

export default function NavbarUserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function logout() {
    clearAuth();
    window.location.href = "/login";
  }

  const label = user?.name || user?.email || "Account";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex max-w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
          {getInitials(user)}
        </span>
        <span className="hidden min-w-0 max-w-[140px] truncate font-medium text-stone-800 sm:inline md:max-w-[200px]">
          {label}
        </span>
        <HiOutlineChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-[60] mt-1 w-52 rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/user"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
            onClick={() => setOpen(false)}
          >
            <HiOutlineUserCircle className="h-5 w-5 shrink-0 text-stone-500" />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0 text-stone-500" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
