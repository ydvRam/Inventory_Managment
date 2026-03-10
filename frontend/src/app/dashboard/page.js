"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, isAdmin } from "@/lib/auth";

export default function UserDashboardPage() {
  const router = useRouter();
  const user = getStoredUser();

  useEffect(() => {
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    if (isAdmin(user)) router.replace("/admin/dashboard");
  }, [router, user?.id]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Dashboard</h1>
      <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
        <p className="text-stone-600">Welcome, {user?.name || user?.email || "User"}.</p>
        <p className="mt-2 text-sm">Use the sidebar to view products, invoices, inventory, and customers.</p>
      </div>
    </div>
  );
}
