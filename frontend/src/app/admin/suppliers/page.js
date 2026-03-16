"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id) {
      router.replace("/login");
      return;
    }
    fetch(getApiUrl("suppliers"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load suppliers"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleDelete(id, name) {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    fetch(getApiUrl(`suppliers/${id}`), { method: "DELETE", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) setSuppliers((prev) => prev.filter((s) => s.id !== id));
        else res.json().then((d) => alert(d.message || "Cannot delete"));
      });
  }

  if (loading) {
    return <p className="text-stone-500">Loading suppliers...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-900">Suppliers</h1>
        <Link
          href="/admin/suppliers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add supplier
        </Link>
      </div>
      {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">Email</th>
              <th className="px-4 py-3 font-medium text-stone-700">Phone</th>
              <th className="px-4 py-3 font-medium text-stone-700">Address</th>
              <th className="px-4 py-3 font-medium text-stone-700 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  No suppliers yet. Add one to create purchase orders.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-900">{s.name}</td>
                  <td className="px-4 py-3 text-stone-600">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{s.address ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/suppliers/${s.id}/edit`}
                        className="p-1.5 text-stone-500 hover:text-teal-600 rounded"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 text-stone-500 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
