import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { createMongoVendor } from "@/lib/mongodb-vendors";
import { createUser, findUserByEmail, promoteToVendor } from "@/lib/users";
import {
  getVendorApplicationById,
  updateVendorApplicationStatus,
} from "@/lib/vendor-applications";
import { DEFAULT_VENDOR_WHATSAPP_NUMBER } from "@/lib/whatsapp";

function generateTempPassword() {
  return "ST-" + crypto.randomBytes(5).toString("hex").toUpperCase();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  try {
    return await reviewApplication(request, await params, auth.session.email);
  } catch (error) {
    // This route previously had no error handling, so a throw anywhere in the
    // vendor/user creation path became an opaque 500 with no body. To the admin
    // that was indistinguishable from the button doing nothing at all.
    console.error("Vendor application review failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to review this vendor application.",
      },
      { status: 500 },
    );
  }
}

async function reviewApplication(
  request: Request,
  { id }: { id: string },
  reviewerEmail: string,
) {
  let body: { status?: string };

  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

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
      whatsappNumber: application.phone ?? DEFAULT_VENDOR_WHATSAPP_NUMBER,
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

    await updateVendorApplicationStatus(id, status, reviewerEmail);

    return NextResponse.json({
      success: true,
      vendorSlug: slug,
      tempPassword, // null if they already had an account
      email: application.email,
    });
  }

  await updateVendorApplicationStatus(id, status, reviewerEmail);
  return NextResponse.json({ success: true });
}
