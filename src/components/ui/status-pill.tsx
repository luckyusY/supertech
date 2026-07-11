import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_META,
  type OrderRequestStatus,
  type StatusTone,
} from "@/lib/product-rules";

const toneClasses: Record<StatusTone, string> = {
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
  neutral: "bg-[var(--neutral-100)] text-[var(--foreground)]",
  brand: "bg-[var(--accent-soft)] text-[var(--accent)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

type StatusPillProps = {
  status: OrderRequestStatus;
  className?: string;
  /** Override label; defaults to product-rules shopper label. */
  label?: string;
};

export function StatusPill({ status, className, label }: StatusPillProps) {
  const meta = ORDER_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[meta.tone],
        className,
      )}
    >
      {label ?? meta.label}
    </span>
  );
}
