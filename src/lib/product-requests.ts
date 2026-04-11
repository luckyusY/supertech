import "server-only";

import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export type ProductRequestServiceType =
  | "source_and_ship"
  | "price_check"
  | "business_bulk";

export type ProductRequestStatus =
  | "received"
  | "reviewing"
  | "quoted"
  | "sourcing"
  | "shipped"
  | "completed";

export type ProductRequestRecord = {
  _id?: ObjectId;
  requestId: string;
  serviceType: ProductRequestServiceType;
  status: ProductRequestStatus;
  productName: string;
  category: string;
  quantity: number;
  targetBudget?: number;
  productUrl?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductRequestSummary = {
  id: string;
  requestId: string;
  serviceType: ProductRequestServiceType;
  status: ProductRequestStatus;
  productName: string;
  category: string;
  quantity: number;
  targetBudget?: number;
  productUrl?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductRequestInput = {
  serviceType: ProductRequestServiceType;
  productName: string;
  category: string;
  quantity: number;
  targetBudget?: number;
  productUrl?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress?: string;
  notes?: string;
};

const PRODUCT_REQUEST_COLLECTION = "product_requests";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateRequestId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `PRQ-${datePart}-${randomPart}`;
}

function toSummary(record: ProductRequestRecord): ProductRequestSummary {
  return {
    id: record._id?.toString() ?? record.requestId,
    requestId: record.requestId,
    serviceType: record.serviceType,
    status: record.status,
    productName: record.productName,
    category: record.category,
    quantity: record.quantity,
    targetBudget: record.targetBudget,
    productUrl: record.productUrl,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    customerPhone: record.customerPhone,
    city: record.city,
    deliveryAddress: record.deliveryAddress,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createProductRequest(input: CreateProductRequestInput) {
  const productName = input.productName.trim();
  const category = input.category.trim();
  const quantity = Number(input.quantity);
  const customerName = input.customerName.trim();
  const customerEmail = normalizeEmail(input.customerEmail);
  const customerPhone = input.customerPhone.trim();
  const city = input.city.trim();
  const deliveryAddress = input.deliveryAddress?.trim() ?? "";
  const notes = input.notes?.trim() ?? "";
  const productUrl = input.productUrl?.trim() ?? undefined;
  const targetBudget =
    input.targetBudget && Number.isFinite(Number(input.targetBudget))
      ? Number(input.targetBudget)
      : undefined;

  if (!productName) {
    throw new Error("Tell us which product you want.");
  }

  if (!customerName || !customerEmail || !customerPhone) {
    throw new Error("Name, email, and phone are required.");
  }

  if (!city) {
    throw new Error("Please tell us which city the shipment should reach.");
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  if (
    input.serviceType !== "source_and_ship" &&
    input.serviceType !== "price_check" &&
    input.serviceType !== "business_bulk"
  ) {
    throw new Error("Select a valid request type.");
  }

  const now = new Date();
  const record: ProductRequestRecord = {
    requestId: generateRequestId(),
    serviceType: input.serviceType,
    status: "received",
    productName,
    category,
    quantity,
    targetBudget: targetBudget && targetBudget > 0 ? targetBudget : undefined,
    productUrl,
    customerName,
    customerEmail,
    customerPhone,
    city,
    deliveryAddress,
    notes,
    createdAt: now,
    updatedAt: now,
  };

  const database = await getDatabase();
  const collection = database.collection<ProductRequestRecord>(PRODUCT_REQUEST_COLLECTION);
  const result = await collection.insertOne(record);

  return {
    ...toSummary(record),
    id: result.insertedId.toString(),
  };
}

export async function getProductRequestsByCustomerEmail({
  customerEmail,
  limit = 8,
}: {
  customerEmail: string;
  limit?: number;
}) {
  const database = await getDatabase();
  const collection = database.collection<ProductRequestRecord>(PRODUCT_REQUEST_COLLECTION);
  const docs = await collection
    .find({
      customerEmail: normalizeEmail(customerEmail),
    })
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(limit, 20)))
    .toArray();

  return docs.map((doc) => toSummary(doc));
}
