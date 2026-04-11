import { cn } from "@/lib/utils";

type OrderStatusBadgeProps = {
  status:
    | "pending_confirmation"
    | "confirmed"
    | "preparing"
    | "ready_for_delivery"
    | "out_for_delivery"
    | "completed"
    | "cancelled";
};

const statusClasses: Record<OrderStatusBadgeProps["status"], string> = {
  pending_confirmation: "bg-[rgba(242,191,99,0.18)] text-[#9c6b0b]",
  confirmed: "bg-[rgba(26,123,112,0.12)] text-[var(--teal)]",
  preparing: "bg-[rgba(16,32,25,0.06)] text-[var(--foreground)]",
  ready_for_delivery: "bg-[rgba(26,123,112,0.1)] text-[var(--teal)]",
  out_for_delivery: "bg-[rgba(228,90,54,0.12)] text-[var(--accent)]",
  completed: "bg-[rgba(26,123,112,0.16)] text-[var(--teal)]",
  cancelled: "bg-[rgba(228,90,54,0.14)] text-[var(--accent)]",
};

function formatStatus(status: OrderStatusBadgeProps["status"]) {
  return status.replaceAll("_", " ");
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        statusClasses[status],
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
