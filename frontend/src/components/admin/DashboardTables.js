"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineEye } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders } from "@/lib/auth";
import { format } from 'date-fns';

const lowStockProducts = [
  { id: "1", name: "Widget A", sku: "WDG-001", stock: 3, reorderAt: 10 },
  { id: "2", name: "Gadget B", sku: "GDG-002", stock: 5, reorderAt: 15 },
  { id: "3", name: "Part C", sku: "PRT-003", stock: 1, reorderAt: 5 },
  { id: "4", name: "Tool D", sku: "TOL-004", stock: 2, reorderAt: 8 },
];

const orderStatusClass = {
  Delivered: "bg-emerald-100 text-emerald-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-blue-100 text-blue-800",
  Pending: "bg-amber-100 text-amber-800",
  Cancelled: "bg-red-100 text-red-800",
};

function TableCard({ title, children, viewAllHref }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50/80">
        <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
          >
            View all
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("sales-orders"), { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(sorted.slice(0, 10));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <TableCard title="Recent Orders" viewAllHref="/admin/sales-orders">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Customer</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Amount</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Status</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Date</th>
            <th className="px-4 py-2.5 font-medium text-stone-600 w-16">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                Loading...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                No recent orders.
              </td>
            </tr>
          ) : (
            orders.map((row) => (
              <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-medium text-stone-900">{row.customer?.name ?? "—"}</td>
                <td className="px-4 py-2.5 text-stone-600">${Number(row.totalAmount || 0).toFixed(2)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${orderStatusClass[row.status] || "bg-stone-100 text-stone-700"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-stone-500">
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/sales-orders/${row.id}`}
                    className="text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    title="View"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableCard>
  );
}

export function LowStockProductsTable() {
  return (
    <TableCard title="Low Stock Products" viewAllHref="/admin/products">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Product</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">SKU</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Stock</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Reorder at</th>
            <th className="px-4 py-2.5 font-medium text-stone-600 w-20">Action</th>
          </tr>
        </thead>
        <tbody>
          {lowStockProducts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                No low stock items.
              </td>
            </tr>
          ) : (
            lowStockProducts.map((row) => (
              <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-medium text-stone-900">{row.name}</td>
                <td className="px-4 py-2.5 text-stone-600">{row.sku}</td>
                <td className="px-4 py-2.5">
                  <span className={row.stock <= 2 ? "font-medium text-red-600" : "text-amber-600"}>
                    {row.stock}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-stone-500">{row.reorderAt}</td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/products/${row.id}/edit`}
                    className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableCard>
  );
}

export function ExpiringSoonTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("inventory/expiring?withinDays=7"), { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const d = new Date(expiryDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <TableCard title="Expiring / Expired (7 days)" viewAllHref="/admin/inventory">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Product</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">SKU</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Qty</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Expiry</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                No expiring or expired inventory in the next 7 days.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const expired = isExpired(row.expiryDate);
              return (
                <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-2.5 font-medium text-stone-900">{row.product?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-stone-600">{row.product?.sku ?? "—"}</td>
                  <td className="px-4 py-2.5 text-stone-600">{row.quantity ?? 0}</td>
                  <td className="px-4 py-2.5 text-stone-600">
                    {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        expired ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {expired ? "Expired" : "Expiring soon"}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </TableCard>
  );
}

export function RecentPaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("invoices/recent-payments?limit=10"), { headers: getAuthHeaders() })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <TableCard title="Recent Payments" viewAllHref="/admin/invoices">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Invoice</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Amount</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Method</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                Loading...
              </td>
            </tr>
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                No recent payments.
              </td>
            </tr>
          ) : (
            payments.map((row) => (
              <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-medium text-stone-900">{row.invoice?.invoiceNumber ?? row.invoiceId ?? "—"}</td>
                <td className="px-4 py-2.5 text-stone-600">${Number(row.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-stone-600">{row.method ?? "—"}</td>
                <td className="px-4 py-2.5 text-stone-500">{row.paidAt ? format(new Date(row.paidAt), "dd/MM/yyyy HH:mm") : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableCard>
  );
}
