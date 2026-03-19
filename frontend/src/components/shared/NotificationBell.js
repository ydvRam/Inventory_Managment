"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiOutlineBell, HiOutlineXMark } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders } from "@/lib/auth";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    fetch(getApiUrl("notifications"), { headers: getAuthHeaders() })
      .then((r) => {
        if (!r.ok) {
          setFetchError(r.status === 401 ? "Sign in to see notifications" : "Couldn't load notifications");
          return [];
        }
        return r.json();
      })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((e) => {
        setFetchError("Couldn't load notifications");
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = list.filter((n) => !n.read).length;
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const productBase = isAdmin ? "/admin/products" : "/dashboard/products";
  const invoiceBase = isAdmin ? "/admin/invoices" : "/dashboard/invoices";

  function markRead(id) {
    fetch(getApiUrl(`notifications/${id}/read`), {
      method: "PATCH",
      headers: getAuthHeaders(),
    }).then(() => {
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="group relative p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
      >
        <span className="inline-flex items-center justify-center w-9 h-8 rounded-md shrink-0 bg-emerald-200 text-emerald-800 group-hover:bg-emerald-300 transition-colors">
          <HiOutlineBell className="w-5 h-5" />
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-hidden bg-white border border-stone-200 rounded-xl shadow-lg z-50">
          <div className="px-3 py-2 border-b border-stone-200 flex items-center justify-between">
            <span className="font-semibold text-stone-800">Notifications</span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-stone-100" aria-label="Close">
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <p className="px-3 py-4 text-sm text-stone-500">Loading...</p>
            ) : fetchError ? (
              <p className="px-3 py-4 text-sm text-red-600">{fetchError}</p>
            ) : list.length === 0 ? (
              <p className="px-3 py-4 text-sm text-stone-500">No notifications.</p>
            ) : (
              list.map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2.5 border-b border-stone-100 hover:bg-stone-50 ${!n.read ? "bg-amber-50/50" : ""}`}
                >
                  <p className="text-sm text-stone-800">{n.message}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {n.invoiceId ? (
                      <Link
                        href={`${invoiceBase}/${n.invoiceId}`}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                        onClick={() => { markRead(n.id); setOpen(false); }}
                      >
                        View invoice
                      </Link>
                    ) : n.productId ? (
                      <Link
                        href={`${productBase}/${n.productId}/edit`}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                        onClick={() => { markRead(n.id); setOpen(false); }}
                      >
                        View product
                      </Link>
                    ) : null}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="text-xs text-stone-500 hover:text-stone-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
