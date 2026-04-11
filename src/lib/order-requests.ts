import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getPublicProductBySlug, getPublicVendorBySlug } from "@/lib/public-marketplace";

export type PaymentPreference =
  | "cash_on_delivery"
  | "bank_transfer"
  | "mobile_money"
  | "manual_arrangement";

export type ContactPreference = "phone" | "email" | "whatsapp";

export type CreateOrderRequestLineInput = {
  productSlug: string;
  quantity: number;
};

export type CreateOrderRequestInput = {
  productSlug?: string;
  quantity?: number;
  items?: CreateOrderRequestLineInput[];
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
  requestType: "single_product" | "cart_quote";
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
  unitPrice: number;
  estimatedTotal: number;
  lineItems: {
    productSlug: string;
    productName: string;
    vendorSlug: string;
    vendorName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
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
  requestType: "single_product" | "cart_quote";
  productName: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
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
  const normalizedItems =
    Array.isArray(input.items) && input.items.length > 0
      ? input.items
      : input.productSlug
        ? [{ productSlug: input.productSlug, quantity: Number(input.quantity ?? 1) }]
        : [];

  if (normalizedItems.length === 0) {
    throw new Error("Select at least one product before submitting.");
  }

  const lineItems = await Promise.all(
    normalizedItems.map(async (item) => {
      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error("Quantity must be at least 1.");
      }

      const product = await getPublicProductBySlug(item.productSlug);

      if (!product) {
        throw new Error("Selected product could not be found.");
      }

      const vendor = await getPublicVendorBySlug(product.vendorSlug);

      if (!vendor) {
        throw new Error("Vendor for the selected product could not be found.");
      }

      return {
        productSlug: product.slug,
        productName: product.name,
        vendorSlug: vendor.slug,
        vendorName: vendor.name,
        quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
      };
    }),
  );

  const itemCount = lineItems.length;
  const totalQuantity = lineItems.reduce((total, item) => total + item.quantity, 0);
  const estimatedTotal = lineItems.reduce((total, item) => total + item.lineTotal, 0);
  const uniqueVendors = Array.from(new Set(lineItems.map((item) => item.vendorSlug)));
  const primaryItem = lineItems[0];
  const requestType = itemCount === 1 ? "single_product" : "cart_quote";
  const vendorName =
    uniqueVendors.length === 1
      ? lineItems[0].vendorName
      : `${uniqueVendors.length} vendors`;
  const productName =
    itemCount === 1 ? primaryItem.productName : `${itemCount} items in quote cart`;
  const vendorSlug = uniqueVendors.length === 1 ? lineItems[0].vendorSlug : "multiple-vendors";
  const productSlug = itemCount === 1 ? primaryItem.productSlug : "quote-cart";

  const now = new Date();
  const record: OrderRequestRecord = {
    requestId: generateRequestId(),
    status: "pending_confirmation",
    requestType,
    productSlug,
    productName,
    vendorSlug,
    vendorName,
    quantity: totalQuantity,
    itemCount,
    unitPrice: itemCount === 1 ? primaryItem.unitPrice : 0,
    estimatedTotal,
    lineItems,
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
    itemCount: record.itemCount,
    status: record.status,
  };
}

export async function getRecentOrderRequests(limit = 6): Promise<OrderRequestSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const docs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();

  return docs.map((doc) => ({
    itemCount: doc.itemCount ?? 1,
    id: doc._id?.toString() ?? doc.requestId,
    requestId: doc.requestId,
    status: doc.status,
    requestType: doc.requestType ?? "single_product",
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
