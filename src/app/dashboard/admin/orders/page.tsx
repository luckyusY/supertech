import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { AdminOrderOperations } from "@/components/admin-order-operations";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Order Management — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/orders" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={ShoppingBag}
        eyebrow="Operations"
        title="Order management"
        description="Confirm payments, move orders through fulfillment, and keep buyers updated."
      />
      <div className="mt-6 soft-card p-6 sm:p-8">
        <AdminOrderOperations />
      </div>
    </div>
  );
}
