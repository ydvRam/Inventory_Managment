"use client";

import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineArchiveBox,
  HiOutlineShoppingCart,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineBanknotes,
} from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineCube,
    title: "Products & pricing",
    text: "Manage products, categories, and set selling and cost prices. Prices auto-fill when creating orders.",
  },
  {
    icon: HiOutlineArchiveBox,
    title: "Inventory",
    text: "Track stock levels and reorder points. See low stock alerts and movement history.",
  },
  {
    icon: HiOutlineShoppingCart,
    title: "Sales & purchase orders",
    text: "Create sales orders for customers and purchase orders from suppliers. Fulfill and track status.",
  },
  {
    icon: HiOutlineDocumentText,
    title: "Invoices & payments",
    text: "Generate invoices from sales orders, record payments, and download PDFs.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Dashboards",
    text: "Admins see revenue, orders, and charts. Users see sales, pending orders, and customers.",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Simple pricing",
    text: "Product price lists with selling and cost prices. Update once, use everywhere on new orders.",
  },
];

const howItWorks = [
  { step: 1, title: "Add Products", text: "Add products and SKU information.", icon: HiOutlinePlusCircle },
  { step: 2, title: "Manage Inventory", text: "Track stock updates in real time.", icon: HiOutlineArchiveBox },
  { step: 3, title: "Create Sales Orders", text: "Generate invoices for customers.", icon: HiOutlineDocumentText },
  { step: 4, title: "Track Payments", text: "Monitor payments and order status.", icon: HiOutlineBanknotes },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* Top bar */}
      <header className=" backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-stone-900">Inventory</span>
          <nav className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
        <p className="text-6xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-4">
          Manage your inventory in one place
        </p>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-10">
          Products, stock, sales and purchase orders, invoices, and dashboards. Simple and clear for small teams.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 bg-white font-medium rounded-lg hover:bg-stone-50 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-15 sm:py-20">
        <h2 className="text-4xl font-semibold text-stone-900 mb-8 text-center">What you can do</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="p-10 bg-white border border-stone-200 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-1.5">{title}</h3>
              <p className="text-sm text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Powerful dashboard */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-3xl font-semibold text-stone-900 mb-8 text-center">Powerful dashboard</h2>
        <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
          <img
            src="/img/dashboard.png"
            alt="Powerful dashboard"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 border-t border-stone-200">
        <h2 className="text-3xl font-semibold text-stone-900 mb-10 text-center">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map(({ step, title, text, icon: Icon }) => (
            <div
              key={step}
              className="relative p-6 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow transition-shadow text-center"
            >
              <span className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center">
                {step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
              <p className="text-sm text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 border-t border-stone-200">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">Ready to Manage Your Inventory?</h2>
          <p className="text-stone-600 mb-6">Start using our system today.</p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-stone-200 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <nav className="flex flex-wrap gap-6 justify-center mb-6">
            <Link href="#about" className="text-sm text-stone-600 hover:text-teal-600 transition-colors">About</Link>
            <Link href="#features" className="text-sm text-stone-600 hover:text-teal-600 transition-colors">Features</Link>
            <Link href="#contact" className="text-sm text-stone-600 hover:text-teal-600 transition-colors">Contact</Link>
            <Link href="#privacy" className="text-sm text-stone-600 hover:text-teal-600 transition-colors">Privacy Policy</Link>
          </nav>
          <div className="border-t border-stone-200 pt-6 text-center">
            <p className="font-semibold text-stone-900">Inventory System</p>
            <p className="text-sm text-stone-500 mt-1">© 2026 My Inventory</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
