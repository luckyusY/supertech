import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import { createOrderRequest, getRecentOrderRequests } from "@/lib/order-requests";

export async function GET(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json({ orders: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "6");

  try {
    const orders = await getRecentOrderRequests(Number.isFinite(limit) ? limit : 6);

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to load order requests.",
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
      productSlug?: string;
      quantity?: number;
      items?: {
        productSlug: string;
        quantity: number;
      }[];
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      city: string;
      deliveryAddress: string;
      contactPreference: "phone" | "email" | "whatsapp";
      paymentPreference:
        | "cash_on_delivery"
        | "bank_transfer"
        | "mobile_money"
        | "manual_arrangement";
      notes?: string;
    };

    const orderRequest = await createOrderRequest(body);

    revalidatePath("/dashboard/admin");

    return NextResponse.json(orderRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create order request.",
      },
      { status: 400 },
    );
  }
}
