"use client";

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
import { SalesChart, PurchaseVsSalesChart, MonthlyRevenueChart } from "@/components/admin/DashboardCharts";
import { RecentOrdersTable, LowStockProductsTable, RecentPaymentsTable } from "@/components/admin/DashboardTables";

// Placeholder data – replace with API calls later
const stats = [
  { label: "Total Products", value: "0", icon: HiOutlineCube, color: "teal" },
  { label: "Total Customers", value: "0", icon: HiOutlineUsers, color: "blue" },
  { label: "Total Orders", value: "0", icon: HiOutlineShoppingCart, color: "amber" },
  { label: "Total Revenue", value: "$0", icon: HiOutlineCurrencyDollar, color: "emerald" },
  { label: "Low Stock Items", value: "0", icon: HiOutlineExclamationTriangle, color: "red" },
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
  { label: "Generate Invoice", href: "/admin/invoices/new", icon: HiOutlineDocumentText, color: "blue" },
];

export default function AdminDashboardPage() {
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
        </div>

        <div>
          <h3 className="text-xl font-semibold text-stone-900 mb-6">Top Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
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
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <MonthlyRevenueChart />
        </div>
        <div className="mt-6">
          <PurchaseVsSalesChart />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrdersTable />
          </div>
          <div>
            <LowStockProductsTable />
          </div>
        </div>
        <div className="mt-6">
          <RecentPaymentsTable />
        </div>
      </div>
    </div>
  );
}
