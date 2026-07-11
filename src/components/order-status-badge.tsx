import { StatusPill } from "@/components/ui/status-pill";
import type { OrderRequestStatus } from "@/lib/product-rules";

type OrderStatusBadgeProps = {
  status: OrderRequestStatus;
};

/** @deprecated Prefer StatusPill — kept for existing imports. */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <StatusPill status={status} />;
}
