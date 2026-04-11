import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import {
  createVendorApplication,
  getVendorApplications,
} from "@/lib/vendor-applications";

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as "pending" | "approved" | "rejected" | undefined;

  const applications = await getVendorApplications(status ?? undefined);
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const website = typeof body.website === "string" ? body.website.trim() : undefined;

    if (!name || !email || !businessName || !category || !location || !description) {
      return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
    }

    const application = await createVendorApplication({
      name,
      email,
      phone: phone || undefined,
      businessName,
      category,
      location,
      description,
      website: website || undefined,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}
