import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import {
  getOrderTrackingStatusMessage,
  getPublicOrderTracking,
} from "@/lib/order-requests";

export async function GET(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json(
      {
        error: "MongoDB is not configured yet.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId") ?? "";
  const customerEmail = searchParams.get("email") ?? "";

  if (!requestId.trim() || !customerEmail.trim()) {
    return NextResponse.json(
      {
        error: "Request ID and email are required.",
      },
      { status: 400 },
    );
  }

  try {
    const order = await getPublicOrderTracking({
      requestId,
      customerEmail,
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "We could not find a matching order for that request ID and email.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...order,
      statusMessage: getOrderTrackingStatusMessage(order.status),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load order tracking details.",
      },
      { status: 400 },
    );
  }
}
