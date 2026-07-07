import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { slugify } from "@/lib/utils";

export type BlogRecord = {
  _id?: ObjectId;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  body: string;
  keywords: string[];
  hashtags: string[];
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  category: string;
  price: number;
  heroImage: string;
  gallery: string[];
  authorEmail: string;
  authorRole: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogSummary = Omit<BlogRecord, "_id"> & { id: string };

export type BlogActivitySummary = {
  total: number;
  today: number;
  last7Days: number;
  daily: {
    date: string;
    count: number;
  }[];
};

export type CreateBlogInput = {
  slug?: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  body: string;
  keywords?: string[];
  hashtags?: string[];
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  category: string;
  price: number;
  heroImage: string;
  gallery?: string[];
  authorEmail: string;
  authorRole: string;
};

const BLOG_COLLECTION = "blogs";

function toSummary(record: BlogRecord): BlogSummary {
  const { _id, ...rest } = record;
  return { id: _id?.toString() ?? record.slug, ...rest };
}

function cleanList(value: string[] | undefined, max: number) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).replace(/^#/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

async function ensureUniqueSlug(base: string) {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const root = slugify(base) || `blog-${Date.now()}`;
  let candidate = root;
  let counter = 2;

  // Append -2, -3, ... until the slug is free.
  while (await collection.findOne({ slug: candidate }, { projection: { _id: 1 } })) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function createBlog(input: CreateBlogInput): Promise<BlogSummary> {
  const title = input.title.trim();
  const body = input.body.trim();

  if (!title || !body) {
    throw new Error("Title and body are required to publish.");
  }

  const slug = await ensureUniqueSlug(input.slug || title);
  const now = new Date();

  const record: BlogRecord = {
    slug,
    title,
    metaTitle: (input.metaTitle || title).trim().slice(0, 70),
    metaDescription: (input.metaDescription || input.excerpt || "").trim().slice(0, 180),
    excerpt: (input.excerpt || "").trim().slice(0, 320),
    body,
    keywords: cleanList(input.keywords, 12),
    hashtags: cleanList(input.hashtags, 8),
    productSlug: input.productSlug,
    productName: input.productName,
    vendorSlug: input.vendorSlug,
    vendorName: input.vendorName,
    category: input.category,
    price: input.price,
    heroImage: input.heroImage,
    gallery: Array.isArray(input.gallery) ? input.gallery.filter(Boolean).slice(0, 8) : [],
    authorEmail: input.authorEmail,
    authorRole: input.authorRole,
    createdAt: now,
    updatedAt: now,
  };

  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const result = await collection.insertOne(record);

  return toSummary({ ...record, _id: result.insertedId });
}

export async function getPublishedBlogs(limit = 50): Promise<BlogSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const docs = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(toSummary);
}

export async function getBlogBySlug(slug: string): Promise<BlogSummary | null> {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const doc = await collection.findOne({ slug });
  return doc ? toSummary(doc) : null;
}

export async function getRelatedBlogs(
  currentSlug: string,
  category: string,
  limit = 3,
): Promise<BlogSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);

  // Prefer same-category articles, then backfill with the most recent others.
  const sameCategory = await collection
    .find({ slug: { $ne: currentSlug }, category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  if (sameCategory.length >= limit) {
    return sameCategory.map(toSummary);
  }

  const excludeSlugs = [currentSlug, ...sameCategory.map((doc) => doc.slug)];
  const backfill = await collection
    .find({ slug: { $nin: excludeSlugs } })
    .sort({ createdAt: -1 })
    .limit(limit - sameCategory.length)
    .toArray();

  return [...sameCategory, ...backfill].map(toSummary);
}

export async function getBlogsForVendor(vendorSlug: string, limit = 50): Promise<BlogSummary[]> {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const docs = await collection
    .find({ vendorSlug })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toSummary);
}

export async function getBlogActivityForVendor(
  vendorSlug: string,
): Promise<BlogActivitySummary> {
  const database = await getDatabase();
  const collection = database.collection<BlogRecord>(BLOG_COLLECTION);
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [total, recentDocs] = await Promise.all([
    collection.countDocuments({ vendorSlug }),
    collection
      .find(
        { vendorSlug, createdAt: { $gte: sevenDaysAgo } },
        { projection: { createdAt: 1 } },
      )
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
    };
  });
  const countByDate = new Map(daily.map((item) => [item.date, item]));

  for (const doc of recentDocs) {
    const date = doc.createdAt.toISOString().slice(0, 10);
    const item = countByDate.get(date);
    if (item) item.count += 1;
  }

  return {
    total,
    today: countByDate.get(todayStart.toISOString().slice(0, 10))?.count ?? 0,
    last7Days: recentDocs.length,
    daily,
  };
}
