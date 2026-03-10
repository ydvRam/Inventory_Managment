"use client";

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

// Placeholder data – replace with API data later
const salesData = [
  { week: "Week 1", sales: 2400 },
  { week: "Week 2", sales: 1398 },
  { week: "Week 3", sales: 3800 },
  { week: "Week 4", sales: 2900 },
  { week: "Week 5", sales: 3200 },
];

const purchaseVsSalesData = [
  { month: "Jan", purchase: 4000, sales: 5400 },
  { month: "Feb", purchase: 3000, sales: 4200 },
  { month: "Mar", purchase: 5000, sales: 4800 },
  { month: "Apr", purchase: 4500, sales: 6100 },
  { month: "May", purchase: 5200, sales: 5500 },
  { month: "Jun", purchase: 4800, sales: 5900 },
];

const monthlyRevenueData = [
  { month: "Jan", revenue: 5400 },
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 5500 },
  { month: "Jun", revenue: 5900 },
];

export function SalesChart() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Sales</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#78716c" />
              <YAxis tick={{ fontSize: 12 }} stroke="#78716c" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                formatter={(value) => [`${value}`, "Sales"]}
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
        </div>
      </div>
    </div>
  );
}

export function PurchaseVsSalesChart() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Purchase vs Sales</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={purchaseVsSalesData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#78716c" />
              <YAxis tick={{ fontSize: 12 }} stroke="#78716c" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                formatter={(value) => [`$${value}`, ""]}
              />
              <Legend />
              <Bar dataKey="purchase" fill="#94a3b8" name="Purchase" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" fill="#0d7377" name="Sales" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function MonthlyRevenueChart() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Monthly Revenue</h3>
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyRevenueData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffc400" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0055ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#78716c" />
              <YAxis tick={{ fontSize: 12 }} stroke="#78716c" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                formatter={(value) => [`$${value}`, "Revenue"]}
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
        </div>
      </div>
    </div>
  );
}
