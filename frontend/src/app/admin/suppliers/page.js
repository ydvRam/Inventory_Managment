"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { getApiUrl, getAuthHeaders, getStoredUser } from "@/lib/auth";

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSuppliers = useCallback(() => {
    return fetch(getApiUrl("suppliers"), { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setErr("Failed to load suppliers"));
  }, [router]);

  useEffect(() => {
    loadSuppliers().finally(() => setLoading(false));
  }, [loadSuppliers]);

  function resetForm() {
    setFormErr("");
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
  }

  function handleDelete(id) {
    if (!id) return;
    fetch(getApiUrl(`suppliers/${id}`), { method: "DELETE", headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401 || res.status === 403) router.replace("/login");
        else if (res.ok) setSuppliers((prev) => prev.filter((s) => s.id !== id));
        else {
          return res
            .json()
            .catch(() => ({}))
            .then((d) => setErr(d.message || "Cannot delete supplier"));
        }
      });
  }

  async function onCreateSupplier(e) {
    e.preventDefault();
    setFormErr("");
    if (!getStoredUser()?.id) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("suppliers"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) router.replace("/login");
      else if (!res.ok) throw new Error(data.message || "Failed to create");
      else {
        await loadSuppliers();
        resetForm();
      }
    } catch (e) {
      setFormErr(e.message || "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-stone-500">Loading suppliers...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900 mb-6">Suppliers</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: all suppliers */}
        <div className="flex-1 min-w-0 w-full">
          {err && <p className="text-sm text-red-600 mb-4">{err}</p>}
          <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
            <table className="w-full text-center text-sm min-w-[600px]">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-2 py-3 font-medium text-stone-700">Name</th>
                  <th className="px-2 py-3 font-medium text-stone-700">Email</th>
                  <th className="px-2 py-3 font-medium text-stone-700">Phone</th>
                  <th className="px-2 py-3 font-medium text-stone-700">Address</th>
                  <th className="px-2 py-3 font-medium text-stone-700 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                      No suppliers yet. Add one using the form beside this table.
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
                            onClick={() => {
                              setSelectedId(s.id);
                              setSelectedName(s.name);
                              setShowConfirm(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 rounded"
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

        {/* Right: add supplier (always visible) */}
        <aside className="w-full lg:w-[500px] shrink-0 border border-stone-200 rounded-xl bg-white p-5 lg:sticky lg:top-4">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Add supplier</h2>
          <form onSubmit={onCreateSupplier} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            {formErr && <p className="text-sm text-red-600">{formErr}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Create supplier"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
              >
                Clear
              </button>
            </div>
          </form>
        </aside>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Delete supplier</h2>
            <p className="text-sm text-stone-600 mb-6">
              Are you sure you want to delete supplier &quot;{selectedName}&quot;?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedId(null);
                  setSelectedName("");
                }}
                className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(selectedId);
                  setShowConfirm(false);
                  setSelectedId(null);
                  setSelectedName("");
                }}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
