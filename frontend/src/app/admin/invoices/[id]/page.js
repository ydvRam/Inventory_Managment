"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";
import InvoiceLayout from "@/components/InvoiceLayout";

/** Static payment methods – not from API. Only these three. */
const PAYMENT_METHODS = ["Bank", "Cash", "Card"];

const statusBadge = (status) => {
  const c = status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-1 rounded text-sm font-medium ${c}`}>{status}</span>;
};

export default function AdminInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl(`invoices/${id}`), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        setInv(data);
        const total = Number(data?.amount ?? 0);
        const paid = Number(data?.paidAmount ?? 0);
        const due = total - paid;
        setPaymentAmount(due > 0 ? String(due) : "");
      })
      .catch(() => setErr("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, router]);

  function handlePay() {
    if (!inv || inv.status === "Paid") return;
    const total = Number(inv.amount ?? 0);
    const paid = Number(inv.paidAmount ?? 0);
    const due = total - paid;
    const amount = Number(paymentAmount) || due;
    if (amount <= 0) {
      setErr("Enter a valid payment amount");
      return;
    }
    const remaining = due - amount;
    const msg = remaining > 0
      ? `Pay ₹${amount.toLocaleString("en-IN")} by ${paymentMethod}? ₹${remaining.toLocaleString("en-IN")} will remain pending.`
      : `Mark as paid: ₹${amount.toLocaleString("en-IN")} by ${paymentMethod}? (Full payment)`;
    if (!confirm(msg)) return;
    setPaying(true);
    setErr("");
    fetch(getApiUrl(`invoices/${id}/pay`), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ method: paymentMethod, amount }),
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        if (!res.ok) return res.json().then((d) => { throw new Error(d.message || "Payment failed"); });
        return res.json();
      })
      .then((data) => {
        setInv(data);
        const newDue = Number(data?.amount ?? 0) - Number(data?.paidAmount ?? 0);
        setPaymentAmount(newDue > 0 ? String(newDue) : "");
      })
      .catch((e) => setErr(e.message || "Payment failed"))
      .finally(() => setPaying(false));
  }

  function handleDownloadPDF() {
    setDownloading(true);
    fetch(getApiUrl(`invoices/${id}/pdf`), { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${inv?.invoiceNumber ?? id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setErr("Failed to download PDF"))
      .finally(() => setDownloading(false));
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;
  if (!inv) return <p className="text-stone-500">{err || "Invoice not found."}</p>;

  return (
    <div>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Invoices
          </Link>
          <h1 className="text-xl font-semibold text-stone-900">Invoice {inv.invoiceNumber ?? inv.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(inv.status)}
          {inv.status === "Unpaid" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-600">
                Total ₹{Number(inv.amount ?? 0).toLocaleString("en-IN")}
                {Number(inv.paidAmount ?? 0) > 0 && (
                  <> · Paid ₹{Number(inv.paidAmount ?? 0).toLocaleString("en-IN")} · Due ₹{(Number(inv.amount ?? 0) - Number(inv.paidAmount ?? 0)).toLocaleString("en-IN")}</>
                )}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-28 border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {paying ? "Processing…" : "Mark paid"}
              </button>
            </div>
          )}
        </div>
      </div>

      <InvoiceLayout invoice={inv} onDownloadPDF={handleDownloadPDF} downloading={downloading} />
    </div>
  );
}
