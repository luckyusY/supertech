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
  | "review_received";

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
};

const KIND_LABELS: Record<NotificationKind, string> = {
  order_received: "New order received",
  order_confirmed: "Order confirmed",
  order_shipped: "Order shipped",
  product_approved: "Product approved",
  product_rejected: "Product needs changes",
  payout_scheduled: "Payout scheduled",
  payout_sent: "Payout sent",
  review_received: "New review",
};

function generateId() {
  return `NTF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function seedNotifications(): Notification[] {
  const now = new Date();
  const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

  return [
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
      title: KIND_LABELS.product_approved,
      body: "Pixel Creator Dock is now live in the catalog.",
      read: true,
      createdAt: ago(5),
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
  vendorSlug?: string,
): Promise<Notification[]> {
  await ensureSeeded();
  const col = await getCollection();
  const filter =
    role === "vendor" && vendorSlug
      ? { recipientRole: role, recipientSlug: vendorSlug }
      : { recipientRole: role };

  return col
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
}

export async function markRead(notificationId: string): Promise<boolean> {
  const col = await getCollection();
  const result = await col.updateOne({ notificationId }, { $set: { read: true } });
  return result.modifiedCount > 0;
}

export async function markAllRead(
  role: "admin" | "vendor" | "customer",
  vendorSlug?: string,
): Promise<void> {
  const col = await getCollection();
  const filter =
    role === "vendor" && vendorSlug
      ? { recipientRole: role, recipientSlug: vendorSlug }
      : { recipientRole: role };
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
