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
