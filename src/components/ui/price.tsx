import { cn, formatPrice } from "@/lib/utils";

type PriceProps = {
  value: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  layout?: "standard" | "enquiry";
  className?: string;
};

const sizeClasses = {
  sm: { price: "text-base font-semibold", compare: "text-xs" },
  md: { price: "text-2xl font-semibold tracking-[-0.03em]", compare: "text-sm" },
  lg: { price: "text-3xl font-semibold tracking-[-0.04em] sm:text-4xl", compare: "text-base" },
} as const;

export function Price({
  value,
  compareAt,
  size = "md",
  layout = "standard",
  className,
}: PriceProps) {
  const discount =
    compareAt && compareAt > value ? Math.round((1 - value / compareAt) * 100) : null;
  const classes = sizeClasses[size];

  return (
    <div className={cn("flex flex-wrap items-end gap-2", className)}>
      <p className={cn(classes.price, "text-[var(--foreground)]")}>
        {formatPrice(value)}
        {layout === "enquiry" ? (
          <span className="ml-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            asking
          </span>
        ) : null}
      </p>
      {compareAt && compareAt > value ? (
        <p className={cn(classes.compare, "pb-0.5 text-[var(--muted)] line-through")}>
          {formatPrice(compareAt)}
        </p>
      ) : null}
      {discount ? (
        <span className="mb-0.5 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">
          -{discount}%
        </span>
      ) : null}
    </div>
  );
}
