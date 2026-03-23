"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

function buildItemsForApi(rows) {
  return rows
    .filter((r) => r.productId && (Number(r.quantity) || 0) > 0)
    .map((r) => ({
      productId: r.productId,
      quantity: Number(r.quantity) || 0,
      unitPrice: r.unitPrice ? String(Number(r.unitPrice) || 0) : undefined,
    }));
}

const statusBadge = (status) => {
  const c =
    status === "Delivered"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Confirmed" || status === "Shipped"
        ? "bg-blue-100 text-blue-800"
        : status === "Cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export default function AdminSalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, unitPrice: "0" }]);
  const [couponCode, setCouponCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(() => {
    return fetch(getApiUrl("sales-orders"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load sales orders"));
  }, [router]);

  useEffect(() => {
    const h = getAuthHeaders();
    Promise.all([
      loadOrders(),
      fetch(getApiUrl("customers"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("products"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([, c, p]) => {
        setCustomers(Array.isArray(c) ? c : []);
        setProducts(Array.isArray(p) ? p : []);
      })
      .finally(() => setLoading(false));
  }, [loadOrders]);

  useEffect(() => {
    const payload = buildItemsForApi(items);
    if (payload.length === 0) {
      setPreview(null);
      return undefined;
    }
    const t = setTimeout(() => {
      fetch(getApiUrl("pricing/preview"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ items: payload, couponCode: couponCode.trim() || undefined }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(setPreview);
    }, 350);
    return () => clearTimeout(t);
  }, [items, couponCode]);

  function resetForm() {
    setFormErr("");
    setCustomerId("");
    setItems([{ productId: "", quantity: 1, unitPrice: "0" }]);
    setCouponCode("");
    setPreview(null);
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
    const price = product && product.sellingPrice != null ? String(product.sellingPrice) : "0";
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], productId, unitPrice: price };
      return next;
    });
  }

  async function onCreateSalesOrder(e) {
    e.preventDefault();
    setFormErr("");
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    if (!customerId) {
      setFormErr("Select a customer");
      return;
    }
    const validItems = buildItemsForApi(items);
    if (validItems.length === 0) {
      setFormErr("Add at least one product with quantity");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("sales-orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          customerId,
          items: validItems,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) router.replace("/login");
      else if (!res.ok) throw new Error(data.message || "Failed to create");
      else {
        await loadOrders();
        resetForm();
      }
    } catch (e) {
      setFormErr(e.message || "Failed to create sales order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-stone-500">Loading sales orders...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Sales Orders</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: orders list */}
        <div className="flex-1 min-w-0 w-full">
          {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
          <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-stone-700">Customer</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Total</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Status</th>
                  <th className="px-4 py-3 font-medium text-stone-700">Date</th>
                  <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                      No sales orders yet. Create one using the form beside this table.
                    </td>
                  </tr>
                ) : (
                  orders.map((so) => (
                    <tr key={so.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-900">{so.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-stone-700">${Number(so.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{statusBadge(so.status)}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {so.createdAt ? new Date(so.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/sales-orders/${so.id}`}
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

        {/* Right: create sales order */}
        <aside className="w-full lg:w-[min(100%,28rem)] shrink-0 border border-stone-200 rounded-xl bg-white p-5 lg:sticky lg:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Create sales order</h2>
          <form onSubmit={onCreateSalesOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white cursor-pointer"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
                      <th className="px-2 py-2 text-left font-medium text-stone-700 w-20">Base*</th>
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
              {/* <p className="mt-1 text-xs text-stone-500">* Base price before tier / coupon (preview below)</p> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Coupon code (optional)</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="SAVE10"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {preview && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                <p className="font-medium text-stone-800 text-sm">Price preview</p>
                {preview.lines?.map((line, idx) => (
                  <div key={idx} className="text-stone-700 border-b border-stone-200 pb-2 last:border-0">
                    <span className="font-medium">{line.productName}</span> × {line.quantity}
                    <br />
                    <span className="text-stone-500">
                      Base ₹{Number(line.baseUnitPrice).toLocaleString("en-IN")}/unit
                      {line.tierDiscountPercent > 0 && (
                        <>
                          {" "}
                          → tier {line.tierDiscountPercent}% →{" "}
                          <strong>₹{Number(line.unitPriceAfterTier).toLocaleString("en-IN")}</strong>/unit
                        </>
                      )}
                      {line.tierDiscountPercent === 0 && (
                        <>
                          {" "}
                          → <strong>₹{Number(line.unitPriceAfterTier).toLocaleString("en-IN")}</strong>/unit
                        </>
                      )}
                    </span>
                    <br />
                    <span>Line: ₹{Number(line.lineSubtotal).toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <p>
                  Subtotal: <strong>₹{Number(preview.subtotalBeforeCoupon).toLocaleString("en-IN")}</strong>
                </p>
                {Number(preview.couponDiscountAmount) > 0 && (
                  <p className="text-emerald-700">
                    Coupon {preview.appliedCouponCode}: −₹
                    {Number(preview.couponDiscountAmount).toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-base font-semibold text-stone-900">
                  Total: ₹{Number(preview.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create sales order"}
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
