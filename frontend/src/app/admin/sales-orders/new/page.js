"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
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

export default function AdminNewSalesOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, unitPrice: "0" }]);
  const [couponCode, setCouponCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    const h = getAuthHeaders();
    Promise.all([
      fetch(getApiUrl("customers"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("products"), { headers: h }).then((r) => (r.ok ? r.json() : [])),
    ]).then(([c, p]) => {
      setCustomers(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);
    });
  }, [router]);

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

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!customerId) {
      setErr("Select a customer");
      return;
    }
    const validItems = buildItemsForApi(items);
    if (validItems.length === 0) {
      setErr("Add at least one product with quantity");
      return;
    }
    setLoading(true);
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
      else router.push("/admin/sales-orders");
    } catch (e) {
      setErr(e.message || "Failed to create sales order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Create sales order</h1>
      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
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
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-stone-700">Products</label>
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
                  <th className="px-3 py-2 text-left font-medium text-stone-700">Product</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-700 w-24">Qty</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-700 w-28">Base price*</th>
                  <th className="px-3 py-2 w-12" />
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="px-3 py-2">
                      <select
                        value={row.productId}
                        onChange={(e) => onSelectProduct(i, e.target.value)}
                        className="w-full px-2.5 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateLine(i, "quantity", e.target.value)}
                        className="w-full px-2.5 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.unitPrice}
                        onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                        className="w-full px-2.5 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Coupon code (optional)</label>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="SAVE10"
            className="w-full max-w-xs px-3.5 py-2.5 border border-stone-300 rounded-lg uppercase"
          />
        </div>

        {preview && (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm space-y-2">
            <p className="font-medium text-stone-800">Price preview</p>
            {preview.lines?.map((line, idx) => (
              <div key={idx} className="text-stone-700 border-b border-stone-200 pb-2 last:border-0">
                <span className="font-medium">{line.productName}</span> × {line.quantity}
                <br />
                <span className="text-xs text-stone-500">
                  Base ₹{Number(line.baseUnitPrice).toLocaleString("en-IN")}/unit
                  {line.tierDiscountPercent > 0 && (
                    <> → tier {line.tierDiscountPercent}% → <strong>₹{Number(line.unitPriceAfterTier).toLocaleString("en-IN")}</strong>/unit</>
                  )}
                  {line.tierDiscountPercent === 0 && <> → <strong>₹{Number(line.unitPriceAfterTier).toLocaleString("en-IN")}</strong>/unit</>}
                </span>
                <br />
                <span>Line: ₹{Number(line.lineSubtotal).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <p>Subtotal: <strong>₹{Number(preview.subtotalBeforeCoupon).toLocaleString("en-IN")}</strong></p>
            {Number(preview.couponDiscountAmount) > 0 && (
              <p className="text-emerald-700">
                Coupon {preview.appliedCouponCode}: −₹{Number(preview.couponDiscountAmount).toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-lg font-semibold text-stone-900">
              Total: ₹{Number(preview.totalAmount).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create sales order"}
          </button>
          <Link href="/admin/sales-orders" className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
