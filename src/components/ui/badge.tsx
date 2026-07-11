import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--neutral-100)] text-[var(--foreground)] border-[var(--line)]",
  brand: "bg-[var(--accent-soft)] text-[var(--accent)] border-[rgba(245,131,12,0.22)]",
  success: "bg-[var(--success-soft)] text-[var(--success)] border-[rgba(12,140,90,0.18)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-[rgba(180,120,12,0.2)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[rgba(240,68,56,0.2)]",
  info: "bg-[var(--info-soft)] text-[var(--info)] border-[rgba(28,84,104,0.18)]",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
