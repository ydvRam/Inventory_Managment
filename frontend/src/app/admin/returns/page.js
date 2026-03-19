"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

const statusBadge = (status) => {
  const c =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-800"
      : status === "REJECTED"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [err, setErr] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    if (!getStoredUser()?.id) return;
    const url = filter ? getApiUrl(`returns?status=${filter}`) : getApiUrl("returns");
    setLoading(true);
    fetch(url, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) window.location.href = "/login";
        return res.ok ? res.json() : [];
      })
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, [filter]);

  function handleApprove(id) {
    setActingId(id);
    setErr("");
    fetch(getApiUrl(`returns/${id}/approve`), { method: "POST", headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed"); });
        const url = filter ? getApiUrl(`returns?status=${filter}`) : getApiUrl("returns");
        return fetch(url, { headers: getAuthHeaders() }).then((r) => (r.ok ? r.json() : []));
      })
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message))
      .finally(() => setActingId(null));
  }

  function handleReject(id) {
    setActingId(id);
    setErr("");
    fetch(getApiUrl(`returns/${id}/reject`), { method: "POST", headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Failed"); });
        const url = filter ? getApiUrl(`returns?status=${filter}`) : getApiUrl("returns");
        return fetch(url, { headers: getAuthHeaders() }).then((r) => (r.ok ? r.json() : []));
      })
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch((e) => setErr(e.message))
      .finally(() => setActingId(null));
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Returns & Refunds</h1>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Order</th>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Product</th>
                <th className="px-4 py-3 text-right font-medium text-stone-700">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-stone-700">Date</th>
                {filter === "PENDING" && (
                  <th className="px-4 py-3 text-right font-medium text-stone-700 w-40">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={filter === "PENDING" ? 8 : 7} className="px-4 py-8 text-center text-stone-500">
                    No return requests.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/sales-orders/${r.salesOrderId}`}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {r.salesOrderId?.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-900">{r.salesOrder?.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-stone-900">{r.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{r.quantity}</td>
                    <td className="px-4 py-3 text-stone-600 max-w-[180px] truncate" title={r.reason || ""}>
                      {r.reason || "—"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    {filter === "PENDING" && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(r.id)}
                            disabled={actingId !== null}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actingId === r.id ? "…" : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(r.id)}
                            disabled={actingId !== null}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {actingId === r.id ? "…" : "Reject"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
