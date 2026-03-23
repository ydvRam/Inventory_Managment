"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders } from "@/lib/auth";

export default function UserInventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
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
      <h1 className="text-xl font-semibold text-stone-900">Inventory</h1>
      <p className="text-sm text-stone-600 mt-1 max-w-2xl">
        Read-only view of <strong>stock levels</strong> and <strong>expiry</strong> per product. Counts change when purchase
        orders are received and when sales orders are fulfilled.
      </p>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}

      <div className="w-full lg:flex gap-5 items-start mt-6">
        <div className="lg:w-[65%] w-full min-h-[200px] bg-white border border-stone-200 rounded-xl overflow-hidden">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-stone-800 font-medium">No inventory records yet</p>
              <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
                Your admin manages incoming stock. Once items are on hand, they will show here.
              </p>
              <Link
                href="/dashboard/sales-orders"
                className="inline-flex mt-5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                Go to sales orders
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[400px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-stone-700">Product</th>
                    <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Quantity</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-900">{row.product?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-stone-600">{row.product?.sku ?? "—"}</td>
                      <td className="px-4 py-3 font-medium text-stone-900 tabular-nums">
                        {Number(row.quantity ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        {row.expiryDate ? (() => {
                          const d = new Date(row.expiryDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          d.setHours(0, 0, 0, 0);
                          const expired = d < today;
                          const in7 = (() => {
                            const cut = new Date(today);
                            cut.setDate(cut.getDate() + 7);
                            return d >= today && d <= cut;
                          })();
                          const label = d.toLocaleDateString();
                          return (
                            <span
                              className={
                                expired
                                  ? "text-red-600 font-medium"
                                  : in7
                                    ? "text-amber-600 font-medium"
                                    : "text-stone-600"
                              }
                            >
                              {label}
                              {expired ? " (Expired)" : in7 ? " (Expiring soon)" : ""}
                            </span>
                          );
                        })() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="hidden lg:flex lg:w-[35%] shrink-0 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 self-start"
          aria-hidden="true"
        >
          <img
            src="/img/inventory.png"
            alt=""
            className="w-full max-h-[min(420px,65vh)] object-contain object-center"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
