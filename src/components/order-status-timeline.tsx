import { Check, Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

type OrderStatusTimelineProps = {
  status: OrderStatus;
};

const timelineSteps = [
  {
    id: "pending_confirmation",
    label: "Request received",
    description: "Your order request reached the marketplace team.",
    icon: Clock3,
  },
  {
    id: "confirmed",
    label: "Confirmed",
    description: "Stock, delivery, and manual payment details are approved.",
    icon: ShieldCheck,
  },
  {
    id: "preparing",
    label: "Preparing order",
    description: "The seller is packing and preparing your items.",
    icon: PackageCheck,
  },
  {
    id: "ready_for_delivery",
    label: "Ready for delivery",
    description: "Your order is packed and queued for final dispatch.",
    icon: Check,
  },
  {
    id: "out_for_delivery",
    label: "Out for delivery",
    description: "The marketplace is coordinating the final handoff.",
    icon: Truck,
  },
  {
    id: "completed",
    label: "Completed",
    description: "Your order has been marked as completed.",
    icon: Check,
  },
] as const;

const statusRank: Record<OrderStatus, number> = {
  pending_confirmation: 0,
  confirmed: 1,
  preparing: 2,
  ready_for_delivery: 3,
  out_for_delivery: 4,
  completed: 5,
  cancelled: 0,
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const activeIndex = statusRank[status];

  return (
    <div className="space-y-3">
      {timelineSteps.map((step, index) => {
        const isCompleted = status !== "cancelled" && index < activeIndex;
        const isCurrent = status !== "cancelled" && index === activeIndex;
        const isPending = status === "cancelled" || index > activeIndex;

        return (
          <div
            key={step.id}
            className={cn(
              "rounded-[1.25rem] border px-4 py-4",
              isCompleted && "border-[rgba(26,123,112,0.2)] bg-[rgba(26,123,112,0.08)]",
              isCurrent && "border-[rgba(228,90,54,0.22)] bg-[rgba(228,90,54,0.08)]",
              isPending && "border-[var(--line)] bg-white",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isCompleted && "bg-[var(--teal)] text-white",
                  isCurrent && "bg-[var(--accent)] text-white",
                  isPending && "bg-[rgba(16,32,25,0.06)] text-[var(--muted)]",
                )}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
