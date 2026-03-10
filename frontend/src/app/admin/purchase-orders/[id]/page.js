"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c =
    status === "Received"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Cancelled"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

const paymentBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700";
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

export default function AdminPurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [receiving, setReceiving] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl(`purchase-orders/${id}`), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        setPo(data);
        if (data?.paymentStatus) setPaymentStatus(data.paymentStatus);
      })
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handleReceive() {
    if (!confirm("Receive this order? Stock will be added to inventory for each product.")) return;
    setReceiving(true);
    fetch(getApiUrl(`purchase-orders/${id}/receive`), {
      method: "POST",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) return fetch(getApiUrl(`purchase-orders/${id}`), { headers: getAuthHeaders() }).then((r) => r.json());
        else return res.json().then((d) => { throw new Error(d.message || "Failed to receive"); });
      })
      .then((data) => {
        setPo(data);
      })
      .catch((e) => setErr(e.message || "Failed to receive order"))
      .finally(() => setReceiving(false));
  }

  function handlePaymentStatusChange() {
    if (!paymentStatus) return;
    fetch(getApiUrl(`purchase-orders/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ paymentStatus }),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) setPo((prev) => (prev ? { ...prev, paymentStatus } : null));
      });
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!po) return <p className="text-stone-500">{err || "Purchase order not found."}</p>;

  const canReceive = po.status === "Pending";
  const isReceived = po.status === "Received";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/purchase-orders" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Purchase orders
          </Link>
          <h1 className="text-xl font-semibold text-stone-900">Purchase order</h1>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(po.status)}
          {paymentBadge(po.paymentStatus)}
        </div>
      </div>

      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-stone-500">Supplier</span>
            <p className="font-medium text-stone-900">{po.supplier?.name ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Total</span>
            <p className="font-medium text-stone-900">${Number(po.totalPrice || 0).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Date</span>
            <p className="font-medium text-stone-900">
              {po.createdAt ? new Date(po.createdAt).toLocaleString() : "—"}
            </p>
          </div>
          {isReceived && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-stone-500">Payment</span>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                onBlur={handlePaymentStatusChange}
                className="px-2.5 py-1.5 border border-stone-300 rounded text-sm bg-white"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          )}
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
            {(po.items || []).map((item) => {
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

      {canReceive && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReceive}
            disabled={receiving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {receiving ? "Receiving..." : "Receive order"}
          </button>
          <p className="text-sm text-stone-500 self-center">
            This will add the ordered quantities to inventory and mark the order as Received.
          </p>
        </div>
      )}
      {isReceived && (
        <p className="text-sm text-emerald-600">This order has been received. Stock was added to inventory.</p>
      )}
    </div>
  );
}
