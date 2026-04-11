import "server-only";

import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { vendors } from "@/lib/marketplace";

export type PayoutStatus = "pending" | "processing" | "paid" | "on_hold";

export type VendorPayout = {
  _id?: ObjectId;
  payoutId: string;
  vendorSlug: string;
  vendorName: string;
  period: string;
  grossSales: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  status: PayoutStatus;
  orderCount: number;
  scheduledDate: string;
  paidAt?: string;
  createdAt: string;
};

export type PayoutSummary = {
  vendorSlug: string;
  vendorName: string;
  totalPaid: number;
  totalPending: number;
  commissionRate: number;
  lastPayout?: string;
  nextPayout?: string;
};

const COMMISSION_RATE = 0.08; // 8% marketplace commission

function generatePayoutId() {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function seedPayouts(): VendorPayout[] {
  const now = new Date();
  const seed: VendorPayout[] = [];

  for (const vendor of vendors) {
    const gross1 = Math.round(800 + Math.random() * 4000);
    const gross2 = Math.round(600 + Math.random() * 3000);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    seed.push({
      payoutId: generatePayoutId(),
      vendorSlug: vendor.slug,
      vendorName: vendor.name,
      period: prevMonth.toISOString().slice(0, 7),
      grossSales: gross1,
      commissionRate: COMMISSION_RATE,
      commissionAmount: Math.round(gross1 * COMMISSION_RATE),
      netPayout: Math.round(gross1 * (1 - COMMISSION_RATE)),
      status: "paid",
      orderCount: Math.round(8 + Math.random() * 20),
      scheduledDate: new Date(now.getFullYear(), now.getMonth() - 1, 28).toISOString(),
      paidAt: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 25).toISOString(),
    });

    seed.push({
      payoutId: generatePayoutId(),
      vendorSlug: vendor.slug,
      vendorName: vendor.name,
      period: currMonth.toISOString().slice(0, 7),
      grossSales: gross2,
      commissionRate: COMMISSION_RATE,
      commissionAmount: Math.round(gross2 * COMMISSION_RATE),
      netPayout: Math.round(gross2 * (1 - COMMISSION_RATE)),
      status: "pending",
      orderCount: Math.round(5 + Math.random() * 15),
      scheduledDate: new Date(now.getFullYear(), now.getMonth(), 28).toISOString(),
      createdAt: currMonth.toISOString(),
    });
  }

  return seed;
}

async function getCollection() {
  const db = await getDatabase();
  return db.collection<VendorPayout>("payouts");
}

export async function ensurePayoutsSeeded() {
  const col = await getCollection();
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany(seedPayouts());
  }
}

export async function getVendorPayouts(vendorSlug: string): Promise<VendorPayout[]> {
  await ensurePayoutsSeeded();
  const col = await getCollection();
  return col
    .find({ vendorSlug }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(12)
    .toArray();
}

export async function getAllPayoutSummaries(): Promise<PayoutSummary[]> {
  await ensurePayoutsSeeded();
  const col = await getCollection();

  const summaries: PayoutSummary[] = [];

  for (const vendor of vendors) {
    const payouts = await col
      .find({ vendorSlug: vendor.slug }, { projection: { _id: 0 } })
      .toArray();

    const paid = payouts.filter((p) => p.status === "paid");
    const pending = payouts.filter((p) => p.status === "pending" || p.status === "processing");

    summaries.push({
      vendorSlug: vendor.slug,
      vendorName: vendor.name,
      totalPaid: paid.reduce((s: number, p: VendorPayout) => s + p.netPayout, 0),
      totalPending: pending.reduce((s: number, p: VendorPayout) => s + p.netPayout, 0),
      commissionRate: COMMISSION_RATE,
      lastPayout: paid.at(-1)?.paidAt,
      nextPayout: pending.at(0)?.scheduledDate,
    });
  }

  return summaries;
}

export async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
): Promise<boolean> {
  const col = await getCollection();
  const update: Partial<VendorPayout> = { status };
  if (status === "paid") update.paidAt = new Date().toISOString();
  const result = await col.updateOne({ payoutId }, { $set: update });
  return result.modifiedCount > 0;
}
