"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl, getAuthHeaders, getStoredUser, isAdmin } from "@/lib/auth";

export default function AdminPricingPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [err, setErr] = useState("");
  const [tierProductId, setTierProductId] = useState("");
  const [tierMinQty, setTierMinQty] = useState(5);
  const [tierPct, setTierPct] = useState(5);
  const [tierLabel, setTierLabel] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("percent");
  const [couponValue, setCouponValue] = useState(10);
  const [couponLabel, setCouponLabel] = useState("");

  const h = getAuthHeaders();

  function load() {
    fetch(getApiUrl("products"), { headers: h })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProducts(Array.isArray(d) ? d : []));
    fetch(getApiUrl("pricing/discount-tiers"), { headers: h })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTiers(Array.isArray(d) ? d : []));
    fetch(getApiUrl("pricing/coupons"), { headers: h })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCoupons(Array.isArray(d) ? d : []));
  }

  useEffect(() => {
    const u = getStoredUser();
    if (!u?.id) {
      router.replace("/login");
      return;
    }
    if (!isAdmin(u)) router.replace("/dashboard");
    load();
  }, [router]);

  function addTier(e) {
    e.preventDefault();
    setErr("");
    if (!tierProductId) {
      setErr("Select a product for the tier");
      return;
    }
    fetch(getApiUrl("pricing/discount-tiers"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({
        productId: tierProductId,
        minQuantity: Number(tierMinQty) || 1,
        discountPercent: Number(tierPct) || 0,
        label: tierLabel || undefined,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.message || "Failed"); });
        load();
      })
      .catch((e) => setErr(e.message));
  }

  function delTier(id) {
    if (!confirm("Delete this tier?")) return;
    fetch(getApiUrl(`pricing/discount-tiers/${id}`), { method: "DELETE", headers: h }).then(load);
  }

  function addCoupon(e) {
    e.preventDefault();
    setErr("");
    if (!couponCode.trim()) {
      setErr("Enter coupon code");
      return;
    }
    fetch(getApiUrl("pricing/coupons"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({
        code: couponCode.trim(),
        discountType: couponType,
        discountValue: Number(couponValue) || 0,
        label: couponLabel || undefined,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.message || "Failed"); });
        setCouponCode("");
        load();
      })
      .catch((e) => setErr(e.message));
  }

  function delCoupon(id) {
    if (!confirm("Delete coupon?")) return;
    fetch(getApiUrl(`pricing/coupons/${id}`), { method: "DELETE", headers: h }).then(load);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Pricing &amp; discounts</h1>
      <p className="text-sm text-stone-500 mb-6">
        Set bulk tiers per product and coupons for the whole cart. Sales orders use product <strong>selling price</strong> as base, then tier, then coupon.
      </p>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}

      <section className="mb-10 p-5 bg-white border border-stone-200 rounded-xl">
        <h2 className="font-semibold text-stone-900 mb-3">Bulk discount tiers</h2>
        <p className="text-sm text-stone-600 mb-4">
          Example: min qty <strong>10</strong> and <strong>5%</strong> off means 5% off unit price when line quantity is 10 or more. If several tiers match, the one with the <strong>highest min quantity</strong> wins.
        </p>
        <form onSubmit={addTier} className="flex flex-wrap gap-2 items-end mb-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Product</label>
            <select
              value={tierProductId}
              onChange={(e) => setTierProductId(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="">Select</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Min qty</label>
            <input type="number" min={1} value={tierMinQty} onChange={(e) => setTierMinQty(e.target.value)} className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Discount %</label>
            <input type="number" min={0} max={100} value={tierPct} onChange={(e) => setTierPct(e.target.value)} className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Label (optional)</label>
            <input value={tierLabel} onChange={(e) => setTierLabel(e.target.value)} placeholder="e.g. Wholesale" className="w-40 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Add tier</button>
        </form>
        <ul className="text-sm space-y-2">
          {tiers.length === 0 && <li className="text-stone-500">No tiers yet.</li>}
          {tiers.map((t) => (
            <li key={t.id} className="flex justify-between items-center border-b border-stone-100 py-2">
              <span>
                Product <code className="text-xs bg-stone-100 px-1">{t.productId.slice(0, 8)}…</code> — qty ≥ {t.minQuantity} → {t.discountPercent}% off
                {t.label && <span className="text-stone-500"> ({t.label})</span>}
              </span>
              <button type="button" onClick={() => delTier(t.id)} className="text-red-600 text-xs">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="p-5 bg-white border border-stone-200 rounded-xl">
        <h2 className="font-semibold text-stone-900 mb-3">Coupons</h2>
        <p className="text-sm text-stone-600 mb-4">
          Coupon applies to the <strong>order subtotal</strong> after bulk tiers.
        </p>
        <form onSubmit={addCoupon} className="flex flex-wrap gap-2 items-end mb-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Code</label>
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="SAVE10" className="w-28 border border-stone-300 rounded-lg px-3 py-2 text-sm uppercase" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Type</label>
            <select value={couponType} onChange={(e) => setCouponType(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed ₹ off</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Value</label>
            <input type="number" min={0} value={couponValue} onChange={(e) => setCouponValue(e.target.value)} className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Label</label>
            <input value={couponLabel} onChange={(e) => setCouponLabel(e.target.value)} placeholder="e.g. New customer" className="w-36 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Add coupon</button>
        </form>
        <ul className="text-sm space-y-2">
          {coupons.length === 0 && <li className="text-stone-500">No coupons yet.</li>}
          {coupons.map((c) => (
            <li key={c.id} className="flex justify-between items-center border-b border-stone-100 py-2">
              <span>
                <strong>{c.code}</strong> — {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                {c.label && <span className="text-stone-500"> ({c.label})</span>}
                {!c.isActive && <span className="text-amber-600 ml-2">inactive</span>}
              </span>
              <button type="button" onClick={() => delCoupon(c.id)} className="text-red-600 text-xs">Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
