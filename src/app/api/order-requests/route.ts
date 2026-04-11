import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import {
  createOrderRequest,
  getOrderRequests,
  isOrderRequestStatus,
} from "@/lib/order-requests";

export async function GET(request: Request) {
  const authorization = authorizeRequest(request, ["admin", "vendor"]);

  if (!authorization.ok) {
    return authorization.response;
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ orders: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "6");
  const vendorSlug =
    authorization.session.role === "vendor"
      ? authorization.session.vendorSlug
      : searchParams.get("vendorSlug") ?? undefined;
  const requestId = searchParams.get("requestId") ?? undefined;
  const statusParam = searchParams.get("status");

  try {
    const orders = await getOrderRequests({
      limit: Number.isFinite(limit) ? limit : 6,
      vendorSlug,
      requestId,
      status: statusParam && isOrderRequestStatus(statusParam) ? statusParam : undefined,
    });

    return NextResponse.json({
      orders: orders.map((order) => {
        const serializedOrder = {
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        };

        if (authorization.session.role === "admin") {
          return serializedOrder;
        }

        return {
          ...serializedOrder,
          customerEmail: "",
          deliveryAddress: "",
          internalNote: "",
        };
      }),
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
    revalidatePath("/dashboard/vendor");

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
