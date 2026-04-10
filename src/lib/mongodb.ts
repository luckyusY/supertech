import { MongoClient } from "mongodb";

declare global {
  var _supertechMongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "supertech";

export function getDatabaseName() {
  return databaseName;
}

export function getMongoClient() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local before using MongoDB.");
  }

  if (!global._supertechMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    global._supertechMongoClientPromise = client.connect();
  }

  return global._supertechMongoClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();

  return client.db(databaseName);
}
