import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getPublicProductBySlug, getPublicVendorBySlug } from "@/lib/public-marketplace";

export type PaymentPreference =
  | "cash_on_delivery"
  | "bank_transfer"
  | "mobile_money"
  | "manual_arrangement";

export type ContactPreference = "phone" | "email" | "whatsapp";

export type OrderRequestStatus =
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type OrderRequestLineItem = {
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export const orderRequestStatuses: OrderRequestStatus[] = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "out_for_delivery",
  "completed",
  "cancelled",
];

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
  status: OrderRequestStatus;
  requestType: "single_product" | "cart_quote";
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
  unitPrice: number;
  estimatedTotal: number;
  lineItems: OrderRequestLineItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  contactPreference: ContactPreference;
  paymentPreference: PaymentPreference;
  notes: string;
  internalNote?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderRequestSummary = {
  id: string;
  requestId: string;
  status: OrderRequestStatus;
  requestType: "single_product" | "cart_quote";
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
  estimatedTotal: number;
  lineItems: OrderRequestLineItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  paymentPreference: PaymentPreference;
  contactPreference: ContactPreference;
  notes: string;
  internalNote: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderRequestOperationsSnapshot = {
  totalOrders: number;
  pendingConfirmation: number;
  activeFulfillment: number;
  completedOrders: number;
  estimatedRevenue: number;
  sharedCartOrders: number;
};

export type PublicOrderTrackingSummary = {
  requestId: string;
  status: OrderRequestStatus;
  requestType: "single_product" | "cart_quote";
  productName: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
  estimatedTotal: number;
  lineItems: {
    productName: string;
    vendorName: string;
    quantity: number;
    lineTotal: number;
  }[];
  customerName: string;
  customerEmail: string;
  city: string;
  paymentPreference: PaymentPreference;
  contactPreference: ContactPreference;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
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

export function isOrderRequestStatus(value: string): value is OrderRequestStatus {
  return orderRequestStatuses.includes(value as OrderRequestStatus);
}

export function formatOrderRequestStatus(status: OrderRequestStatus) {
  return status.replaceAll("_", " ");
}

export function getOrderTrackingStatusMessage(status: OrderRequestStatus) {
  switch (status) {
    case "pending_confirmation":
      return "We received your request and the team is reviewing stock, delivery, and payment details.";
    case "confirmed":
      return "Your request has been confirmed and the order is now scheduled for fulfillment.";
    case "preparing":
      return "The seller is preparing your items and organizing them for handoff.";
    case "ready_for_delivery":
      return "Your order is packed and ready for delivery coordination.";
    case "out_for_delivery":
      return "Your order is on the way or in final delivery coordination.";
    case "completed":
      return "This order has been marked as completed.";
    case "cancelled":
      return "This order was cancelled. Contact support if you need to restart it.";
    default:
      return "Your order is in progress.";
  }
}

function normalizeOrderRequestStatus(status?: string): OrderRequestStatus {
  return status && isOrderRequestStatus(status) ? status : "pending_confirmation";
}

function buildFallbackLineItems(record: Partial<OrderRequestRecord>) {
  if (Array.isArray(record.lineItems) && record.lineItems.length > 0) {
    return record.lineItems;
  }

  if (!record.productSlug || !record.productName || !record.vendorSlug || !record.vendorName) {
    return [] as OrderRequestLineItem[];
  }

  return [
    {
      productSlug: record.productSlug,
      productName: record.productName,
      vendorSlug: record.vendorSlug,
      vendorName: record.vendorName,
      quantity: record.quantity ?? 1,
      unitPrice: record.unitPrice ?? record.estimatedTotal ?? 0,
      lineTotal: record.estimatedTotal ?? record.unitPrice ?? 0,
    },
  ] satisfies OrderRequestLineItem[];
}

function toSummary(record: OrderRequestRecord): OrderRequestSummary {
  const lineItems = buildFallbackLineItems(record);

  return {
    id: record._id?.toString() ?? record.requestId,
    requestId: record.requestId,
    status: normalizeOrderRequestStatus(record.status),
    requestType: record.requestType ?? "single_product",
    productSlug: record.productSlug,
    productName: record.productName,
    vendorSlug: record.vendorSlug,
    vendorName: record.vendorName,
    quantity: record.quantity ?? 1,
    itemCount: record.itemCount ?? (lineItems.length || 1),
    estimatedTotal: record.estimatedTotal,
    lineItems,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    customerPhone: record.customerPhone,
    city: record.city,
    deliveryAddress: record.deliveryAddress,
    paymentPreference: record.paymentPreference,
    contactPreference: record.contactPreference,
    notes: record.notes ?? "",
    internalNote: record.internalNote ?? "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt ?? record.createdAt,
  };
}

function toPublicTrackingSummary(record: OrderRequestSummary): PublicOrderTrackingSummary {
  return {
    requestId: record.requestId,
    status: record.status,
    requestType: record.requestType,
    productName: record.productName,
    vendorName: record.vendorName,
    quantity: record.quantity,
    itemCount: record.itemCount,
    estimatedTotal: record.estimatedTotal,
    lineItems: record.lineItems.map((item) => ({
      productName: item.productName,
      vendorName: item.vendorName,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    city: record.city,
    paymentPreference: record.paymentPreference,
    contactPreference: record.contactPreference,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
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

export async function getOrderRequests({
  limit = 6,
  vendorSlug,
  status,
  requestId,
}: {
  limit?: number;
  vendorSlug?: string;
  status?: OrderRequestStatus;
  requestId?: string;
}): Promise<OrderRequestSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const query: Record<string, unknown> = {};

  if (requestId) {
    query.requestId = requestId.trim().toUpperCase();
  }

  if (status) {
    query.status = status;
  }

  if (vendorSlug) {
    query.$or = [{ vendorSlug }, { "lineItems.vendorSlug": vendorSlug }];
  }

  const docs = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(limit, 50)))
    .toArray();

  return docs.map((doc) => toSummary(doc));
}

export async function getRecentOrderRequests(limit = 6): Promise<OrderRequestSummary[]> {
  return getOrderRequests({ limit });
}

export async function getPublicOrderTracking({
  requestId,
  customerEmail,
}: {
  requestId: string;
  customerEmail: string;
}) {
  const normalizedRequestId = requestId.trim().toUpperCase();
  const normalizedEmail = customerEmail.trim().toLowerCase();

  if (!normalizedRequestId || !normalizedEmail) {
    throw new Error("Request ID and email are required.");
  }

  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const record = await collection.findOne({
    requestId: normalizedRequestId,
    customerEmail: normalizedEmail,
  });

  if (!record) {
    return null;
  }

  return toPublicTrackingSummary(toSummary(record));
}

export async function getOrderRequestOperationsSnapshot(): Promise<OrderRequestOperationsSnapshot> {
  const orders = await getOrderRequests({ limit: 50 });
  const activeStatuses: OrderRequestStatus[] = [
    "confirmed",
    "preparing",
    "ready_for_delivery",
    "out_for_delivery",
  ];

  return {
    totalOrders: orders.length,
    pendingConfirmation: orders.filter((order) => order.status === "pending_confirmation").length,
    activeFulfillment: orders.filter((order) => activeStatuses.includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === "completed").length,
    estimatedRevenue: orders
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => total + order.estimatedTotal, 0),
    sharedCartOrders: orders.filter((order) => order.itemCount > 1).length,
  };
}

export async function updateOrderRequest(
  id: string,
  input: {
    status?: OrderRequestStatus;
    internalNote?: string;
  },
) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid order request id.");
  }

  const updateFields: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.status) {
    updateFields.status = input.status;
  }

  if (typeof input.internalNote === "string") {
    updateFields.internalNote = input.internalNote.trim();
  }

  if (Object.keys(updateFields).length === 1) {
    throw new Error("No order updates were provided.");
  }

  const database = await getDatabase();
  const collection = database.collection<OrderRequestRecord>(ORDER_REQUEST_COLLECTION);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: updateFields,
    },
    { returnDocument: "after" },
  );

  if (!result) {
    throw new Error("Order request not found.");
  }

  return toSummary(result);
}
