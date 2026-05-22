import "server-only";

import { ObjectId } from "mongodb";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";

type PasswordRecoveryRecord = {
  _id?: ObjectId;
  requestId: string;
  email: string;
  name: string;
  phone: string;
  notes: string;
  status: "open" | "resolved";
  createdAt: Date;
  updatedAt: Date;
};

const PASSWORD_RECOVERY_COLLECTION = "password_recovery_requests";

function toSummary(record: PasswordRecoveryRecord) {
  return {
    id: record._id?.toString() ?? record.requestId,
    requestId: record.requestId,
    email: record.email,
    name: record.name,
    phone: record.phone,
    notes: record.notes,
    status: record.status,
    createdAt: record.createdAt,
  };
}

function generateRequestId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `PR-${datePart}-${randomPart}`;
}

function normalizeText(value?: string) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export async function createPasswordRecoveryRequest(input: {
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
}) {
  if (!hasMongoConfig()) {
    throw new Error("Password recovery is temporarily unavailable.");
  }

  const email = normalizeText(input.email).toLowerCase();
  const name = normalizeText(input.name);
  const phone = normalizeText(input.phone);
  const notes = normalizeText(input.notes);

  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid account email.");
  }

  const now = new Date();
  const record: PasswordRecoveryRecord = {
    requestId: generateRequestId(),
    email,
    name,
    phone,
    notes,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  const database = await getDatabase();
  const result = await database
    .collection<PasswordRecoveryRecord>(PASSWORD_RECOVERY_COLLECTION)
    .insertOne(record);

  return {
    id: result.insertedId.toString(),
    requestId: record.requestId,
    email: record.email,
  };
}

export async function getPasswordRecoveryRequests(limit = 8) {
  if (!hasMongoConfig()) {
    return [];
  }

  const database = await getDatabase();
  const records = await database
    .collection<PasswordRecoveryRecord>(PASSWORD_RECOVERY_COLLECTION)
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return records.map((record) => toSummary(record));
}
