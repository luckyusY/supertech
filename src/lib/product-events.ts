import "server-only";

import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";

export type ProductEventRecord = {
  id: string;
  name: string;
  props: Record<string, unknown>;
  path: string | null;
  ts: string | null;
  createdAt: string;
  ua: string | null;
};

export type ProductEventAggregate = {
  name: string;
  count: number;
};

export type ProductEventsSnapshot = {
  configured: boolean;
  total: number;
  last24h: number;
  byName: ProductEventAggregate[];
  recent: ProductEventRecord[];
};

type EventDoc = {
  _id?: { toString(): string };
  name?: string;
  props?: Record<string, unknown>;
  path?: string | null;
  ts?: string | null;
  createdAt?: Date | string;
  ua?: string | null;
};

export async function getProductEventsSnapshot(limit = 40): Promise<ProductEventsSnapshot> {
  if (!hasMongoConfig()) {
    return {
      configured: false,
      total: 0,
      last24h: 0,
      byName: [],
      recent: [],
    };
  }

  try {
    const database = await getDatabase();
    const collection = database.collection<EventDoc>("product_events");
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, last24h, byNameRaw, recentDocs] = await Promise.all([
      collection.estimatedDocumentCount(),
      collection.countDocuments({ createdAt: { $gte: since } }),
      collection
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$name", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ])
        .toArray(),
      collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray(),
    ]);

    return {
      configured: true,
      total,
      last24h,
      byName: byNameRaw.map((row) => ({
        name: row._id || "unknown",
        count: row.count,
      })),
      recent: recentDocs.map((doc) => ({
        id: doc._id?.toString() ?? crypto.randomUUID(),
        name: typeof doc.name === "string" ? doc.name : "unknown",
        props: doc.props && typeof doc.props === "object" ? doc.props : {},
        path: typeof doc.path === "string" ? doc.path : null,
        ts: typeof doc.ts === "string" ? doc.ts : null,
        createdAt:
          doc.createdAt instanceof Date
            ? doc.createdAt.toISOString()
            : typeof doc.createdAt === "string"
              ? doc.createdAt
              : new Date().toISOString(),
        ua: typeof doc.ua === "string" ? doc.ua : null,
      })),
    };
  } catch {
    return {
      configured: true,
      total: 0,
      last24h: 0,
      byName: [],
      recent: [],
    };
  }
}
