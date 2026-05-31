import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getVendorBySlug } from "@/lib/marketplace";
import { updateMongoVendorProfile } from "@/lib/mongodb-vendors";

export async function PUT(request: Request) {
  const authorization = authorizeRequest(request, ["admin", "vendor"]);

  if (!authorization.ok) {
    return authorization.response;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { error: "MongoDB is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      vendorSlug?: string;
      coverImage?: string;
      logoMark?: string;
      headline?: string;
      momoMerchantCode?: string;
      momoBusinessName?: string;
    };

    // Vendors can only edit their own storefront; admins may target any vendor.
    const slug =
      authorization.session.role === "vendor"
        ? authorization.session.vendorSlug
        : body.vendorSlug;

    if (!slug) {
      throw new Error("No vendor was specified.");
    }

    // Seed vendors are defined in code and have no MongoDB record to update.
    if (getVendorBySlug(slug)) {
      throw new Error(
        "This storefront is managed by SuperTech and can't be edited here.",
      );
    }

    const vendor = await updateMongoVendorProfile(slug, {
      coverImage: body.coverImage,
      logoMark: body.logoMark,
      headline: body.headline,
      momoMerchantCode: body.momoMerchantCode,
      momoBusinessName: body.momoBusinessName,
    });

    if (!vendor) {
      throw new Error("Vendor not found.");
    }

    revalidatePath("/");
    revalidatePath("/vendors");
    revalidatePath(`/vendors/${slug}`);
    revalidatePath("/dashboard/vendor");

    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update storefront.",
      },
      { status: 400 },
    );
  }
}
