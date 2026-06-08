import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { VendorNav } from "@/components/vendor-nav";
import { getAccessibleVendorsAsync, requirePageSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const session = await requirePageSession({
    roles: ["vendor", "admin"],
    nextPath: "/dashboard/vendor",
  });
  const availableVendors = await getAccessibleVendorsAsync(session);
  const currentVendor = availableVendors[0];

  if (!currentVendor) {
    redirect("/forbidden");
  }

  const subtitle = session.role === "admin" ? "Admin access" : session.email;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] lg:flex-row">
      <VendorNav storeName={currentVendor.name} subtitle={subtitle} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
