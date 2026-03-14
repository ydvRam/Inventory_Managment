"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Aggregate sales orders by month. Returns [{ month, monthLabel, sales }, ...] sorted by month. */
function aggregateSalesByMonth(salesOrders) {
  const byMonth = {};
  for (const o of salesOrders || []) {
    const key = getMonthKey(o.createdAt);
    if (!byMonth[key]) byMonth[key] = { key, monthLabel: getMonthLabel(o.createdAt), sales: 0 };
    byMonth[key].sales += Number(o.totalAmount) || 0;
  }
  return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
}

/** Aggregate purchase orders by month. Returns [{ key, monthLabel, purchase }, ...] sorted by month. */
function aggregatePurchasesByMonth(purchaseOrders) {
  const byMonth = {};
  for (const o of purchaseOrders || []) {
    const key = getMonthKey(o.createdAt);
    if (!byMonth[key]) byMonth[key] = { key, monthLabel: getMonthLabel(o.createdAt), purchase: 0 };
    byMonth[key].purchase += Number(o.totalPrice) || 0;
  }
  return Object.values(byMonth).sort((a, b) => a.key.localeCompare(b.key));
}

/** Merge sales and purchase aggregates by month for comparison. */
function mergePurchaseVsSales(salesOrders, purchaseOrders) {
  const salesByMonth = aggregateSalesByMonth(salesOrders);
  const purchaseByMonth = aggregatePurchasesByMonth(purchaseOrders);
  const keys = new Set([...salesByMonth.map((s) => s.key), ...purchaseByMonth.map((p) => p.key)]);
  const salesMap = Object.fromEntries(salesByMonth.map((s) => [s.key, s]));
  const purchaseMap = Object.fromEntries(purchaseByMonth.map((p) => [p.key, p]));
  return Array.from(keys)
    .sort()
    .map((key) => ({
      key,
      month: (salesMap[key]?.monthLabel || purchaseMap[key]?.monthLabel) || key,
      purchase: Math.round((purchaseMap[key]?.purchase || 0) * 100) / 100,
      sales: Math.round((salesMap[key]?.sales || 0) * 100) / 100,
    }));
}

export function SalesChart({ salesOrders = [] }) {
  const data = useMemo(() => aggregateSalesByMonth(salesOrders), [salesOrders]);
  const chartData = data.map((d) => ({ ...d, sales: Math.round(d.sales * 100) / 100 }));

  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Sales</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-500 text-sm">No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#78716c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#78716c" tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#0d7377"
                  strokeWidth={2}
                  dot={{ fill: "#0d7377", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export function PurchaseVsSalesChart({ salesOrders = [], purchaseOrders = [] }) {
  const data = useMemo(() => mergePurchaseVsSales(salesOrders, purchaseOrders), [salesOrders, purchaseOrders]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Purchase vs Sales</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          {data.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-500 text-sm">No purchase or sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#78716c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#78716c" tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="purchase" fill="#94a3b8" name="Purchase" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" fill="#0d7377" name="Sales" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export function MonthlyRevenueChart({ salesOrders = [] }) {
  const data = useMemo(() => {
    const byMonth = aggregateSalesByMonth(salesOrders);
    return byMonth.map((d) => ({ ...d, revenue: Math.round(d.sales * 100) / 100 }));
  }, [salesOrders]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Monthly Revenue</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          {data.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-500 text-sm">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d7377" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0d7377" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#78716c" />
                <YAxis tick={{ fontSize: 12 }} stroke="#78716c" tickFormatter={(v) => `$${v >= 1000 ? v / 1000 + "k" : v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  labelFormatter={(label) => label}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d7377"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
