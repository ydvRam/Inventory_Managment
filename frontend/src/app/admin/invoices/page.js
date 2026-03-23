"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineEye } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders } from "@/lib/auth";

function rupee(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

const statusBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
};

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(getApiUrl("invoices"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        if (res.status === 404) return [];
        return res.json();
      })
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <p className="text-stone-500">Loading invoices...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Invoices</h1>
      <p className="text-sm text-stone-600 mt-1 max-w-2xl">
        Bills issued to customers. To add one: open a <strong>fulfilled</strong> sales order →{" "}
        <strong>Generate invoice</strong> on that page. This list is your record of amounts and payment status.
      </p>
      {err && <p className="text-sm text-red-600 mt-4">{err}</p>}

      <div className="w-full lg:flex gap-5 items-start mt-6">
        <div className="lg:w-[65%] w-full min-h-[200px] bg-white border border-stone-200 rounded-xl overflow-hidden">
          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-stone-800 font-medium">No invoices yet</p>
              <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
                Fulfill a sales order first, then create the invoice from that order&apos;s detail page.
              </p>
              <Link
                href="/admin/sales-orders"
                className="inline-flex mt-5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                Go to sales orders
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-stone-700">Invoice #</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Date</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Customer</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Amount</th>
                    <th className="px-4 py-3 font-medium text-stone-700">Status</th>
                    <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-900">{inv.invoiceNumber ?? inv.id}</td>
                      <td className="px-4 py-3 text-stone-600">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{inv.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{rupee(inv.amount)}</td>
                      <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
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
            src="/img/invoice.png"
            alt=""
            className="w-full max-h-[min(420px,65vh)] object-contain object-center"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
