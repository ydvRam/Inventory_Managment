"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [err, setErr] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      setLoading(false);
      return;
    }
    const url = filter ? getApiUrl(`returns?status=${filter}`) : getApiUrl("returns");
    setLoading(true);
    fetch(url, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.ok ? res.json() : [];
      })
      .then((data) => setReturns(Array.isArray(data) ? data : []))
      .catch(() => setReturns([]))
      .finally(() => setLoading(false));
  }, [filter, router]);

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

  const emptyHint =
    filter === "PENDING"
      ? "No pending requests. When a return is submitted from a fulfilled sales order, it will appear here for you to approve or reject."
      : `No ${filter.toLowerCase()} returns. Try another filter or check sales orders for new requests.`;

  if (loading) {
    return <p className="text-stone-500">Loading returns...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Returns &amp; refunds</h1>
      <p className="text-sm text-stone-600 mt-1 max-w-2xl">
        Customer return requests tied to sales orders. Use <strong>Pending</strong> to approve or reject; approved
        returns restore stock. Open an order link to see full order context.
      </p>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}

      <div className="flex flex-wrap gap-2 mt-4 mb-4">
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

      <div className="w-full lg:flex gap-5 items-start">
        <div className="lg:w-[65%] w-full min-h-[200px] bg-white border border-stone-200 rounded-xl overflow-hidden">
          {returns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-stone-800 font-medium">No return requests</p>
              <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">{emptyHint}</p>
              <Link
                href="/admin/sales-orders"
                className="inline-flex mt-5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                Go to sales orders
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-3 py-2 text-center font-medium text-stone-700">Order</th>
                    <th className="px-3 py-2 text-center font-medium text-stone-700">Customer</th>
                    <th className="px-3 py-3 text-center font-medium text-stone-700">Product</th>
                    <th className="px-3 py-3 text-center font-medium text-stone-700">Qty</th>
                    <th className="px-3 py-3 text-center font-medium text-stone-700">Reason</th>
                    <th className="px-3 py-3 text-center font-medium text-stone-700">Status</th>
                    <th className="px-3 py-3 text-center font-medium text-stone-700">Date</th>
                    {filter === "PENDING" && (
                      <th className="px-2 py-3 text-center font-medium text-stone-700 w-40">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => (
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
                      <td className="px-4 py-3 text-right tabular-nums">
                        {(r.quantity ?? 0).toLocaleString("en-IN")}
                      </td>
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
                  ))}
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
            src="/img/refunds.png"
            alt=""
            className="w-full max-h-[min(420px,65vh)] object-contain object-center"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
