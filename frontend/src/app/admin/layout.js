"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAdmin } from "@/lib/auth";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardBanner from "@/components/shared/DashboardBanner";

export default function AdminLayout({ children }) {
  const router = useRouter();

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
      <AdminNavbar />
      <AdminSidebar />
      <main className="pt-14 pl-6 pr-6 pb-6 ml-56 min-h-screen overflow-auto">
        <DashboardBanner />
        {children}
      </main>
    </div>
  );
}
