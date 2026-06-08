import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getPasswordRecoveryRequests } from "@/lib/password-recovery";

export const metadata: Metadata = {
  title: "Password Recovery — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRecoveryPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/recovery" });

  const passwordRecoveryRequests = hasMongoConfig()
    ? await getPasswordRecoveryRequests().catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={KeyRound}
        eyebrow="Account support"
        title="Password recovery"
        description="Recent password recovery requests submitted by shoppers and vendors."
        actions={
          passwordRecoveryRequests.length > 0 ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              {passwordRecoveryRequests.length} recent
            </span>
          ) : null
        }
      />

      <div className="mt-6 soft-card overflow-hidden p-2 sm:p-2">
        <div className="overflow-x-auto rounded-[1rem]">
          {passwordRecoveryRequests.length > 0 ? (
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                  {["Request", "Email", "Contact", "Notes"].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left font-semibold text-[var(--muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {passwordRecoveryRequests.map((request) => (
                  <tr key={request.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-5 py-4 font-semibold">{request.requestId}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{request.email}</p>
                      {request.name ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">{request.name}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">
                      {request.phone || "Not provided"}
                    </td>
                    <td className="max-w-xs px-5 py-4 text-[var(--muted)]">
                      {request.notes || "No notes"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-[var(--muted)]">
              No password recovery requests yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
