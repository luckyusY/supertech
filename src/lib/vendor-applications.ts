import "server-only";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type VendorApplicationStatus = "pending" | "approved" | "rejected";

export type VendorApplication = {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  website?: string;
  status: VendorApplicationStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
};

export async function createVendorApplication(
  input: Omit<VendorApplication, "_id" | "status" | "createdAt">,
): Promise<VendorApplication> {
  const application: VendorApplication = {
    ...input,
    status: "pending",
    createdAt: new Date(),
  };
  if (hasMongoConfig()) {
    const db = await getDatabase();
    await db.collection<VendorApplication>("vendor_applications").insertOne(application);
  }
  return application;
}

export async function getVendorApplications(
  status?: VendorApplicationStatus,
): Promise<VendorApplication[]> {
  if (!hasMongoConfig()) return [];
  try {
    const db = await getDatabase();
    const filter = status ? { status } : {};
    return await db
      .collection<VendorApplication>("vendor_applications")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
  } catch {
    return [];
  }
}

export async function getVendorApplicationById(
  id: string,
): Promise<VendorApplication | null> {
  if (!hasMongoConfig()) return null;
  try {
    const db = await getDatabase();
    return (
      (await db
        .collection<VendorApplication>("vendor_applications")
        .findOne({ _id: new ObjectId(id) })) ?? null
    );
  } catch {
    return null;
  }
}

export async function updateVendorApplicationStatus(
  id: string,
  status: VendorApplicationStatus,
  reviewedBy: string,
): Promise<boolean> {
  if (!hasMongoConfig()) return false;
  try {
    const db = await getDatabase();
    const result = await db
      .collection<VendorApplication>("vendor_applications")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, reviewedAt: new Date(), reviewedBy } },
      );
    return result.modifiedCount > 0;
  } catch {
    return false;
  }
}
