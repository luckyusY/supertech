"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteMongoVendor, updateMongoVendorProfile } from "@/lib/mongodb-vendors";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { getAdminVendorBySlug } from "@/lib/public-marketplace";
import { upsertVendorOverride } from "@/lib/vendor-overrides";

export async function deleteVendorAction(slug: string, isSeed: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  if (isSeed) {
    await hideItem("vendor", slug);
  } else {
    await deleteMongoVendor(slug);
  }
  revalidatePath("/dashboard/admin/vendors");
  revalidatePath(`/dashboard/admin/vendors/${slug}`);
  revalidatePath("/vendors");
  revalidatePath("/");
}

export async function toggleVendorAction(slug: string, currentlyDisabled: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  if (currentlyDisabled) {
    await unhideItem("vendor", slug);
  } else {
    await hideItem("vendor", slug);
  }
  revalidatePath("/dashboard/admin/vendors");
  revalidatePath(`/dashboard/admin/vendors/${slug}`);
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${slug}`);
  revalidatePath("/");
}

export type AdminVendorUpdateInput = {
  name: string;
  headline: string;
  location: string;
  whatsappNumber: string;
  categories: string;
  responseTime: string;
  coverImage: string;
  logoMark: string;
  accent: string;
  momoMerchantCode: string;
  momoBusinessName: string;
};

export async function updateAdminVendorAction(slug: string, input: AdminVendorUpdateInput) {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: `/dashboard/admin/vendors/${slug}`,
  });

  const current = await getAdminVendorBySlug(slug);
  if (!current) {
    throw new Error("Vendor not found.");
  }

  const categories = input.categories
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const payload = {
    name: input.name,
    headline: input.headline,
    location: input.location,
    whatsappNumber: input.whatsappNumber,
    categories,
    responseTime: input.responseTime,
    coverImage: input.coverImage,
    logoMark: input.logoMark,
    accent: input.accent,
    momoMerchantCode: input.momoMerchantCode,
    momoBusinessName: input.momoBusinessName,
    updatedBy: session.email,
  };

  if (current.isSeed) {
    await upsertVendorOverride(slug, payload);
  } else {
    const updated = await updateMongoVendorProfile(slug, payload);
    if (!updated) {
      throw new Error("Unable to update vendor.");
    }
  }

  revalidatePath("/dashboard/admin/vendors");
  revalidatePath(`/dashboard/admin/vendors/${slug}`);
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${slug}`);
  revalidatePath("/");

  return { ok: true as const };
}
