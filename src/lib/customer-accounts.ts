import "server-only";

import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";

declare global {
  var _supertechCustomerAccountIndexPromise: Promise<void> | undefined;
}

export type CustomerAccountRecord = {
  _id?: ObjectId;
  role: "customer";
  name: string;
  email: string;
  city: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerAccountSummary = {
  id: string;
  role: "customer";
  name: string;
  email: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
};

const CUSTOMER_ACCOUNT_COLLECTION = "customer_accounts";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeCity(city?: string) {
  return city?.trim().replace(/\s+/g, " ") ?? "";
}

function validatePassword(password: string) {
  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  if (!/[a-zA-Z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
    throw new Error("Password must include at least one letter and one number.");
  }

  return trimmedPassword;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");

  return `scrypt:${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [scheme, salt, storedKey] = passwordHash.split(":");

  if (scheme !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  const providedKey = Buffer.from(derivedKey, "hex");
  const expectedKey = Buffer.from(storedKey, "hex");

  if (providedKey.length !== expectedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedKey, expectedKey);
}

function toSummary(record: CustomerAccountRecord): CustomerAccountSummary {
  return {
    id: record._id?.toString() ?? record.email,
    role: "customer",
    name: record.name,
    email: record.email,
    city: record.city,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function ensureCustomerAccountIndexes() {
  if (!hasMongoConfig()) {
    return;
  }

  if (!global._supertechCustomerAccountIndexPromise) {
    global._supertechCustomerAccountIndexPromise = (async () => {
      const database = await getDatabase();
      await database
        .collection<CustomerAccountRecord>(CUSTOMER_ACCOUNT_COLLECTION)
        .createIndex({ email: 1 }, { unique: true });
    })();
  }

  await global._supertechCustomerAccountIndexPromise;
}

async function getCustomerAccountCollection() {
  if (!hasMongoConfig()) {
    throw new Error("Customer accounts are unavailable until MongoDB is configured.");
  }

  await ensureCustomerAccountIndexes();
  const database = await getDatabase();

  return database.collection<CustomerAccountRecord>(CUSTOMER_ACCOUNT_COLLECTION);
}

export async function getCustomerAccountRecordByEmail(email: string) {
  if (!hasMongoConfig()) {
    return null;
  }

  const collection = await getCustomerAccountCollection();

  return collection.findOne({
    email: normalizeEmail(email),
  });
}

export async function getCustomerAccountSummaryByEmail(email: string) {
  const record = await getCustomerAccountRecordByEmail(email);

  return record ? toSummary(record) : null;
}

export async function authenticateCustomerAccount(input: {
  email: string;
  password: string;
}) {
  const record = await getCustomerAccountRecordByEmail(input.email);

  if (!record) {
    return null;
  }

  const password = input.password.trim();

  if (!verifyPassword(password, record.passwordHash)) {
    return null;
  }

  return toSummary(record);
}

export async function createCustomerAccount(input: {
  name: string;
  email: string;
  password: string;
  city?: string;
}) {
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = validatePassword(input.password);
  const city = normalizeCity(input.city);

  if (name.length < 2) {
    throw new Error("Please enter your full name.");
  }

  if (!email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const existingAccount = await getCustomerAccountRecordByEmail(email);

  if (existingAccount) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date();
  const collection = await getCustomerAccountCollection();
  const record: CustomerAccountRecord = {
    role: "customer",
    name,
    email,
    city,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await collection.insertOne(record);

    return toSummary({
      ...record,
      _id: result.insertedId,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error("An account with this email already exists.");
    }

    throw error;
  }
}
