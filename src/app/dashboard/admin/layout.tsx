import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { requirePageSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin",
  });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] lg:flex-row">
      <AdminNav name={session.name} email={session.email} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
