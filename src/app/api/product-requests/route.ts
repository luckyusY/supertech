import { NextResponse } from "next/server";
import { createProductRequest } from "@/lib/product-requests";

type ProductRequestBody = {
  serviceType?: string;
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
  try {
    const body = (await request.json()) as ProductRequestBody;

    if (!body.productName?.trim() || !body.customerEmail?.trim()) {
      return NextResponse.json({ error: "Product name and email are required." }, { status: 400 });
    }

    const productRequest = await createProductRequest({
      name: body.customerName ?? "",
      email: body.customerEmail ?? "",
      phone: body.customerPhone,
      productName: body.productName ?? "",
      category: body.category ?? body.serviceType ?? "Other",
      description: [
        body.notes,
        body.productUrl ? `Link: ${body.productUrl}` : null,
        body.quantity && body.quantity > 1 ? `Qty: ${body.quantity}` : null,
        body.deliveryAddress ? `Delivery: ${body.deliveryAddress}` : null,
      ]
        .filter(Boolean)
        .join(" | ") || body.productName ?? "",
      budget: body.targetBudget ? `$${body.targetBudget}` : undefined,
      city: body.city ?? "",
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
