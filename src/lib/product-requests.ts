import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type ProductRequest = {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  productName: string;
  category: string;
  description: string;
  budget?: string;
  city: string;
  status: "open" | "sourcing" | "found" | "unavailable";
  createdAt: Date;
};

export async function createProductRequest(
  input: Omit<ProductRequest, "_id" | "status" | "createdAt">,
): Promise<ProductRequest> {
  const request: ProductRequest = { ...input, status: "open", createdAt: new Date() };
  if (hasMongoConfig()) {
    try {
      const db = await getDatabase();
      await db.collection<ProductRequest>("product_requests").insertOne(request);
    } catch {
      /* silent */
    }
  }
  return request;
}

export async function getProductRequests(): Promise<ProductRequest[]> {
  if (!hasMongoConfig()) return [];
  try {
    const db = await getDatabase();
    return await db
      .collection<ProductRequest>("product_requests")
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
  } catch {
    return [];
  }
}
