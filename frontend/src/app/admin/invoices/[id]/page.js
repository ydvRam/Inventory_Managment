"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

export default function AdminInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl(`invoices/${id}`), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then(setInv)
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!inv) return <p className="text-stone-500">{err || "Invoice not found."}</p>;

  const items = inv.salesOrder?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Invoices
          </Link>
          <h1 className="text-xl font-semibold text-stone-900">Invoice {inv.invoiceNumber ?? inv.id}</h1>
        </div>
        {statusBadge(inv.status)}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap gap-4">
          <div>
            <span className="text-sm text-stone-500">Customer</span>
            <p className="font-medium text-stone-900">{inv.customer?.name ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Amount</span>
            <p className="font-medium text-stone-900">${Number(inv.amount || 0).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Date</span>
            <p className="font-medium text-stone-900">
              {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Product</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700">Unit price</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700">Line total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <tr key={item.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 text-stone-900">{item.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">${Number(item.unitPrice || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium">${lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
