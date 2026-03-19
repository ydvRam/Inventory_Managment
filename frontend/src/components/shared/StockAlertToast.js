"use client";

import { usePathname } from "next/navigation";
import { useStockAlerts } from "@/contexts/SocketContext";
import { HiOutlineXMark } from "react-icons/hi2";
import Link from "next/link";

export default function StockAlertToast() {
  const pathname = usePathname();
  const { alerts, dismissAlert } = useStockAlerts();
  const productBase = pathname?.startsWith("/admin") ? "/admin/products" : "/dashboard/products";

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-14 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-md"
        >
          <span className="text-2xl" aria-hidden>
            🔔
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">Low stock</p>
            <p className="text-sm text-amber-800 mt-0.5">{alert.message}</p>
            <Link
              href={`${productBase}/${alert.productId}/edit`}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 mt-1 inline-block"
            >
              View product →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => dismissAlert(alert.id)}
            className="p-1 text-amber-600 hover:text-amber-800 rounded"
            aria-label="Dismiss"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
