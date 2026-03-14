"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockLevel, setStockLevel] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("categories"), { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!categoryId) {
      setErr("Select a category");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("products"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name,
          description: description || null,
          sku,
          categoryId,
          stockLevel: Number(stockLevel) || 0,
          reorderPoint: Number(reorderPoint) || 0,
          sellingPrice: sellingPrice === "" ? null : Number(sellingPrice),
          costPrice: costPrice === "" ? null : Number(costPrice),
        }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) router.replace("/login");
      else if (!res.ok) throw new Error(data.message || "Failed to create");
      else router.push("/admin/products");
    } catch (e) {
      setErr(e.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full gap-6 items-stretch justify-evenly">
      <div className="w-[40%] shrink-0">
        <h1 className="text-xl font-semibold text-stone-900 mb-6">Add product</h1>
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Selling price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Cost price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock level</label>
              <input
                type="number"
                min={0}
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Reorder point</label>
              <input
                type="number"
                min={0}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create product"}
            </button>
            <Link href="/admin/products" className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      <div className="w-[40%] shrink-0 rounded-lg overflow-hidden flex">
        <img
          src="/img/Product.png"
          alt=""
          className="w-full object-cover min-h-0"
        />
      </div>
    </div>
  );
}
