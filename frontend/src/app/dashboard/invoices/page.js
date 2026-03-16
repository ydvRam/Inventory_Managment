"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineEye } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

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
      <p className="text-sm text-stone-500 mb-4">Generate invoices from fulfilled sales orders (on the sales order detail page).</p>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Invoice #</th>
              <th className="px-4 py-3 font-medium text-stone-700">Date</th>
              <th className="px-4 py-3 font-medium text-stone-700">Customer</th>
              <th className="px-4 py-3 font-medium text-stone-700">Amount</th>
              <th className="px-4 py-3 font-medium text-stone-700">Status</th>
              <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  No invoices yet. Fulfill a sales order and generate an invoice from its detail page.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{inv.invoiceNumber ?? inv.id}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{inv.customer?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">${Number(inv.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
