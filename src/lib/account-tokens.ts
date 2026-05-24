import "server-only";
import crypto from "node:crypto";
import { getDatabase } from "@/lib/mongodb";

export type AccountTokenPurpose = "email_verification" | "password_reset";

type AccountTokenRecord = {
  tokenHash: string;
  email: string;
  purpose: AccountTokenPurpose;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
};

const COLLECTION = "account_tokens";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createAccountToken(input: {
  email: string;
  purpose: AccountTokenPurpose;
  ttlMinutes: number;
}) {
  const db = await getDatabase();
  const email = input.email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.ttlMinutes * 60 * 1000);

  await db.collection<AccountTokenRecord>(COLLECTION).deleteMany({
    email,
    purpose: input.purpose,
    usedAt: { $exists: false },
  });

  await db.collection<AccountTokenRecord>(COLLECTION).insertOne({
    tokenHash: hashToken(token),
    email,
    purpose: input.purpose,
    createdAt: now,
    expiresAt,
  });

  await db.collection<AccountTokenRecord>(COLLECTION).createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection<AccountTokenRecord>(COLLECTION).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return { token, email, expiresAt };
}

export async function consumeAccountToken(input: {
  token: string;
  purpose: AccountTokenPurpose;
}) {
  const db = await getDatabase();
  const now = new Date();
  const tokenHash = hashToken(input.token.trim());

  const record = await db.collection<AccountTokenRecord>(COLLECTION).findOneAndUpdate(
    {
      tokenHash,
      purpose: input.purpose,
      usedAt: { $exists: false },
      expiresAt: { $gt: now },
    },
    { $set: { usedAt: now } },
    { returnDocument: "after" },
  );

  return record?.email ?? null;
}
