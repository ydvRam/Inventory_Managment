"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [categoriesErr, setCategoriesErr] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stockLevel, setStockLevel] = useState(0);
  const [reorderPoint, setReorderPoint] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);


  const loadProducts = useCallback(() => {
    return fetch(getApiUrl("products"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load products"));
  }, [router]);

  const loadCategories = useCallback(() => {
    return fetch(getApiUrl("categories"), { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .catch(() => ({}))
            .then((body) => Promise.reject(new Error(body.message || "Failed to load categories")));
        }
        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setCategoriesErr("");
      })
      .catch((e) => setCategoriesErr(e.message || "Failed to load categories"));
  }, []);

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()]).finally(() => setLoading(false));
  }, [loadProducts, loadCategories]);

  function resetForm() {
    setFormErr("");
    setName("");
    setDescription("");
    setSku("");
    setCategoryId("");
    setStockLevel(0);
    setReorderPoint(0);
    setMinStockLevel("");
    setSellingPrice("");
    setCostPrice("");
  }

  function handleDelete(id) {
    if (!id) return;
    // if (!confirm(`Delete "${productName}"?`)) return;
    fetch(getApiUrl(`products/${id}`), { method: "DELETE", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
      });
  }

  async function onCreateProduct(e) {
    e.preventDefault();
    setFormErr("");
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    if (!categoryId) {
      setFormErr("Select a category");
      return;
    }
    setSaving(true);
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
          minStockLevel: minStockLevel === "" ? null : Number(minStockLevel),
          sellingPrice: sellingPrice === "" ? null : Number(sellingPrice),
          costPrice: costPrice === "" ? null : Number(costPrice),
        }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) router.replace("/login");
      else if (!res.ok) throw new Error(data.message || "Failed to create");
      else {
        await loadProducts();
        resetForm();
      }
    } catch (e) {
      setFormErr(e.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-stone-500">Loading products...</p>;
  }
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowConfirm(false);
      setIsClosing(false);
    }, 200);
  };
  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Products</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: product list */}
        <div className="flex-1 min-w-0 w-full">
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
                      No products yet. Add one using the form beside this table.
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
                        ) : (p.minStockLevel ?? p.reorderPoint ?? 0) > 0 &&
                          p.stockLevel <= (p.minStockLevel ?? p.reorderPoint) ? (
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
                            onClick={() => {
                              setSelectedId(p.id);
                              setShowConfirm(true);
                            }}
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

        {showConfirm && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"
            } bg-black/40`}>
            <div className={`bg-white rounded-xl p-6 w-full max-w-md shadow-lg transform transition-all duration-300 ease-out ${isClosing
              ? "scale-95 opacity-0 translate-y-2"
              : "scale-100 opacity-100 translate-y-0"
              }`}>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">
                Delete Product
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedId);
                    setShowConfirm(false);
                    setSelectedId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-teal-600  text-white hover:bg-red-400"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        )}
        {/* Right: add product */}
        <aside className="w-full lg:w-[min(100%,28rem)] shrink-0 border border-stone-200 rounded-xl bg-white p-5 lg:sticky lg:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Add product</h2>
          {categoriesErr && <p className="text-sm text-amber-700 mb-3">{categoriesErr}</p>}
          <form onSubmit={onCreateProduct} className="space-y-3">
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
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Min stock (alert)</label>
              <input
                type="number"
                min={0}
                placeholder="Optional"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
              >
                Clear
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
