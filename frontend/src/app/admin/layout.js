"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAdmin } from "@/lib/auth";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardBanner from "@/components/shared/DashboardBanner";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    if (!isAdmin(user)) router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNavbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-14 pl-4 pr-4 md:pl-6 md:pr-6 pb-6 md:ml-56 min-h-screen overflow-auto">
        <DashboardBanner />
        {children}
      </main>
    </div>
  );
}
