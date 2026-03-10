"use client";

import Link from "next/link";

// Placeholder data – replace with API calls later
const recentOrders = [
  { id: "ORD-001", customer: "John Doe", amount: 249.99, status: "Completed", date: "2025-03-10" },
  { id: "ORD-002", customer: "Jane Smith", amount: 89.50, status: "Pending", date: "2025-03-09" },
  { id: "ORD-003", customer: "Bob Wilson", amount: 156.00, status: "Completed", date: "2025-03-09" },
  { id: "ORD-004", customer: "Alice Brown", amount: 320.00, status: "Shipped", date: "2025-03-08" },
  { id: "ORD-005", customer: "Charlie Lee", amount: 45.99, status: "Pending", date: "2025-03-08" },
];

const lowStockProducts = [
  { id: "1", name: "Widget A", sku: "WDG-001", stock: 3, reorderAt: 10 },
  { id: "2", name: "Gadget B", sku: "GDG-002", stock: 5, reorderAt: 15 },
  { id: "3", name: "Part C", sku: "PRT-003", stock: 1, reorderAt: 5 },
  { id: "4", name: "Tool D", sku: "TOL-004", stock: 2, reorderAt: 8 },
];

const recentPayments = [
  { id: "PAY-101", orderId: "ORD-001", amount: 249.99, method: "Card", date: "2025-03-10 14:32" },
  { id: "PAY-102", orderId: "ORD-003", amount: 156.00, method: "Bank", date: "2025-03-09 11:20" },
  { id: "PAY-103", orderId: "ORD-004", amount: 320.00, method: "Card", date: "2025-03-08 09:15" },
  { id: "PAY-104", orderId: "ORD-002", amount: 89.50, method: "Cash", date: "2025-03-08 16:45" },
];

const statusClass = {
  Completed: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Shipped: "bg-blue-100 text-blue-800",
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
  return (
    <TableCard title="Recent Orders" viewAllHref="#">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Order ID</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Customer</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Amount</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Status</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                No recent orders.
              </td>
            </tr>
          ) : (
            recentOrders.map((row) => (
              <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-medium text-stone-900">{row.id}</td>
                <td className="px-4 py-2.5 text-stone-600">{row.customer}</td>
                <td className="px-4 py-2.5 text-stone-600">${row.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusClass[row.status] || "bg-stone-100 text-stone-700"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-stone-500">{row.date}</td>
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

export function RecentPaymentsTable() {
  return (
    <TableCard title="Recent Payments" viewAllHref="#">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-2.5 font-medium text-stone-600">Payment ID</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Order</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Amount</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Method</th>
            <th className="px-4 py-2.5 font-medium text-stone-600">Date</th>
          </tr>
        </thead>
        <tbody>
          {recentPayments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                No recent payments.
              </td>
            </tr>
          ) : (
            recentPayments.map((row) => (
              <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-2.5 font-medium text-stone-900">{row.id}</td>
                <td className="px-4 py-2.5 text-stone-600">{row.orderId}</td>
                <td className="px-4 py-2.5 text-stone-600">${row.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-stone-500">{row.method}</td>
                <td className="px-4 py-2.5 text-stone-500">{row.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableCard>
  );
}
