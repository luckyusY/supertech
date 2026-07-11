import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { requirePageSession } from "@/lib/auth";
import { getAdminNavBadges } from "@/lib/dashboard-attention";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin",
  });
  const badges = await getAdminNavBadges();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)] lg:flex-row">
      <AdminNav name={session.name} email={session.email} badges={badges} />
      <div className="min-h-0 min-w-0 flex-1 lg:min-h-dvh" id="main-content">
        {children}
      </div>
    </div>
  );
}
