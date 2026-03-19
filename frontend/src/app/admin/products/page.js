"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    // const user = getStoredUser();
    // if (!user?.id) {
    //   router.replace("/login");
    //   return;
    // }
    fetch(getApiUrl("products"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load products"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    fetch(getApiUrl(`products/${id}`), { method: "DELETE", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
      });
  }

  if (loading) {
    return <p className="text-stone-500">Loading products...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add product
        </Link>
      </div>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 font-medium text-stone-700">Category</th>
              <th className="px-4 py-3 font-medium text-stone-700">Stock</th>
              <th className="px-4 py-3 font-medium text-stone-700">Reorder at</th>
              <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  No products yet. Add one to get started.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{p.name}</td>
                  <td className="px-4 py-3 text-stone-600">{p.sku}</td>
                  <td className="px-4 py-3 text-stone-600">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.stockLevel === 0 ? (
                      <span className="font-medium text-red-600">Out of Stock</span>
                    ) : (p.minStockLevel ?? p.reorderPoint ?? 0) > 0 && p.stockLevel <= (p.minStockLevel ?? p.reorderPoint) ? (
                      <span className="font-medium text-amber-600">Only {p.stockLevel} left!</span>
                    ) : (
                      p.stockLevel
                    )}
                  </td>
                  <td className="px-4 py-3">{p.reorderPoint}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-stone-500 hover:text-teal-600 rounded"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-stone-500 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
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
