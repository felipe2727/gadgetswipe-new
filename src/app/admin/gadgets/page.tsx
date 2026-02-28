"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GadgetRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  price_cents: number | null;
  source_site: string;
  source_url: string;
  content_status: string;
  category_id: string | null;
  created_at: string;
}

type StatusTab = "pending" | "approved" | "rejected";

export default function AdminGadgetsPage() {
  const [tab, setTab] = useState<StatusTab>("pending");
  const [gadgets, setGadgets] = useState<GadgetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState(false);

  const fetchGadgets = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/admin/gadgets?status=${tab}&limit=100`);
      const data = await res.json();
      setGadgets(data.gadgets ?? []);
      setTotal(data.total ?? 0);
    } catch {
      console.error("Failed to fetch gadgets");
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchGadgets();
  }, [fetchGadgets]);

  const updateStatus = async (ids: string[], status: string) => {
    setActing(true);
    try {
      await fetch("/api/admin/gadgets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
      await fetchGadgets();
    } catch {
      console.error("Failed to update");
    }
    setActing(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === gadgets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(gadgets.map((g) => g.id)));
    }
  };

  const formatPrice = (cents: number | null) => {
    if (cents === null) return null;
    return `$${(cents / 100).toFixed(2)}`;
  };

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gadget Review</h1>
            <p className="text-slate-400 text-sm mt-1">
              Approve or reject scraped gadgets before they appear in swipes
            </p>
          </div>
          <a
            href="/admin/dashboard"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Dashboard
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="ml-2 text-xs text-slate-500">({total})</span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm text-slate-300">
              {selected.size} selected
            </span>
            {tab !== "approved" && (
              <button
                onClick={() => updateStatus([...selected], "approved")}
                disabled={acting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {tab !== "rejected" && (
              <button
                onClick={() => updateStatus([...selected], "rejected")}
                disabled={acting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {tab !== "pending" && (
              <button
                onClick={() => updateStatus([...selected], "pending")}
                disabled={acting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50"
              >
                Move to Pending
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading...</div>
        ) : gadgets.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            No {tab} gadgets
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={toggleAll}
                className="text-xs text-slate-400 hover:text-white"
              >
                {selected.size === gadgets.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gadgets.map((gadget) => (
                <div
                  key={gadget.id}
                  className={cn(
                    "relative rounded-xl overflow-hidden border transition-all",
                    selected.has(gadget.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(gadget.id)}
                    className="absolute top-3 left-3 z-10 w-5 h-5 rounded border border-white/30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  >
                    {selected.has(gadget.id) && (
                      <span className="text-primary text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Image */}
                  <div className="relative w-full h-40 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gadget.image_url}
                      alt={gadget.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                      {gadget.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="uppercase tracking-wider">
                        {gadget.source_site}
                      </span>
                      {gadget.price_cents && (
                        <span className="text-primary font-medium">
                          {formatPrice(gadget.price_cents)}
                        </span>
                      )}
                    </div>
                    {gadget.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {gadget.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {tab !== "approved" && (
                        <button
                          onClick={() =>
                            updateStatus([gadget.id], "approved")
                          }
                          disabled={acting}
                          className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/40 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {tab !== "rejected" && (
                        <button
                          onClick={() =>
                            updateStatus([gadget.id], "rejected")
                          }
                          disabled={acting}
                          className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/40 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <a
                        href={gadget.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                      >
                        Link
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
