import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getVendorBySlug } from "@/lib/marketplace";
import { slugify } from "@/lib/utils";

export type ProductSubmissionStatus = "pending_review" | "approved" | "rejected";

export type CreateProductSubmissionInput = {
  vendorSlug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  badge: string;
  stockLabel: string;
  shipWindow: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
};

export type ProductSubmissionRecord = {
  _id?: ObjectId;
  submissionId: string;
  slug: string;
  vendorSlug: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  badge: string;
  stockLabel: string;
  shipWindow: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  status: ProductSubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductSubmissionSummary = {
  id: string;
  submissionId: string;
  slug: string;
  vendorSlug: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  badge: string;
  stockLabel: string;
  shipWindow: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  status: ProductSubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
};

const PRODUCT_SUBMISSION_COLLECTION = "product_submissions";

function generateSubmissionId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `PS-${datePart}-${randomPart}`;
}

function normalizeFeatures(features: string[]) {
  return features.map((feature) => feature.trim()).filter(Boolean).slice(0, 8);
}

function toSummary(record: ProductSubmissionRecord): ProductSubmissionSummary {
  return {
    id: record._id?.toString() ?? record.submissionId,
    submissionId: record.submissionId,
    slug: record.slug,
    vendorSlug: record.vendorSlug,
    vendorName: record.vendorName,
    name: record.name,
    category: record.category,
    price: record.price,
    compareAt: record.compareAt,
    badge: record.badge,
    stockLabel: record.stockLabel,
    shipWindow: record.shipWindow,
    description: record.description,
    features: record.features,
    heroImage: record.heroImage,
    gallery: record.gallery,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createProductSubmission(input: CreateProductSubmissionInput) {
  // Check static vendors first, then fall back to MongoDB-created vendors
  let vendor = getVendorBySlug(input.vendorSlug) as { slug: string; name: string } | null;
  if (!vendor && input.vendorSlug) {
    const { getMongoVendorBySlug } = await import("@/lib/mongodb-vendors");
    vendor = await getMongoVendorBySlug(input.vendorSlug);
  }

  if (!vendor) {
    throw new Error("Selected vendor could not be found.");
  }

  const name = input.name.trim();
  const category = input.category.trim();
  const description = input.description.trim();
  const heroImage = input.heroImage.trim();
  const price = Number(input.price);
  const compareAt = input.compareAt ? Number(input.compareAt) : undefined;
  const badge = input.badge.trim() || "New listing";
  const stockLabel = input.stockLabel.trim() || "In stock";
  const shipWindow = input.shipWindow.trim() || "Ships within 48h";
  const features = normalizeFeatures(input.features);
  const gallery = [heroImage, ...input.gallery.map((image) => image.trim()).filter(Boolean)]
    .filter(Boolean)
    .slice(0, 4);

  if (!name || !category || !description) {
    throw new Error("Name, category, and description are required.");
  }

  if (!heroImage) {
    throw new Error("Upload at least one product image before submitting.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be greater than 0.");
  }

  const now = new Date();
  const record: ProductSubmissionRecord = {
    submissionId: generateSubmissionId(),
    slug: slugify(name),
    vendorSlug: vendor.slug,
    vendorName: vendor.name,
    name,
    category,
    price,
    compareAt:
      compareAt && Number.isFinite(compareAt) && compareAt > price ? compareAt : undefined,
    badge,
    stockLabel,
    shipWindow,
    description,
    features,
    heroImage,
    gallery,
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
  };

  const database = await getDatabase();
  const collection = database.collection<ProductSubmissionRecord>(PRODUCT_SUBMISSION_COLLECTION);
  const result = await collection.insertOne(record);

  return {
    ...toSummary(record),
    id: result.insertedId.toString(),
  };
}

export async function getProductSubmissions({
  vendorSlug,
  status,
  limit = 12,
}: {
  vendorSlug?: string;
  status?: ProductSubmissionStatus;
  limit?: number;
}) {
  const database = await getDatabase();
  const collection = database.collection<ProductSubmissionRecord>(PRODUCT_SUBMISSION_COLLECTION);
  const query: Record<string, unknown> = {};

  if (vendorSlug) {
    query.vendorSlug = vendorSlug;
  }

  if (status) {
    query.status = status;
  }

  const docs = await collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray();

  return docs.map((doc) => toSummary(doc));
}

export async function updateProductSubmissionStatus(
  id: string,
  status: ProductSubmissionStatus,
) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid product submission id.");
  }

  const database = await getDatabase();
  const collection = database.collection<ProductSubmissionRecord>(PRODUCT_SUBMISSION_COLLECTION);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  if (!result) {
    throw new Error("Product submission not found.");
  }

  return toSummary(result);
}
