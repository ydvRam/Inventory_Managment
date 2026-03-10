"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function UserCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("customers"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        if (res.status === 404) return [];
        return res.json();
      })
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load customers"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading customers...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Customers</h1>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">Email</th>
              <th className="px-4 py-3 font-medium text-stone-700">Phone</th>
              <th className="px-4 py-3 font-medium text-stone-700">Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                  No customers to display.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{c.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{c.address ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
