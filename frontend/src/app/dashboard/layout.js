"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAdmin } from "@/lib/auth";
import UserNavbar from "@/components/user/UserNavbar";
import UserSidebar from "@/components/user/UserSidebar";
import DashboardBanner from "@/components/shared/DashboardBanner";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    if (isAdmin(user)) router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50">
      <UserNavbar />
      <UserSidebar />
      <main className="pt-14 pl-6 pr-6 pb-6 ml-56 min-h-screen overflow-auto">
        <DashboardBanner />
        {children}
      </main>
    </div>
  );
}
