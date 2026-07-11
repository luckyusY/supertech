import { Check, Clock3, PackageCheck, ShieldCheck, Truck, XCircle } from "lucide-react";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  type OrderRequestStatus,
} from "@/lib/product-rules";
import { cn } from "@/lib/utils";

type OrderStatusTimelineProps = {
  status: OrderRequestStatus;
};

type FlowStatus = (typeof ORDER_STATUS_FLOW)[number];

const stepIcons: Record<FlowStatus, typeof Clock3> = {
  pending_confirmation: Clock3,
  confirmed: ShieldCheck,
  preparing: PackageCheck,
  ready_for_delivery: Check,
  out_for_delivery: Truck,
  completed: Check,
};

const statusRank: Record<OrderRequestStatus, number> = {
  pending_confirmation: 0,
  confirmed: 1,
  preparing: 2,
  ready_for_delivery: 3,
  out_for_delivery: 4,
  completed: 5,
  cancelled: -1,
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-4"
        role="status"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--danger)]">
            <XCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-[var(--danger)]">
              {ORDER_STATUS_META.cancelled.label}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {ORDER_STATUS_META.cancelled.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = statusRank[status];

  return (
    <ol className="space-y-3" aria-label="Order status timeline">
      {ORDER_STATUS_FLOW.map((stepId, index) => {
        const meta = ORDER_STATUS_META[stepId];
        const Icon = stepIcons[stepId];
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isPending = index > activeIndex;

        return (
          <li
            key={stepId}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "rounded-[var(--radius-lg)] border px-4 py-4",
              isCurrent && "border-[var(--accent)] bg-[var(--accent-soft)]",
              isCompleted && "border-[var(--success)]/20 bg-[var(--success-soft)]",
              isPending && "border-[var(--line)] bg-[var(--surface)]",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isCurrent && "bg-[var(--accent)] text-white",
                  isCompleted && "bg-[var(--success)] text-white",
                  isPending && "bg-[var(--neutral-100)] text-[var(--muted)]",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold",
                    isPending ? "text-[var(--muted)]" : "text-[var(--foreground)]",
                  )}
                >
                  {meta.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{meta.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
