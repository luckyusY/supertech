import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getProductBySlug, getVendorBySlug } from "@/lib/marketplace";

export type PaymentPreference =
  | "cash_on_delivery"
  | "bank_transfer"
  | "mobile_money"
  | "manual_arrangement";

export type ContactPreference = "phone" | "email" | "whatsapp";

export type CreateOrderRequestInput = {
  productSlug: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  contactPreference: ContactPreference;
  paymentPreference: PaymentPreference;
  notes?: string;
};

export type OrderRequestRecord = {
  _id?: ObjectId;
  requestId: string;
  status: "pending_confirmation";
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  estimatedTotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  contactPreference: ContactPreference;
  paymentPreference: PaymentPreference;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderRequestSummary = {
  id: string;
  requestId: string;
  status: string;
  productName: string;
  vendorName: string;
  quantity: number;
  estimatedTotal: number;
  customerName: string;
  city: string;
  paymentPreference: PaymentPreference;
  contactPreference: ContactPreference;
  createdAt: Date;
};

const ORDER_REQUEST_COLLECTION = "order_requests";

function generateRequestId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `ORQ-${datePart}-${randomPart}`;
}

export async function createOrderRequest(input: CreateOrderRequestInput) {
  const product = getProductBySlug(input.productSlug);

  if (!product) {
    throw new Error("Selected product could not be found.");
  }

  const vendor = getVendorBySlug(product.vendorSlug);

  if (!vendor) {
    throw new Error("Vendor for the selected product could not be found.");
  }

  const quantity = Number(input.quantity);

  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const now = new Date();
  const record: OrderRequestRecord = {
    requestId: generateRequestId(),
    status: "pending_confirmation",
    productSlug: product.slug,
    productName: product.name,
    vendorSlug: vendor.slug,
    vendorName: vendor.name,
    quantity,
    unitPrice: product.price,
    estimatedTotal: product.price * quantity,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone.trim(),
    city: input.city.trim(),
    deliveryAddress: input.deliveryAddress.trim(),
    contactPreference: input.contactPreference,
    paymentPreference: input.paymentPreference,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  if (!record.customerName || !record.customerEmail || !record.customerPhone) {
    throw new Error("Name, email, and phone are required.");
  }

  if (!record.city || !record.deliveryAddress) {
    throw new Error("City and delivery address are required.");
  }

  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const result = await collection.insertOne(record);

  return {
    id: result.insertedId.toString(),
    requestId: record.requestId,
    productName: record.productName,
    vendorName: record.vendorName,
    estimatedTotal: record.estimatedTotal,
    status: record.status,
  };
}

export async function getRecentOrderRequests(limit = 6): Promise<OrderRequestSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const docs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();

  return docs.map((doc) => ({
    id: doc._id?.toString() ?? doc.requestId,
    requestId: doc.requestId,
    status: doc.status,
    productName: doc.productName,
    vendorName: doc.vendorName,
    quantity: doc.quantity,
    estimatedTotal: doc.estimatedTotal,
    customerName: doc.customerName,
    city: doc.city,
    paymentPreference: doc.paymentPreference,
    contactPreference: doc.contactPreference,
    createdAt: doc.createdAt,
  }));
}
