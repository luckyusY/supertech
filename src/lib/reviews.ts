import "server-only";

import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export type Review = {
  _id?: ObjectId;
  reviewId: string;
  productSlug: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1–5
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  productSlug: string;
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

function generateId() {
  return `RVW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function seedReviews(): Review[] {
  const seeds: Omit<Review, "_id" | "reviewId" | "createdAt">[] = [
    {
      productSlug: "aurora-smart-hub",
      customerName: "Arielle N.",
      customerEmail: "arielle@example.com",
      rating: 5,
      title: "Exactly what I needed",
      body: "Setup was painless and it works flawlessly with my existing devices. Highly recommend.",
      verified: true,
    },
    {
      productSlug: "aurora-smart-hub",
      customerName: "Marcus T.",
      customerEmail: "marcus@example.com",
      rating: 4,
      title: "Great hub, minor app issues",
      body: "Hardware is solid. The app sometimes lags but the hub itself is rock-solid.",
      verified: true,
    },
    {
      productSlug: "signal-noise-buds",
      customerName: "Josue K.",
      customerEmail: "josue@example.com",
      rating: 5,
      title: "Best budget buds I've owned",
      body: "Low-latency mode is a game changer for gaming. Battery lasts longer than advertised.",
      verified: true,
    },
    {
      productSlug: "signal-noise-buds",
      customerName: "Nadine M.",
      customerEmail: "nadine@example.com",
      rating: 4,
      title: "Solid earbuds",
      body: "Good sound, comfortable fit. The case feels a bit plasticky but works fine.",
      verified: false,
    },
    {
      productSlug: "pixel-monitor-arm",
      customerName: "Carlos E.",
      customerEmail: "carlos@example.com",
      rating: 5,
      title: "Perfect desk upgrade",
      body: "Cable routing is immaculate. Tension adjustment took 2 minutes. Desk looks clean.",
      verified: true,
    },
    {
      productSlug: "orbit-controller-stand",
      customerName: "Sophie B.",
      customerEmail: "sophie@example.com",
      rating: 4,
      title: "Nice display piece",
      body: "Looks great on the desk. The USB-C passthrough is a nice touch.",
      verified: true,
    },
  ];

  const now = Date.now();
  return seeds.map((s, i) => ({
    ...s,
    reviewId: generateId(),
    createdAt: new Date(now - i * 86_400_000 * 3).toISOString(),
  }));
}

async function getCollection() {
  const db = await getDatabase();
  return db.collection<Review>("reviews");
}

async function ensureSeeded() {
  const col = await getCollection();
  const count = await col.countDocuments();
  if (count === 0) await col.insertMany(seedReviews());
}

export async function getProductReviews(productSlug: string): Promise<Review[]> {
  await ensureSeeded();
  const col = await getCollection();
  return col
    .find({ productSlug }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
}

export async function getReviewSummary(productSlug: string): Promise<ReviewSummary> {
  await ensureSeeded();
  const col = await getCollection();
  const reviews = await col.find({ productSlug }).toArray();

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] ?? 0) + 1;
    total += r.rating;
  }

  return {
    productSlug,
    averageRating: reviews.length > 0 ? Math.round((total / reviews.length) * 10) / 10 : 0,
    totalReviews: reviews.length,
    distribution: dist as Record<1 | 2 | 3 | 4 | 5, number>,
  };
}

export async function submitReview(
  data: Omit<Review, "_id" | "reviewId" | "verified" | "createdAt">,
): Promise<string> {
  const col = await getCollection();
  const reviewId = generateId();
  await col.insertOne({
    ...data,
    reviewId,
    verified: false,
    createdAt: new Date().toISOString(),
  });
  return reviewId;
}
