"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c =
    status === "Delivered"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Confirmed" || status === "Shipped"
        ? "bg-blue-100 text-blue-800"
        : status === "Cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

export default function UserSalesOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [so, setSo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl(`sales-orders/${id}`), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then(setSo)
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleFulfill() {
    if (!confirm("Fulfill this order? Stock will be deducted from inventory.")) return;
    setFulfilling(true);
    fetch(getApiUrl(`sales-orders/${id}/fulfill`), { method: "POST", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) return fetch(getApiUrl(`sales-orders/${id}`), { headers: getAuthHeaders() }).then((r) => r.json());
        else return res.json().then((d) => { throw new Error(d.message || "Failed to fulfill"); });
      })
      .then(setSo)
      .catch((e) => setErr(e.message || "Failed to fulfill"))
      .finally(() => setFulfilling(false));
  }

  function handleGenerateInvoice() {
    setGeneratingInvoice(true);
    fetch(getApiUrl("invoices/generate"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ salesOrderId: id }),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed to generate"); });
        router.push("/dashboard/invoices");
      })
      .catch((e) => {
        setErr(e.message || "Failed to generate invoice");
      })
      .finally(() => setGeneratingInvoice(false));
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!so) return <p className="text-stone-500">{err || "Sales order not found."}</p>;

  const canFulfill = so.status === "Pending";
  const isFulfilled = so.status !== "Pending" && so.status !== "Cancelled";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sales-orders" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Sales orders
          </Link>
          <h1 className="text-xl font-semibold text-stone-900">Sales order</h1>
        </div>
        {statusBadge(so.status)}
      </div>

      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-stone-500">Customer</span>
            <p className="font-medium text-stone-900">{so.customer?.name ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Total</span>
            <p className="font-medium text-stone-900">${Number(so.totalAmount || 0).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Date</span>
            <p className="font-medium text-stone-900">
              {so.createdAt ? new Date(so.createdAt).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-700">Product</th>
              <th className="px-4 py-3 text-left font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Unit price</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Line total</th>
            </tr>
          </thead>
          <tbody>
            {(so.items || []).map((item) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
              return (
                <tr key={item.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 text-stone-900">{item.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{item.product?.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">${Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">${lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        {canFulfill && (
          <button
            type="button"
            onClick={handleFulfill}
            disabled={fulfilling}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {fulfilling ? "Fulfilling..." : "Sell items (fulfill order)"}
          </button>
        )}
        {isFulfilled && (
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generatingInvoice ? "Generating..." : "Generate invoice"}
          </button>
        )}
      </div>
      {canFulfill && (
        <p className="mt-2 text-sm text-stone-500">
          Fulfilling will deduct stock from inventory and set the order to Confirmed.
        </p>
      )}
    </div>
  );
}
