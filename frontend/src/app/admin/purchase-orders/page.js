"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineEye } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c =
    status === "Received"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Cancelled"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

const paymentBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export default function AdminPurchaseOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("purchase-orders"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load purchase orders"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading purchase orders...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Purchase Orders</h1>
        <Link
          href="/admin/purchase-orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Create purchase order
        </Link>
      </div>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Supplier</th>
              <th className="px-4 py-3 font-medium text-stone-700">Total</th>
              <th className="px-4 py-3 font-medium text-stone-700">Status</th>
              <th className="px-4 py-3 font-medium text-stone-700">Payment</th>
              <th className="px-4 py-3 font-medium text-stone-700">Date</th>
              <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  No purchase orders yet. Create one from a supplier.
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{po.supplier?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-700">${Number(po.totalPrice || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">{statusBadge(po.status)}</td>
                  <td className="px-4 py-3">{paymentBadge(po.paymentStatus)}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/purchase-orders/${po.id}`}
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
