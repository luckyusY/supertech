import "server-only";

import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export type NotificationKind =
  | "order_received"
  | "order_confirmed"
  | "order_shipped"
  | "product_approved"
  | "product_rejected"
  | "payout_scheduled"
  | "payout_sent"
  | "review_received"
  | "system";

export type Notification = {
  _id?: ObjectId;
  notificationId: string;
  recipientRole: "admin" | "vendor" | "customer";
  recipientSlug?: string; // vendorSlug or customer email
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  refId?: string; // linked order/product/payout ID
  imageUrl?: string;
};

export const KIND_LABELS: Record<NotificationKind, string> = {
  order_received: "New order received",
  order_confirmed: "Order confirmed",
  order_shipped: "Order shipped",
  product_approved: "Product approved",
  product_rejected: "Product needs changes",
  payout_scheduled: "Payout scheduled",
  payout_sent: "Payout sent",
  review_received: "New review",
  system: "SuperTech update",
};

function generateId() {
  return `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function seedNotifications(): Notification[] {
  const now = new Date();
  const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

  return [
    // —— Admin
    {
      notificationId: generateId(),
      recipientRole: "admin",
      kind: "order_received",
      title: KIND_LABELS.order_received,
      body: "ORD-1083 from Arielle N. — Aurora Smart Hub × 1",
      read: false,
      createdAt: ago(1),
      refId: "ORD-1083",
    },
    {
      notificationId: generateId(),
      recipientRole: "admin",
      kind: "product_approved",
      title: "Product pending review",
      body: "A vendor submitted a new listing for moderation.",
      read: false,
      createdAt: ago(3),
    },
    {
      notificationId: generateId(),
      recipientRole: "admin",
      kind: "payout_scheduled",
      title: KIND_LABELS.payout_scheduled,
      body: "Aurora Labs payout of $1,230 scheduled for end of month.",
      read: false,
      createdAt: ago(8),
    },
    {
      notificationId: generateId(),
      recipientRole: "admin",
      kind: "system",
      title: "Vendor applications",
      body: "Review pending seller applications from Become a vendor.",
      read: true,
      createdAt: ago(12),
    },
    // —— Vendors (slug-scoped)
    {
      notificationId: generateId(),
      recipientRole: "vendor",
      recipientSlug: "aurora-labs",
      kind: "order_received",
      title: KIND_LABELS.order_received,
      body: "New order ORD-1083 — Aurora Smart Hub × 1 from Arielle N.",
      read: false,
      createdAt: ago(1),
      refId: "ORD-1083",
    },
    {
      notificationId: generateId(),
      recipientRole: "vendor",
      recipientSlug: "aurora-labs",
      kind: "payout_sent",
      title: KIND_LABELS.payout_sent,
      body: "Your March payout of $2,180 has been sent.",
      read: true,
      createdAt: ago(48),
    },
    {
      notificationId: generateId(),
      recipientRole: "vendor",
      recipientSlug: "signal-mobile",
      kind: "product_approved",
      title: KIND_LABELS.product_approved,
      body: "Signal Magnetic Charger has been approved and is now live.",
      read: false,
      createdAt: ago(3),
    },
    {
      notificationId: generateId(),
      recipientRole: "vendor",
      recipientSlug: "pixel-foundry",
      kind: "review_received",
      title: KIND_LABELS.review_received,
      body: "Pixel Monitor Arm received a 5-star review.",
      read: false,
      createdAt: ago(2),
    },
    // —— Customers (email-scoped demo + generic tips without slug)
    {
      notificationId: generateId(),
      recipientRole: "customer",
      recipientSlug: "customer@supertech.local",
      kind: "order_confirmed",
      title: "We received your request",
      body: "Your order request is with SuperTech — vendors will contact you soon.",
      read: false,
      createdAt: ago(2),
    },
    {
      notificationId: generateId(),
      recipientRole: "customer",
      kind: "system",
      title: "Tip: Save products",
      body: "Tap the heart on any card to save items for later.",
      read: false,
      createdAt: ago(6),
    },
  ];
}

async function getCollection() {
  const db = await getDatabase();
  return db.collection<Notification>("notifications");
}

async function ensureSeeded() {
  const col = await getCollection();
  const count = await col.countDocuments();
  if (count === 0) await col.insertMany(seedNotifications());
}

export async function getNotifications(
  role: "admin" | "vendor" | "customer",
  options?: { vendorSlug?: string; customerEmail?: string },
): Promise<Notification[]> {
  await ensureSeeded();
  const col = await getCollection();

  let filter: Record<string, unknown>;
  if (role === "vendor" && options?.vendorSlug) {
    // Only this vendor's store alerts
    filter = { recipientRole: "vendor", recipientSlug: options.vendorSlug };
  } else if (role === "customer") {
    const email = options?.customerEmail?.trim().toLowerCase();
    // Personal + broadcast customer tips (no recipientSlug)
    filter = email
      ? {
          recipientRole: "customer",
          $or: [
            { recipientSlug: email },
            { recipientSlug: { $exists: false } },
            { recipientSlug: null },
            { recipientSlug: "" },
          ],
        }
      : { recipientRole: "customer", $or: [{ recipientSlug: { $exists: false } }, { recipientSlug: null }, { recipientSlug: "" }] };
  } else {
    // Admin: platform-wide admin inbox
    filter = { recipientRole: "admin" };
  }

  return col
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(40)
    .toArray();
}

export async function markRead(notificationId: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.updateOne({ notificationId }, { $set: { read: true } });
  return result.modifiedCount > 0 || result.matchedCount > 0;
}

export async function markAllRead(
  role: "admin" | "vendor" | "customer",
  options?: { vendorSlug?: string; customerEmail?: string },
): Promise<void> {
  const col = await getCollection();
  let filter: Record<string, unknown>;
  if (role === "vendor" && options?.vendorSlug) {
    filter = { recipientRole: "vendor", recipientSlug: options.vendorSlug };
  } else if (role === "customer") {
    const email = options?.customerEmail?.trim().toLowerCase();
    filter = email
      ? {
          recipientRole: "customer",
          $or: [
            { recipientSlug: email },
            { recipientSlug: { $exists: false } },
            { recipientSlug: null },
            { recipientSlug: "" },
          ],
        }
      : { recipientRole: "customer" };
  } else {
    filter = { recipientRole: "admin" };
  }
  await col.updateMany(filter, { $set: { read: true } });
}

export async function createNotification(
  data: Omit<Notification, "_id" | "notificationId" | "read" | "createdAt">,
): Promise<string> {
  const col = await getCollection();
  const notificationId = generateId();
  await col.insertOne({
    ...data,
    notificationId,
    read: false,
    createdAt: new Date().toISOString(),
  });
  return notificationId;
}

/** Fire admin + each vendor + customer alerts when a quote/order is placed. */
export async function notifyOrderCreated(input: {
  requestId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  vendorSlugs: string[];
  itemCount: number;
}): Promise<void> {
  const { requestId, productName, customerName, customerEmail, vendorSlugs, itemCount } = input;
  const summary =
    itemCount > 1
      ? `${itemCount} items — ${productName}`
      : productName;

  try {
    await createNotification({
      recipientRole: "admin",
      kind: "order_received",
      title: KIND_LABELS.order_received,
      body: `${requestId} from ${customerName} — ${summary}`,
      refId: requestId,
    });

    const uniqueVendors = Array.from(new Set(vendorSlugs.filter(Boolean)));
    await Promise.all(
      uniqueVendors.map((slug) =>
        createNotification({
          recipientRole: "vendor",
          recipientSlug: slug,
          kind: "order_received",
          title: KIND_LABELS.order_received,
          body: `New request ${requestId} — ${summary} from ${customerName}.`,
          refId: requestId,
        }),
      ),
    );

    if (customerEmail) {
      await createNotification({
        recipientRole: "customer",
        recipientSlug: customerEmail.trim().toLowerCase(),
        kind: "order_confirmed",
        title: "We received your request",
        body: `${requestId}: ${summary}. A vendor will contact you to confirm delivery.`,
        refId: requestId,
      });
    }
  } catch {
    // Never block checkout if notification write fails
  }
}

export async function notifyProductModeration(input: {
  vendorSlug: string;
  productName: string;
  approved: boolean;
  refId?: string;
}): Promise<void> {
  try {
    await createNotification({
      recipientRole: "vendor",
      recipientSlug: input.vendorSlug,
      kind: input.approved ? "product_approved" : "product_rejected",
      title: input.approved ? KIND_LABELS.product_approved : KIND_LABELS.product_rejected,
      body: input.approved
        ? `${input.productName} is approved and live in the catalog.`
        : `${input.productName} needs changes before it can go live.`,
      refId: input.refId,
    });
    await createNotification({
      recipientRole: "admin",
      kind: input.approved ? "product_approved" : "product_rejected",
      title: input.approved ? "Product approved" : "Product rejected",
      body: `${input.productName} (${input.vendorSlug}) was ${input.approved ? "approved" : "rejected"}.`,
      refId: input.refId,
    });
  } catch {
    // ignore
  }
}

export async function notifyOrderStatusForCustomer(input: {
  customerEmail: string;
  requestId: string;
  status: string;
  productName: string;
}): Promise<void> {
  try {
    const shipped =
      input.status === "out_for_delivery" ||
      input.status === "ready_for_delivery" ||
      input.status === "completed";
    const kind: NotificationKind = shipped ? "order_shipped" : "order_confirmed";
    await createNotification({
      recipientRole: "customer",
      recipientSlug: input.customerEmail.trim().toLowerCase(),
      kind,
      title: shipped ? KIND_LABELS.order_shipped : "Order update",
      body: `${input.requestId} (${input.productName}) is now ${input.status.replaceAll("_", " ")}.`,
      refId: input.requestId,
    });
  } catch {
    // ignore
  }
}
