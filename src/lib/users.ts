import "server-only";
import crypto from "node:crypto";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type UserRole = "admin" | "vendor" | "customer";

export type User = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  vendorSlug?: string;
  createdAt: Date;
};

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "supertech_salt_v1").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  vendorSlug?: string;
}): Promise<User> {
  if (!hasMongoConfig()) throw new Error("MongoDB is not configured.");
  const db = await getDatabase();
  const existing = await db.collection<User>("users").findOne({ email: input.email.trim().toLowerCase() });
  if (existing) throw new Error("An account with this email already exists.");
  const user: User = {
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    name: input.name.trim(),
    vendorSlug: input.vendorSlug,
    createdAt: new Date(),
  };
  await db.collection<User>("users").insertOne(user);
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!hasMongoConfig()) return null;
  try {
    const db = await getDatabase();
    return await db.collection<User>("users").findOne({ email: email.trim().toLowerCase() }) ?? null;
  } catch {
    return null;
  }
}

export async function authenticateMongoUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}
