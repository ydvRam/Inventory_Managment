"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders } from "@/lib/auth";

function formatDateForInput(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return exp < today;
}

function isExpiringSoon(expiryDate, withinDays = 7) {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);
  return exp >= today && exp <= cutoff;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearProductId, setClearProductId] = useState(null);

  const loadInventory = useCallback(() => {
    return fetch(getApiUrl("inventory"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load inventory"));
  }, [router]);

  useEffect(() => {
    loadInventory().finally(() => setLoading(false));
  }, [loadInventory]);

  function startEdit(row) {
    setEditingProductId(row.productId);
    setEditValue(formatDateForInput(row.expiryDate));
  }

  function cancelEdit() {
    setEditingProductId(null);
    setEditValue("");
  }

  function saveExpiry(productId) {
    setSaving(true);
    const body = editValue ? { expiryDate: editValue } : { expiryDate: null };
    fetch(getApiUrl(`inventory/expiry?productId=${productId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed to update expiry"); });
        return res.json();
      })
      .then(() => {
        setEditingProductId(null);
        setEditValue("");
        loadInventory();
      })
      .catch((e) => setErr(e.message || "Failed to update expiry"))
      .finally(() => setSaving(false));
  }

  function clearExpiry(productId) {
    if (!productId) return Promise.resolve();
    setSaving(true);
    return fetch(getApiUrl(`inventory/expiry?productId=${productId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ expiryDate: null }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed to clear expiry"); });
        return res.json();
      })
      .then(() => {
        setEditingProductId(null);
        loadInventory();
      })
      .catch((e) => setErr(e.message || "Failed to clear expiry"))
      .finally(() => setSaving(false));
  }

  function openClearDialog(productId) {
    setClearProductId(productId);
    setShowClearConfirm(true);
  }

  function closeClearDialog() {
    setShowClearConfirm(false);
    setClearProductId(null);
  }

  if (loading) {
    return <p className="text-stone-500">Loading inventory...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Inventory</h1>
      <p className="text-sm text-stone-600 mt-1 max-w-2xl">
        Live <strong>stock quantities</strong> per product. <strong>Expiry</strong> helps block or warn on dated stock.
        Quantities update when you <strong>receive purchase orders</strong> and when <strong>sales orders are fulfilled</strong>.
      </p>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}

      <div className="w-full lg:flex gap-5 items-start mt-6">
        <div className="lg:w-[65%] w-full min-h-[200px] bg-white border border-stone-200 rounded-xl overflow-hidden">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-stone-800 font-medium">No inventory records yet</p>
              <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
                Stock appears after products exist and you receive goods via a purchase order (or initial stock is set).
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-5">
                <Link
                  href="/admin/purchase-orders"
                  className="inline-flex px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                >
                  Go to purchase orders
                </Link>
                <Link
                  href="/admin/products"
                  className="inline-flex px-4 py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50"
                >
                  Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[520px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-stone-700">Product</th>
                    <th className="px-4 py-3 font-medium text-stone-700">SKU</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Quantity</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Expiry</th>
                    <th className="px-4 py-3 font-medium text-stone-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const expired = isExpired(row.expiryDate);
                    const soon = isExpiringSoon(row.expiryDate);
                    const isEditing = editingProductId === row.productId;
                    return (
                      <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                        <td className="px-4 py-3 text-stone-900">{row.product?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-stone-600">{row.product?.sku ?? "—"}</td>
                        <td className="px-4 py-3 font-medium text-stone-900 tabular-nums">
                          {Number(row.quantity ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="border border-stone-300 rounded px-2 py-1 text-stone-800"
                              />
                              <button
                                type="button"
                                onClick={() => saveExpiry(row.productId)}
                                disabled={saving}
                                className="text-teal-600 hover:text-teal-700 text-xs font-medium disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-stone-500 hover:text-stone-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span
                              className={
                                expired
                                  ? "text-red-600 font-medium"
                                  : soon
                                    ? "text-amber-600 font-medium"
                                    : "text-stone-600"
                              }
                            >
                              {row.expiryDate
                                ? `${new Date(row.expiryDate).toLocaleDateString()}${expired ? " (Expired)" : soon ? " (Soon)" : ""}`
                                : "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? null : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                              >
                                {row.expiryDate ? "Edit" : "Set"} expiry
                              </button>
                              {row.expiryDate && (
                                <button
                                  type="button"
                                  onClick={() => openClearDialog(row.productId)}
                                  disabled={saving}
                                  className="text-stone-500 hover:text-red-600 text-xs"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-2">
              Clear expiry date
            </h2>

            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to clear the expiry date for this product?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeClearDialog}
                className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  clearExpiry(clearProductId).finally(closeClearDialog);
                }}
                className="px-4 py-2 rounded-lg bg-teal-600  text-white hover:bg-red-400"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
