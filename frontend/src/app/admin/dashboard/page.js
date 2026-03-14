"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlinePlusCircle,
  HiOutlineShoppingBag,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";
import { SalesChart, PurchaseVsSalesChart, MonthlyRevenueChart } from "@/components/admin/DashboardCharts";
import { RecentOrdersTable, LowStockProductsTable, RecentPaymentsTable, ExpiringSoonTable } from "@/components/admin/DashboardTables";

const statsConfig = [
  { key: "totalProducts", label: "Total Products", icon: HiOutlineCube, color: "teal", format: "number" },
  { key: "totalCustomers", label: "Total Customers", icon: HiOutlineUsers, color: "blue", format: "number" },
  { key: "totalOrders", label: "Total Orders", icon: HiOutlineShoppingCart, color: "amber", format: "number" },
  { key: "totalRevenue", label: "Total Revenue", icon: HiOutlineCurrencyDollar, color: "emerald", format: "currency" },
  { key: "lowStockItems", label: "Low Stock Items", icon: HiOutlineExclamationTriangle, color: "red", format: "number" },
];

const colorClasses = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
};

const quickActions = [
  { label: "Add Product", href: "/admin/products/new", icon: HiOutlinePlusCircle, color: "blue" },
  { label: "Create Purchase Order", href: "/admin/purchase-orders/new", icon: HiOutlineShoppingBag, color: "blue" },
  { label: "Create Sales Order", href: "/admin/sales-orders/new", icon: HiOutlineShoppingCart, color: "blue" },
  { label: "Generate Invoice", href: "/admin/sales-orders", icon: HiOutlineDocumentText, color: "blue" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartData, setChartData] = useState({ salesOrders: [], purchaseOrders: [] });

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) return;
    const headers = getAuthHeaders();
    Promise.all([
      fetch(getApiUrl("products"), { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("customers"), { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("sales-orders"), { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(getApiUrl("purchase-orders"), { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([products, customers, salesOrders, purchaseOrders]) => {
        const productsList = Array.isArray(products) ? products : [];
        const customersList = Array.isArray(customers) ? customers : [];
        const ordersList = Array.isArray(salesOrders) ? salesOrders : [];
        const purchaseList = Array.isArray(purchaseOrders) ? purchaseOrders : [];
        const revenue = ordersList.reduce(
          (sum, o) => sum + (Number(o.totalAmount) || 0),
          0
        );
        const lowStock = productsList.filter(
          (p) => p.reorderPoint != null && (p.stockLevel ?? 0) <= p.reorderPoint
        ).length;
        setStats({
          totalProducts: productsList.length,
          totalCustomers: customersList.length,
          totalOrders: ordersList.length,
          totalRevenue: revenue,
          lowStockItems: lowStock,
        });
        setChartData({ salesOrders: ordersList, purchaseOrders: purchaseList });
      })
      .catch(() => {
        setStats({ totalProducts: 0, totalCustomers: 0, totalOrders: 0, totalRevenue: 0, lowStockItems: 0 });
        setChartData({ salesOrders: [], purchaseOrders: [] });
      })
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="w-full">
      <div>

        <div className="mb-8 w-full">
          <h3 className="text-xl font-semibold text-stone-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm hover:shadow hover:border-stone-300 transition-all w-full"
              >
                <div className={`p-2 rounded-lg shrink-0 ${colorClasses[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
          {/* <p className="mt-2 text-sm text-stone-500">
            Create sales order → open it → Fulfill (sell items) → then Generate invoice from that order page.
          </p> */}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-stone-900 mb-6">Top Stats</h3>
          {statsLoading ? (
            <p className="text-stone-500">Loading stats...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {statsConfig.map(({ key, label, icon: Icon, color, format }) => {
                const raw = stats[key] ?? 0;
                const value = format === "currency" ? `$${Number(raw).toFixed(2)}` : String(raw);
                return (
                  <div
                    key={key}
                    className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-500">{label}</p>
                        <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart salesOrders={chartData.salesOrders} />
          <MonthlyRevenueChart salesOrders={chartData.salesOrders} />
        </div>
        <div className="mt-6">
          <PurchaseVsSalesChart salesOrders={chartData.salesOrders} purchaseOrders={chartData.purchaseOrders} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrdersTable />
          </div>
          <div>
            <LowStockProductsTable />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentPaymentsTable />
          <ExpiringSoonTable />
        </div>
      </div>
    </div>
  );
}
