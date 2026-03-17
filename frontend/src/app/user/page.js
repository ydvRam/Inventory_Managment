"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredUser, clearAuth, isAdmin } from "@/lib/auth";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function logout() {
    clearAuth();
    router.push("/login");
  }

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!user.id) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-zinc-500">Name</dt>
          <dd>{user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Role(s)</dt>
          <dd>
            {user.roles?.length
              ? user.roles.map((r) => (r ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : r)).join(", ")
              : "No role assigned"}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={isAdmin(user) ? "/admin/dashboard" : "/dashboard"}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 inline-block"
        >
          Dashboard
        </Link>
        {isAdmin(user) && (
          <Link href="/admin/products" className="px-4 py-2 border rounded hover:bg-zinc-100 inline-block">
            Products
          </Link>
        )}
        <Link href="/" className="px-4 py-2 border rounded hover:bg-zinc-100 inline-block">
          Home
        </Link>
        <button
          onClick={logout}
          className="px-4 py-2 border rounded hover:bg-zinc-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
