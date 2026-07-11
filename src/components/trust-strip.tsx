import Link from "next/link";
import { Package, ShieldCheck, TrendingUp } from "lucide-react";
import { TRUST_POINTS } from "@/lib/product-rules";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  icon?: "package" | "shield" | "trending";
};

const icons = {
  package: Package,
  shield: ShieldCheck,
  trending: TrendingUp,
} as const;

type TrustStripProps = {
  stats?: readonly Stat[];
  className?: string;
  /** Compact = stats only; full = stats + trust points */
  variant?: "stats" | "full";
};

export function TrustStrip({ stats, className, variant = "stats" }: TrustStripProps) {
  return (
    <div className={cn("soft-card overflow-hidden", className)}>
      {stats && stats.length > 0 ? (
        <div className="grid grid-cols-3 divide-x divide-[var(--line)]">
          {stats.map((stat) => {
            const Icon = stat.icon ? icons[stat.icon] : ShieldCheck;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-2 py-3 sm:flex-row sm:justify-center sm:gap-2.5 sm:px-4 sm:py-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="text-center sm:text-left">
                  <p className="text-base font-bold tracking-[-0.03em] text-[var(--foreground)] sm:text-lg">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {variant === "full" ? (
        <div
          className={cn(
            "grid gap-3 border-t border-[var(--line)] bg-[var(--neutral-50)] px-4 py-3 sm:grid-cols-2 lg:grid-cols-4",
            !stats?.length && "border-t-0",
          )}
        >
          {TRUST_POINTS.map((point) => (
            <div key={point.id} className="min-w-0">
              <p className="text-xs font-bold text-[var(--foreground)]">{point.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{point.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      {variant === "stats" ? (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[var(--line)] bg-[var(--neutral-50)] px-3 py-2 text-[11px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
            Verified sellers
          </span>
          <Link href="/track-order" className="font-semibold hover:text-[var(--accent)]">
            Track order
          </Link>
          <Link href="/request-product" className="font-semibold hover:text-[var(--accent)]">
            Request product
          </Link>
        </div>
      ) : null}
    </div>
  );
}
