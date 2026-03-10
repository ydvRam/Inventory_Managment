"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function UserInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("invoices"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        if (res.status === 404) return [];
        return res.json();
      })
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading invoices...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Invoices</h1>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Invoice #</th>
              <th className="px-4 py-3 font-medium text-stone-700">Date</th>
              <th className="px-4 py-3 font-medium text-stone-700">Customer</th>
              <th className="px-4 py-3 font-medium text-stone-700">Amount</th>
              <th className="px-4 py-3 font-medium text-stone-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No invoices to display.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{inv.number ?? inv.id}</td>
                  <td className="px-4 py-3 text-stone-600">{inv.date ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{inv.customerName ?? "—"}</td>
                  <td className="px-4 py-3">{inv.amount ?? "—"}</td>
                  <td className="px-4 py-3">{inv.status ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
