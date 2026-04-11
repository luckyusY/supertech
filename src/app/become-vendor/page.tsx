import type { Metadata } from "next";
import { BecomeVendorForm } from "@/components/become-vendor-form";
import { getAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Become a Vendor",
  description: "Apply to sell your tech products on SuperTech Marketplace.",
};

export const dynamic = "force-dynamic";

export default async function BecomeVendorPage() {
  const session = await getAuthSession();

  return (
    <BecomeVendorForm
      prefill={
        session
          ? { name: session.name, email: session.email }
          : undefined
      }
    />
  );
}
