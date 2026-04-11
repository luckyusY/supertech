import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import { getProductReviews, getReviewSummary, submitReview } from "@/lib/reviews";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");

  if (!productSlug) {
    return NextResponse.json({ error: "productSlug is required." }, { status: 400 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ reviews: [], summary: null });
  }

  try {
    const [reviews, summary] = await Promise.all([
      getProductReviews(productSlug),
      getReviewSummary(productSlug),
    ]);
    return NextResponse.json({ reviews, summary });
  } catch {
    return NextResponse.json({ error: "Unable to load reviews." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "Reviews require MongoDB." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      productSlug?: string;
      customerName?: string;
      customerEmail?: string;
      rating?: number;
      title?: string;
      body?: string;
    };

    const { productSlug, customerName, customerEmail, rating, title, body: reviewBody } = body;

    if (!productSlug || !customerName || !customerEmail || !rating || !title || !reviewBody) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const reviewId = await submitReview({
      productSlug,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
    });

    return NextResponse.json({ reviewId });
  } catch {
    return NextResponse.json({ error: "Unable to submit review." }, { status: 500 });
  }
}
