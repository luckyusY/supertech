import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import {
  isOrderRequestStatus,
  updateOrderRequest,
} from "@/lib/order-requests";

type OrderRequestDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: OrderRequestDetailRouteProps,
) {
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
      status?: string;
      internalNote?: string;
    };
    const status = body.status;
    const nextStatus = status && isOrderRequestStatus(status) ? status : undefined;

    if (status && !nextStatus) {
      throw new Error("Invalid order status.");
    }

    const order = await updateOrderRequest(id, {
      status: nextStatus,
      internalNote: body.internalNote,
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/vendor");

    return NextResponse.json({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update order request.",
      },
      { status: 400 },
    );
  }
}
