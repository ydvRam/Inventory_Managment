"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function UserInventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("inventory"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading inventory...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Inventory</h1>
      <p className="text-sm text-stone-500 mb-4">Stock levels by product. Updated when purchase orders are received and when sales orders are fulfilled.</p>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Product</th>
              <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 font-medium text-stone-700">Quantity</th>
              <th className="px-4 py-3 font-medium text-stone-700">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                  No inventory records yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{row.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{row.product?.sku ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{row.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : "—"}
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
