"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineSquares2X2,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineArchiveBox,
  HiOutlineUsers,
  HiOutlineUserCircle,
} from "react-icons/hi2";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { href: "/dashboard/products", label: "Products", icon: HiOutlineCube },
  { href: "/dashboard/invoices", label: "Invoices", icon: HiOutlineDocumentText },
  { href: "/dashboard/inventory", label: "Inventory", icon: HiOutlineArchiveBox },
  { href: "/dashboard/customers", label: "Customers", icon: HiOutlineUsers },
  { href: "/user", label: "Profile", icon: HiOutlineUserCircle },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-14 left-0 bottom-0 z-40 w-56 bg-white border-r border-stone-200 flex flex-col">
      <nav className="p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
