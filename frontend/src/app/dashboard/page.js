"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineBanknotes,
  HiOutlinePlusCircle,
  HiOutlineCube,
  HiOutlineDocumentDuplicate,
  HiOutlineEye,
} from "react-icons/hi2";
import { getStoredUser, isAdmin, getApiUrl, getAuthHeaders } from "@/lib/auth";

const cardConfig = [
  {
    key: "salesToday",
    label: "My sales today",
    icon: HiOutlineCurrencyDollar,
    color: "teal",
    href: "/dashboard/sales-orders",
  },
  {
    key: "pendingOrders",
    label: "Pending orders",
    icon: HiOutlineClock,
    color: "amber",
    href: "/dashboard/sales-orders",
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: HiOutlineDocumentText,
    color: "blue",
    href: "/dashboard/invoices",
  },
  {
    key: "paymentReceived",
    label: "Payment received",
    icon: HiOutlineBanknotes,
    color: "emerald",
    href: "/dashboard/invoices",
  },
];

const colorClasses = {
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

const quickActions = [
  { label: "Create sales order", href: "/dashboard/sales-orders/new", icon: HiOutlinePlusCircle, color: "blue" },
  { label: "View products", href: "/dashboard/products", icon: HiOutlineCube, color: "blue" },
  { label: "Generate invoice", href: "/dashboard/sales-orders", icon: HiOutlineDocumentDuplicate, color: "blue" },
];

function statusBadge(status) {
  const c =
    status === "Delivered"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Confirmed" || status === "Shipped"
        ? "bg-blue-100 text-blue-800"
        : status === "Cancelled"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{status}</span>;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [stats, setStats] = useState({
    salesToday: 0,
    salesTodayAmount: "0",
    pendingOrders: 0,
    invoices: 0,
    paymentReceived: 0,
  });
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    if (isAdmin(user)) router.replace("/admin/dashboard");
  }, [router, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const headers = getAuthHeaders();
    Promise.all([
      fetch(getApiUrl("sales-orders"), { headers }).then((r) => (r.status === 200 ? r.json() : [])),
      fetch(getApiUrl("invoices"), { headers }).then((r) => (r.status === 200 ? r.json() : [])),
      fetch(getApiUrl("customers"), { headers }).then((r) => (r.status === 200 ? r.json() : [])),
    ])
      .then(([ordersList, invoicesList, customersList]) => {
        const o = Array.isArray(ordersList) ? ordersList : [];
        const inv = Array.isArray(invoicesList) ? invoicesList : [];
        const cust = Array.isArray(customersList) ? customersList : [];
        setOrders(o);
        setCustomers(cust);
        const today = new Date().toDateString();
        const todayOrders = o.filter((ord) => {
          const d = ord.createdAt ? new Date(ord.createdAt).toDateString() : "";
          return d === today && ord.status !== "Cancelled";
        });
        const salesTodayAmount = todayOrders.reduce(
          (sum, ord) => sum + (Number(ord.totalAmount) || 0),
          0
        );
        const pending = o.filter((ord) => ord.status === "Pending").length;
        const paid = inv.filter((i) => i.status === "Paid");
        setStats({
          salesToday: todayOrders.length,
          salesTodayAmount: salesTodayAmount.toFixed(2),
          pendingOrders: pending,
          invoices: inv.length,
          paymentReceived: paid.length,
        });
      })
      .catch(() => setErr("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8);
  const pendingDeliveries = orders.filter((o) => o.status === "Pending" || o.status === "Shipped");
  const recentCustomers = [...customers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8);

  if (!user?.id) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Dashboard</h1>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      {loading ? (
        <p className="text-stone-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cardConfig.map(({ key, label, icon: Icon, color, href }) => {
              const value =
                key === "salesToday"
                  ? `$${stats.salesTodayAmount} (${stats.salesToday})`
                  : key === "pendingOrders"
                    ? stats.pendingOrders
                    : key === "invoices"
                      ? stats.invoices
                      : stats.paymentReceived;
              return (
                <Link
                  key={key}
                  href={href}
                  className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow flex items-start justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm hover:shadow hover:border-stone-300 transition-all"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
            <p className="mt-2 text-sm text-stone-500">
              Create a sales order → fulfill it from the order detail → generate invoice from that page.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Recent sales orders</h3>
                <Link href="/dashboard/sales-orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Customer</th>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Total</th>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Status</th>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Date</th>
                      <th className="px-4 py-2.5 w-16" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                          No sales orders yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="px-4 py-2.5 text-stone-900">{o.customer?.name ?? "—"}</td>
                          <td className="px-4 py-2.5">${Number(o.totalAmount || 0).toFixed(2)}</td>
                          <td className="px-4 py-2.5">{statusBadge(o.status)}</td>
                          <td className="px-4 py-2.5 text-stone-600">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/dashboard/sales-orders/${o.id}`}
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
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <h3 className="font-semibold text-stone-900">Pending deliveries</h3>
                <Link href="/dashboard/sales-orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Customer</th>
                      <th className="px-4 py-2.5 font-medium text-stone-700">Status</th>
                      <th className="px-4 py-2.5 w-16" />
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                          No pending deliveries.
                        </td>
                      </tr>
                    ) : (
                      pendingDeliveries.slice(0, 5).map((o) => (
                        <tr key={o.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                          <td className="px-4 py-2.5 text-stone-900">{o.customer?.name ?? "—"}</td>
                          <td className="px-4 py-2.5">{statusBadge(o.status)}</td>
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/dashboard/sales-orders/${o.id}`}
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
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">Recent customers</h3>
              <Link href="/dashboard/customers" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2.5 font-medium text-stone-700">Name</th>
                    <th className="px-4 py-2.5 font-medium text-stone-700">Email</th>
                    <th className="px-4 py-2.5 font-medium text-stone-700">Phone</th>
                    <th className="px-4 py-2.5 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                        No customers yet.
                      </td>
                    </tr>
                  ) : (
                    recentCustomers.map((c) => (
                      <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                        <td className="px-4 py-2.5 text-stone-900">{c.name ?? "—"}</td>
                        <td className="px-4 py-2.5 text-stone-600">{c.email ?? "—"}</td>
                        <td className="px-4 py-2.5 text-stone-600">{c.phone ?? "—"}</td>
                        <td className="px-4 py-2.5">
                          <Link
                            href="/dashboard/customers"
                            className="text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                            title="View customers"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
