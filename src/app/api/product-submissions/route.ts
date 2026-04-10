import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import {
  createProductSubmission,
  getProductSubmissions,
} from "@/lib/product-submissions";

export async function GET(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json({ submissions: [] });
  }

  const { searchParams } = new URL(request.url);
  const vendorSlug = searchParams.get("vendorSlug") ?? undefined;
  const rawStatus = searchParams.get("status") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "12");
  const status =
    rawStatus === "pending_review" || rawStatus === "approved" || rawStatus === "rejected"
      ? rawStatus
      : undefined;

  try {
    const submissions = await getProductSubmissions({
      vendorSlug,
      status,
      limit: Number.isFinite(limit) ? limit : 12,
    });

    return NextResponse.json({
      submissions: submissions.map((submission) => ({
        ...submission,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to load product submissions.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json(
      {
        error: "MongoDB is not configured yet.",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      vendorSlug: string;
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

    const submission = await createProductSubmission(body);

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create product submission.",
      },
      { status: 400 },
    );
  }
}
