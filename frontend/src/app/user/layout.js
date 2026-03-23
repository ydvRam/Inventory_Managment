"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAdmin } from "@/lib/auth";
import UserNavbar from "@/components/user/UserNavbar";
import UserSidebar from "@/components/user/UserSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardBanner from "@/components/shared/DashboardBanner";
import StockAlertToast from "@/components/shared/StockAlertToast";

/** Profile route: same shell as dashboard or admin, without role redirects. */
export default function UserProfileLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [useAdminShell, setUseAdminShell] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    setUseAdminShell(isAdmin(user));
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <StockAlertToast />
      {useAdminShell ? (
        <>
          <AdminNavbar onMenuClick={() => setSidebarOpen((p) => !p)} />
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      ) : (
        <>
          <UserNavbar onMenuClick={() => setSidebarOpen((p) => !p)} />
          <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}
      <main className="pt-14 pl-4 pr-4 md:pl-6 md:pr-6 pb-6 md:ml-56 min-h-screen overflow-auto">
        <DashboardBanner />
        {children}
      </main>
    </div>
  );
}
