"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, CheckCircle2 } from "lucide-react";

export function SeedSyncButton({ synced }: { synced: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    products: { inserted: number; skipped: number };
    vendors: { inserted: number; skipped: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/seed-sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sync failed");
        return;
      }

      setResult(data);
      router.refresh();
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
          <Database className="h-4 w-4 text-indigo-600" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {synced ? "Static data synced to MongoDB" : "Sync static data to MongoDB"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {synced
              ? "Products and vendors live in the database. Deletes are permanent. Re-sync is safe — it won't restore deleted items."
              : "Push built-in products and vendors into MongoDB so you can delete them permanently."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing…
            </>
          ) : synced ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Re-sync
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Sync now
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">
          <strong>Done.</strong> Products: {result.products.inserted} inserted, {result.products.skipped} skipped.
          Vendors: {result.vendors.inserted} inserted, {result.vendors.skipped} skipped.
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
