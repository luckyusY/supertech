import "server-only";

import { redirect } from "next/navigation";
import { getAccessibleVendorsAsync, requirePageSession } from "@/lib/auth";

/**
 * Shared loader for every page under /dashboard/vendor. Resolves the signed-in
 * seller's accessible vendors and the active store. Admins see all vendors and
 * may switch within the workspace components; vendors are locked to their store.
 */
export async function loadVendorContext(nextPath: string) {
  const session = await requirePageSession({
    roles: ["vendor", "admin"],
    nextPath,
  });
  const availableVendors = await getAccessibleVendorsAsync(session);
  const currentVendor = availableVendors[0];

  if (!currentVendor) {
    redirect("/forbidden");
  }

  return {
    session,
    availableVendors,
    currentVendor,
    initialVendorSlug: currentVendor.slug,
    canSwitchVendor: session.role === "admin",
  };
}
