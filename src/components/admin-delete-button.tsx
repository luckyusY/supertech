"use client";

import { useTransition, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface AdminDeleteButtonProps {
  onDelete: () => Promise<void>;
  label?: string;
}

export function AdminDeleteButton({ onDelete, label = "Delete" }: AdminDeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await onDelete();
      setConfirming(false);
    });
  }

  return (
    <button
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        confirming
          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-[var(--line)] text-[var(--muted)] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      }`}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      {confirming ? "Confirm?" : label}
    </button>
  );
}
