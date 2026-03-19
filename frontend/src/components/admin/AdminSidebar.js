"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineUserCircle,
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineDocumentText,
  HiOutlineArchiveBox,
  HiOutlineArrowUturnLeft,
  HiOutlineArrowRightOnRectangle,
  HiOutlineTag,
} from "react-icons/hi2";
import { clearAuth } from "@/lib/auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { href: "/admin/products", label: "Products", icon: HiOutlineCube },
  { href: "/admin/pricing", label: "Pricing", icon: HiOutlineTag },
  { href: "/admin/suppliers", label: "Suppliers", icon: HiOutlineTruck },
  { href: "/admin/purchase-orders", label: "Purchase Orders", icon: HiOutlineShoppingBag },
  { href: "/admin/sales-orders", label: "Sales Orders", icon: HiOutlineShoppingCart },
  { href: "/admin/invoices", label: "Invoices", icon: HiOutlineDocumentText },
  { href: "/admin/returns", label: "Returns", icon: HiOutlineArrowUturnLeft },
  { href: "/admin/inventory", label: "Inventory", icon: HiOutlineArchiveBox },
  { href: "/user", label: "Profile", icon: HiOutlineUserCircle },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay: only on mobile when sidebar open; click to close */}
      {open && (
        <button
          type="button"
          onClick={onClose}
          className="md:hidden fixed inset-0 top-14 z-30 bg-black/30"
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 w-56 max-w-[85vw] bg-white border-r border-stone-200 flex flex-col transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="p-3 space-y-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-100 text-teal-800 border-l-2 border-teal-500 pl-[10px]"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-9 h-8 rounded-md shrink-0 transition-colors ${
                  isActive ? "bg-teal-300 text-teal-800" : "bg-stone-200 text-stone-600 group-hover:bg-stone-300"
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              {label}
            </Link>
          );
        })}
        </nav>
        {/* Logout: mobile only (navbar shows logout on desktop) */}
        <div className="mt-auto p-3 border-t border-stone-200 md:hidden">
          <button
            type="button"
            onClick={() => {
              clearAuth();
              window.location.href = "/login";
            }}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 w-full transition-colors"
          >
            <span className="inline-flex items-center justify-center w-9 h-8 rounded-md shrink-0 bg-stone-200 text-stone-600 group-hover:bg-stone-300 transition-colors">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
