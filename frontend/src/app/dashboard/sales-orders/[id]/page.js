"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

/** Simple rupee display for fresher-friendly UI */
function rupee(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
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
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

export default function UserSalesOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [so, setSo] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [showFulfillConfirm, setShowFulfillConfirm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnProductId, setReturnProductId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl(`sales-orders/${id}`), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then(setSo)
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    fetch(getApiUrl(`returns?salesOrderId=${id}`), { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch(() => setReturns([]));
  }, [id]);

  function handleFulfill() {
    setFulfilling(true);
    fetch(getApiUrl(`sales-orders/${id}/fulfill`), { method: "POST", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) return fetch(getApiUrl(`sales-orders/${id}`), { headers: getAuthHeaders() }).then((r) => r.json());
        else return res.json().then((d) => { throw new Error(d.message || "Failed to fulfill"); });
      })
      .then(setSo)
      .catch((e) => setErr(e.message || "Failed to fulfill"))
      .finally(() => setFulfilling(false));
  }

  function openFulfillDialog() {
    setShowFulfillConfirm(true);
  }

  function closeFulfillDialog() {
    if (fulfilling) return;
    setShowFulfillConfirm(false);
  }

  function handleCreateReturn(e) {
    e.preventDefault();
    if (!returnProductId || returnQty < 1) {
      setErr("Select product and quantity");
      return;
    }
    setSubmittingReturn(true);
    setErr("");
    fetch(getApiUrl("returns"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        salesOrderId: id,
        productId: returnProductId,
        quantity: returnQty,
        reason: returnReason.trim() || undefined,
      }),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed"); });
        return res.json();
      })
      .then(() => {
        setShowReturnForm(false);
        setReturnProductId("");
        setReturnQty(1);
        setReturnReason("");
        return fetch(getApiUrl(`returns?salesOrderId=${id}`), { headers: getAuthHeaders() }).then((r) => (r.ok ? r.json() : []));
      })
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message || "Failed to create return"))
      .finally(() => setSubmittingReturn(false));
  }

  function handleGenerateInvoice() {
    setGeneratingInvoice(true);
    fetch(getApiUrl("invoices/generate"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ salesOrderId: id }),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed to generate"); });
        router.push("/dashboard/invoices");
      })
      .catch((e) => {
        setErr(e.message || "Failed to generate invoice");
      })
      .finally(() => setGeneratingInvoice(false));
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!so) return <p className="text-stone-500">{err || "Sales order not found."}</p>;

  const canFulfill = so.status === "Pending";
  const isFulfilled = so.status !== "Pending" && so.status !== "Cancelled";
  const canReturn = isFulfilled;
  const selectedItem = (so.items || []).find((i) => i.productId === returnProductId);
  const maxReturnQty = selectedItem ? selectedItem.quantity : 0;

  const linesSubtotal =
    so.subtotalBeforeCoupon != null && so.subtotalBeforeCoupon !== ""
      ? Number(so.subtotalBeforeCoupon)
      : (so.items || []).reduce(
          (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
          0,
        );
  const couponDiscount = Number(so.couponDiscountAmount || 0);

  const returnStatusBadge = (status) => {
    const c =
      status === "APPROVED"
        ? "bg-emerald-100 text-emerald-800"
        : status === "REJECTED"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sales-orders" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Sales orders
          </Link>
          <h1 className="text-xl font-semibold text-stone-900">Sales order</h1>
        </div>
        {statusBadge(so.status)}
      </div>

      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-stone-500">Customer</span>
            <p className="font-medium text-stone-900">{so.customer?.name ?? "—"}</p>
          </div>
          <div>
            <span className="text-sm text-stone-500">Total</span>
            <p className="font-medium text-stone-900">{rupee(so.totalAmount)}</p>
          </div>
          {couponDiscount > 0 && (
            <div>
              <span className="text-sm text-stone-500">Coupon</span>
              <p className="font-medium text-emerald-700">
                {so.couponCode || "—"} (−{rupee(couponDiscount)})
              </p>
            </div>
          )}
          <div>
            <span className="text-sm text-stone-500">Date</span>
            <p className="font-medium text-stone-900">
              {so.createdAt ? new Date(so.createdAt).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-stone-700">Product</th>
              <th className="px-4 py-3 text-left font-medium text-stone-700">SKU</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Base / unit</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Tier</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Final / unit</th>
              <th className="px-4 py-3 text-right font-medium text-stone-700">Line total</th>
            </tr>
          </thead>
          <tbody>
            {(so.items || []).map((item) => {
              const base =
                item.baseUnitPrice != null && item.baseUnitPrice !== ""
                  ? Number(item.baseUnitPrice)
                  : Number(item.unitPrice || 0);
              const tier = Number(item.tierDiscountPercent) || 0;
              const finalUnit = Number(item.unitPrice || 0);
              const lineTotal = (Number(item.quantity) || 0) * finalUnit;
              return (
                <tr key={item.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 text-stone-900">{item.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{item.product?.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-stone-600">{rupee(base)}</td>
                  <td className="px-4 py-3 text-right text-stone-600">{tier > 0 ? `${tier}%` : "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{rupee(finalUnit)}</td>
                  <td className="px-4 py-3 text-right font-medium">{rupee(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-stone-200 bg-stone-50 text-sm space-y-1 text-right">
          <p>
            <span className="text-stone-500">Subtotal (after tier):</span>{" "}
            <strong>{rupee(linesSubtotal)}</strong>
          </p>
          {couponDiscount > 0 && (
            <p className="text-emerald-700">
              Coupon discount: −{rupee(couponDiscount)}
            </p>
          )}
          <p className="text-base font-semibold text-stone-900 pt-1">
            Final total: {rupee(so.totalAmount)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canFulfill && (
          <button
            type="button"
            onClick={openFulfillDialog}
            disabled={fulfilling}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {fulfilling ? "Fulfilling..." : "Sell items (fulfill order)"}
          </button>
        )}
        {isFulfilled && (
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generatingInvoice ? "Generating..." : "Generate invoice"}
          </button>
        )}
      </div>
      {canFulfill && (
        <p className="mt-2 text-sm text-stone-500">
          Fulfilling will deduct stock from inventory and set the order to Confirmed.
        </p>
      )}
      {showFulfillConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Sell items</h2>
            <p className="text-sm text-stone-600 mb-6">
              Confirm fulfillment of this sales order. This will deduct stock from inventory and move the order to
              Confirmed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFulfillDialog}
                disabled={fulfilling}
                className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleFulfill();
                  setShowFulfillConfirm(false);
                }}
                disabled={fulfilling}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {fulfilling ? "Fulfilling..." : "Confirm sell"}
              </button>
            </div>
          </div>
        </div>
      )}

      {canReturn && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Returns</h2>
          {returns.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto mb-4">
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-stone-700">Product</th>
                    <th className="px-4 py-2 text-right font-medium text-stone-700">Qty</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-700">Reason</th>
                    <th className="px-4 py-2 text-left font-medium text-stone-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => (
                    <tr key={r.id} className="border-b border-stone-100">
                      <td className="px-4 py-2 text-stone-900">{r.product?.name ?? "—"}</td>
                      <td className="px-4 py-2 text-right">{r.quantity}</td>
                      <td className="px-4 py-2 text-stone-600">{r.reason || "—"}</td>
                      <td className="px-4 py-2">{returnStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!showReturnForm ? (
            <button
              type="button"
              onClick={() => setShowReturnForm(true)}
              className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-stone-700"
            >
              Create return
            </button>
          ) : (
            <form onSubmit={handleCreateReturn} className="bg-white border border-stone-200 rounded-xl p-4 max-w-md space-y-3">
              <h3 className="font-medium text-stone-900">New return request</h3>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product</label>
                <select
                  value={returnProductId}
                  onChange={(e) => {
                    setReturnProductId(e.target.value);
                    setReturnQty(1);
                  }}
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="">Select product</option>
                  {(so.items || []).map((item) => (
                    <option key={item.id} value={item.productId}>
                      {item.product?.name ?? item.productId} (ordered: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={maxReturnQty}
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
                <p className="text-xs text-stone-500 mt-0.5">Max: {maxReturnQty}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Wrong size, defective"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReturn || !returnProductId || returnQty < 1}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm"
                >
                  {submittingReturn ? "Submitting..." : "Submit return"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnForm(false);
                    setReturnProductId("");
                    setReturnQty(1);
                    setReturnReason("");
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
