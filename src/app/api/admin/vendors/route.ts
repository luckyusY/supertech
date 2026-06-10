import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { deleteMongoVendor } from "@/lib/mongodb-vendors";
import { getAdminVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const vendors = await getAdminVendors();
  return NextResponse.json({ vendors });
}

export async function PATCH(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      slug?: string;
      action?: "enable" | "disable" | "delete";
      isSeed?: boolean;
    };

    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Vendor slug is required." }, { status: 400 });
    }

    if (body.action === "enable") {
      await unhideItem("vendor", slug);
    } else if (body.action === "disable") {
      await hideItem("vendor", slug);
    } else if (body.action === "delete") {
      if (body.isSeed) {
        await hideItem("vendor", slug);
      } else {
        await deleteMongoVendor(slug);
      }
    } else {
      return NextResponse.json({ error: "Unsupported vendor action." }, { status: 400 });
    }

    revalidatePath("/dashboard/admin/vendors");
    revalidatePath("/vendors");
    revalidatePath("/");

    const vendors = await getAdminVendors();
    return NextResponse.json({ ok: true, vendors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update vendor." },
      { status: 400 },
    );
  }
}
