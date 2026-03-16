"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineCube } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function UserProductsPage() {
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
    setErr("");
    fetch(getApiUrl("products"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          setErr("Unable to load products. You may not have permission.");
          return [];
        }
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        // Backend returns Product[]; support array or wrapped shape
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data?.data && Array.isArray(data.data)) list = data.data;
        else if (data?.products && Array.isArray(data.products)) list = data.products;
        else if (data?.items && Array.isArray(data.items)) list = data.items;
        setProducts(list);
      })
      .catch(() => setErr("Failed to load products"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading products...</p>;
  }

  const total = products.length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Products</h1>
      <p className="text-sm text-stone-500 mb-4">View only. All products created by admin are listed below.</p>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <div className="mb-6 flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl shadow-sm md:max-w-xs max-w-xl">
        <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
          <HiOutlineCube className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-500">Total products</p>
          <p className="text-2xl font-semibold text-stone-900">{total}</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 font-medium text-stone-700">Category</th>
              <th className="px-4 py-3 font-medium text-stone-700">Stock</th>
              <th className="px-4 py-3 font-medium text-stone-700">Reorder at</th>
            </tr>
          </thead>
          <tbody>
            {total === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No products yet. Products are added by admin.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.sku}</td>
                  <td className="px-4 py-3 text-stone-600">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{p.stockLevel ?? "—"}</td>
                  <td className="px-4 py-3">{p.reorderPoint ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
