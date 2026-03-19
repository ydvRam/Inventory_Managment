"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

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

  function loadInventory() {
    fetch(getApiUrl("inventory"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) return [];
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load inventory"));
  }

  useEffect(() => {
    // const user = getStoredUser();
    // if (!user?.id) {
    //   router.replace("/login");
    //   return;
    // }
    fetch(getApiUrl("inventory"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [router]);

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
    if (!confirm("Clear expiry date for this product?")) return;
    setSaving(true);
    fetch(getApiUrl(`inventory/expiry?productId=${productId}`), {
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

  if (loading) {
    return <p className="text-stone-500">Loading inventory...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Inventory</h1>
        <p className="text-sm text-stone-500 mt-1">
          Stock levels by product. Set expiry to block sales of expired stock. Updated when you receive purchase orders.
        </p>
      </div>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No inventory records yet. Receive a purchase order to see stock here.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const expired = isExpired(row.expiryDate);
                const soon = isExpiringSoon(row.expiryDate);
                const isEditing = editingProductId === row.productId;
                return (
                  <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-stone-900">{row.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{row.product?.sku ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{row.quantity ?? 0}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
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
                              onClick={() => clearExpiry(row.productId)}
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
