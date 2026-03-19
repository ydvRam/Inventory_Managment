"use client";

import { format } from "date-fns";

const COMPANY_NAME = "INVENTORY SYSTEM";
const COMPANY_ADDRESS = "Ahmedabad, Gujarat, India";
const GST_RATE = 0.18;

/** Plain-paper style invoice layout (matches PDF). */
export default function InvoiceLayout({ invoice, onDownloadPDF, downloading }) {
  const items = invoice?.salesOrder?.items ?? [];
  const subtotal = Number(invoice?.amount ?? 0);
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + gst;
  const invDate = invoice?.createdAt ? format(new Date(invoice.createdAt), "dd/MM/yyyy, HH:mm") : "—";
  const billToAddress = invoice?.customer?.address?.trim() || "—";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Paper-style invoice */}
      <div className="bg-white border-1 border-stone-300 p-8 font-mono text-sm text-stone-800">
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-wide">{COMPANY_NAME}</h1>
          <p className="mt-1 text-stone-600">{COMPANY_ADDRESS}</p>
        </div>
        <hr className="my-4 border-stone-300" />
        <p>Invoice #: {invoice?.invoiceNumber ?? invoice?.id}</p>
        <p>Date: {invDate}</p>
        <p className="mt-2 font-semibold">Bill To:</p>
        <p>{invoice?.customer?.name ?? "—"}</p>
        <p className="text-stone-600">{billToAddress}</p>
        <hr className="my-4 border-stone-300" />
        <div className="grid grid-cols-12 gap-1 font-semibold border-b border-stone-400 pb-1">
          <span className="col-span-4">Product</span>
          <span className="col-span-2">SKU</span>
          <span className="col-span-2 text-right">Qty</span>
          <span className="col-span-2 text-right">Price</span>
          <span className="col-span-2 text-right">Total</span>
        </div>
        {items.map((item) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.unitPrice) || 0;
          const lineTotal = qty * price;
          return (
            <div key={item.id} className="grid grid-cols-12 gap-1 py-1 border-b border-stone-200">
              <span className="col-span-4 truncate">{item.product?.name ?? "—"}</span>
              <span className="col-span-2">{item.product?.sku ?? "—"}</span>
              <span className="col-span-2 text-right">{qty}</span>
              <span className="col-span-2 text-right">{price}</span>
              <span className="col-span-2 text-right">{lineTotal}</span>
            </div>
          );
        })}
        <hr className="my-4 border-stone-300" />
        <div className="flex justify-end gap-8">
          <div className="text-right space-y-0.5">
            <p>Subtotal: {subtotal}</p>
            <p>GST (18%): {gst}</p>
          </div>
        </div>
        <hr className="my-4 border-stone-300" />
        <div className="flex justify-end">
          <p className="font-bold">Total: {total}</p>
        </div>
        <p className="mt-2">Payment Status: {invoice?.status ?? "—"}</p>
        <hr className="my-4 border-stone-300" />
        <p className="text-center text-stone-600 text-xs mt-4">Thank you for your business!</p>
      </div>

      {onDownloadPDF && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={downloading}   
            className="px-6 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
          >
            {downloading ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
