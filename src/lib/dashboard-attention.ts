import "server-only";

import { hasMongoConfig } from "@/lib/integrations";
import { getOrderRequestOperationsSnapshot, getOrderRequests } from "@/lib/order-requests";
import { getProductSubmissions } from "@/lib/product-submissions";
import { getVendorApplications } from "@/lib/vendor-applications";

export type AdminNavBadges = {
  orders: number;
  approvals: number;
  products: number;
};

export type VendorNavBadges = {
  orders: number;
  products: number;
  payments: number; // 1 if payment method missing
};

export async function getAdminNavBadges(): Promise<AdminNavBadges> {
  if (!hasMongoConfig()) {
    return { orders: 0, approvals: 0, products: 0 };
  }

  try {
    const [ops, applications, submissions] = await Promise.all([
      getOrderRequestOperationsSnapshot().catch(() => null),
      getVendorApplications().catch(() => []),
      getProductSubmissions({ status: "pending_review", limit: 100 }).catch(() => []),
    ]);

    return {
      orders: ops?.pendingConfirmation ?? 0,
      approvals: applications.filter((a) => a.status === "pending").length,
      products: submissions.length,
    };
  } catch {
    return { orders: 0, approvals: 0, products: 0 };
  }
}

export async function getVendorNavBadges(input: {
  vendorSlug: string;
  hasPaymentMethod: boolean;
}): Promise<VendorNavBadges> {
  if (!hasMongoConfig()) {
    return {
      orders: 0,
      products: 0,
      payments: input.hasPaymentMethod ? 0 : 1,
    };
  }

  try {
    const [orders, submissions] = await Promise.all([
      getOrderRequests({ vendorSlug: input.vendorSlug, limit: 100 }).catch(() => []),
      getProductSubmissions({
        vendorSlug: input.vendorSlug,
        status: "pending_review",
        limit: 50,
      }).catch(() => []),
    ]);

    const openOrders = orders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled",
    ).length;

    return {
      orders: openOrders,
      products: submissions.length,
      payments: input.hasPaymentMethod ? 0 : 1,
    };
  } catch {
    return {
      orders: 0,
      products: 0,
      payments: input.hasPaymentMethod ? 0 : 1,
    };
  }
}
