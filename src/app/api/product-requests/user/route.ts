import { NextResponse } from "next/server";
import { createProductRequest } from "@/lib/product-requests";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, productName, category, description, budget, city } =
      body as Record<string, string>;

    if (!name || !email || !productName || !category || !description || !city) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const req = await createProductRequest({
      name,
      email,
      phone,
      productName,
      category,
      description,
      budget,
      city,
    });

    return NextResponse.json({ success: true, requestId: req._id?.toString() ?? "local" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed." },
      { status: 500 },
    );
  }
}
