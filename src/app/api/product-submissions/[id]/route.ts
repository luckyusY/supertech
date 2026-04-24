import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import {
  updateProductSubmissionDetails,
  updateProductSubmissionStatus,
} from "@/lib/product-submissions";

type ProductSubmissionDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: ProductSubmissionDetailRouteProps,
) {
  const authorization = authorizeRequest(request, ["admin"]);

  if (!authorization.ok) {
    return authorization.response;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      {
        error: "MongoDB is not configured yet.",
      },
      { status: 503 },
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status: "pending_review" | "approved" | "rejected";
    };

    if (
      body.status !== "pending_review" &&
      body.status !== "approved" &&
      body.status !== "rejected"
    ) {
      throw new Error("Invalid submission status.");
    }

    const submission = await updateProductSubmissionStatus(id, body.status);

    return NextResponse.json({
      ...submission,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product submission.",
      },
      { status: 400 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: ProductSubmissionDetailRouteProps,
) {
  const authorization = authorizeRequest(request, ["admin", "vendor"]);

  if (!authorization.ok) {
    return authorization.response;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      {
        error: "MongoDB is not configured yet.",
      },
      { status: 503 },
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name: string;
      category: string;
      price: number;
      compareAt?: number;
      badge: string;
      stockLabel: string;
      shipWindow: string;
      description: string;
      features: string[];
      heroImage: string;
      gallery: string[];
    };
    const vendorSlug =
      authorization.session.role === "vendor"
        ? authorization.session.vendorSlug
        : undefined;
    const submission = await updateProductSubmissionDetails(id, body, {
      vendorSlug,
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/dashboard/vendor");
    revalidatePath("/dashboard/admin/products");
    revalidatePath(`/products/${submission.slug}`);

    return NextResponse.json({
      ...submission,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update product submission.",
      },
      { status: 400 },
    );
  }
}
