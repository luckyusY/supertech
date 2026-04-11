import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { createMongoVendor } from "@/lib/mongodb-vendors";
import { promoteToVendor } from "@/lib/users";
import {
  getVendorApplicationById,
  updateVendorApplicationStatus,
} from "@/lib/vendor-applications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const status = body.status;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Status must be approved or rejected." }, { status: 400 });
  }

  const application = await getVendorApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
  }

  if (status === "approved") {
    // Create vendor profile in MongoDB
    const { slug } = await createMongoVendor({
      businessName: application.businessName,
      email: application.email,
      location: application.location,
      category: application.category,
      description: application.description,
    });

    // Promote user account to vendor (if they have a MongoDB account)
    await promoteToVendor(application.email, slug);
  }

  await updateVendorApplicationStatus(id, status, auth.session.email);

  return NextResponse.json({ success: true });
}
