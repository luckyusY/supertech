import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { createMongoVendor } from "@/lib/mongodb-vendors";
import { createUser, findUserByEmail, promoteToVendor } from "@/lib/users";
import {
  getVendorApplicationById,
  updateVendorApplicationStatus,
} from "@/lib/vendor-applications";

function generateTempPassword() {
  return "ST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
}

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

    // Check if this person has a user account
    const existingUser = await findUserByEmail(application.email);

    let tempPassword: string | null = null;

    if (existingUser) {
      // Promote existing account to vendor
      await promoteToVendor(application.email, slug);
    } else {
      // No account yet — create one with a temporary password
      tempPassword = generateTempPassword();
      await createUser({
        email: application.email,
        password: tempPassword,
        name: application.name,
        role: "vendor",
        vendorSlug: slug,
      });
    }

    await updateVendorApplicationStatus(id, status, auth.session.email);

    return NextResponse.json({
      success: true,
      vendorSlug: slug,
      tempPassword, // null if they already had an account
      email: application.email,
    });
  }

  await updateVendorApplicationStatus(id, status, auth.session.email);
  return NextResponse.json({ success: true });
}
