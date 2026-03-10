"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function UserInventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("products"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          setErr("Unable to load inventory. You may not have permission.");
          return [];
        }
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading inventory...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Inventory</h1>
      <p className="text-sm text-stone-500 mb-4">View only. Stock levels across products.</p>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Product</th>
              <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 font-medium text-stone-700">Stock</th>
              <th className="px-4 py-3 font-medium text-stone-700">Reorder at</th>
              <th className="px-4 py-3 font-medium text-stone-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No inventory to display.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const lowStock = p.reorderPoint != null && p.stockLevel <= p.reorderPoint;
                return (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-stone-900">{p.name}</td>
                    <td className="px-4 py-3 text-stone-600">{p.sku}</td>
                    <td className="px-4 py-3">{p.stockLevel}</td>
                    <td className="px-4 py-3">{p.reorderPoint ?? "—"}</td>
                    <td className="px-4 py-3">
                      {lowStock ? (
                        <span className="text-amber-600 font-medium">Low stock</span>
                      ) : (
                        <span className="text-stone-500">In stock</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
