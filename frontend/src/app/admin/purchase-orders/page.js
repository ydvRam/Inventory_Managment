"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
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
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, unitPrice: "0" }]);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(() => {
    return fetch(getApiUrl("purchase-orders"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load purchase orders"));
  }, [router]);

  useEffect(() => {
    const h = getAuthHeaders();
    Promise.all([
      loadOrders(),
      fetch(getApiUrl("suppliers"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("products"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([, s, p]) => {
        setSuppliers(Array.isArray(s) ? s : []);
        setProducts(Array.isArray(p) ? p : []);
      })
      .finally(() => setLoading(false));
  }, [loadOrders]);

  function resetForm() {
    setFormErr("");
    setSupplierId("");
    setItems([{ productId: "", quantity: 1, unitPrice: "0" }]);
  }

  function addLine() {
    setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: "0" }]);
  }

  function removeLine(i) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i, field, value) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function onSelectProduct(i, productId) {
    const product = products.find((p) => p.id === productId);
    const price = product
      ? String(product.costPrice ?? product.sellingPrice ?? "0")
      : "0";
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], productId, unitPrice: price };
      return next;
    });
  }

  const total = items.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
    0
  );

  async function onCreatePurchaseOrder(e) {
    e.preventDefault();
    setFormErr("");
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    if (!supplierId) {
      setFormErr("Select a supplier");
      return;
    }
    const validItems = items
      .map((r) => ({
        productId: r.productId,
        quantity: Number(r.quantity) || 0,
        unitPrice: String(Number(r.unitPrice) || 0),
      }))
      .filter((r) => r.productId && r.quantity > 0);
    if (validItems.length === 0) {
      setFormErr("Add at least one product with quantity");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("purchase-orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ supplierId, items: validItems }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) router.replace("/login");
      else if (!res.ok) throw new Error(data.message || "Failed to create");
      else {
        await loadOrders();
        resetForm();
      }
    } catch (e) {
      setFormErr(e.message || "Failed to create purchase order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-stone-500">Loading purchase orders...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Purchase Orders</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: orders list */}
        <div className="flex-1 min-w-0 w-full">
          {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
          <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
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
                      No purchase orders yet. Create one using the form beside this table.
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

        {/* Right: create purchase order */}
        <aside className="w-full lg:w-[min(100%,28rem)] shrink-0 border border-stone-200 rounded-xl bg-white p-5 lg:sticky lg:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Create purchase order</h2>
          <form onSubmit={onCreatePurchaseOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-stone-700">Line items</label>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <HiOutlinePlus className="w-4 h-4" /> Add line
                </button>
              </div>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-stone-700">Product</th>
                      <th className="px-2 py-2 text-left font-medium text-stone-700 w-16">Qty</th>
                      <th className="px-2 py-2 text-left font-medium text-stone-700 w-20">Price</th>
                      <th className="px-2 py-2 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, i) => (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="px-2 py-2">
                          <select
                            value={row.productId}
                            onChange={(e) => onSelectProduct(i, e.target.value)}
                            className="w-full max-w-[11rem] sm:max-w-none px-2 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                          >
                            <option value="">Select</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) => updateLine(i, "quantity", e.target.value)}
                            className="w-full min-w-0 px-2 py-1.5 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={row.unitPrice}
                            onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                            className="w-full min-w-0 px-2 py-1.5 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                          />
                        </td>
                        <td className="px-1 py-2">
                          <button
                            type="button"
                            onClick={() => removeLine(i)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                            title="Remove line"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                Total: <strong>${total.toFixed(2)}</strong>
              </p>
            </div>

            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create purchase order"}
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
