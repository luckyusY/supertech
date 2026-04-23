"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type AdminVisibilityButtonProps = {
  visible: boolean;
  onToggle: () => Promise<void>;
};

export function AdminVisibilityButton({
  visible,
  onToggle,
}: AdminVisibilityButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await onToggle();
        })
      }
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        visible
          ? "border-[var(--line)] text-[var(--muted)] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      } disabled:opacity-60`}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : visible ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
      {visible ? "Hide" : "Show"}
    </button>
  );
}
