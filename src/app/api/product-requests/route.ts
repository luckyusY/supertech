import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import {
  createProductRequest,
  type ProductRequestServiceType,
} from "@/lib/product-requests";

type ProductRequestBody = {
  serviceType?: ProductRequestServiceType;
  productName?: string;
  category?: string;
  quantity?: number;
  targetBudget?: number;
  productUrl?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  deliveryAddress?: string;
  notes?: string;
};

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
    const body = (await request.json()) as ProductRequestBody;

    const productRequest = await createProductRequest({
      serviceType: body.serviceType ?? "source_and_ship",
      productName: body.productName ?? "",
      category: body.category ?? "",
      quantity: Number(body.quantity ?? 1),
      targetBudget: body.targetBudget,
      productUrl: body.productUrl,
      customerName: body.customerName ?? "",
      customerEmail: body.customerEmail ?? "",
      customerPhone: body.customerPhone ?? "",
      city: body.city ?? "",
      deliveryAddress: body.deliveryAddress,
      notes: body.notes,
    });

    return NextResponse.json(productRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save your product request.",
      },
      { status: 400 },
    );
  }
}
