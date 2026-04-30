"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createCategoryAction } from "@/app/dashboard/admin/categories/actions";

export function AdminAddCategoryForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createCategoryAction(name);
      if (result?.error) {
        setError(result.error);
      } else {
        setName("");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
      >
        <Plus className="h-4 w-4" />
        Add category
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category name"
        className="rounded-[0.75rem] border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Save
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setName(""); setError(""); }}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-2 text-sm font-medium"
      >
        <X className="h-3.5 w-3.5" />
        Cancel
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
