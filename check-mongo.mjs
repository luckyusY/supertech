import { MongoClient } from "mongodb";
import fs from "fs";

async function check() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const uriLine = envContent.split("\n").find(line => line.startsWith("MONGODB_URI="));
  const uri = uriLine ? uriLine.split("=")[1].trim() : null;
  if (!uri) {
    console.log("No MONGODB_URI");
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const docs = await db.collection("superstore_product_submissions").find({}).toArray();
  console.log("Total docs:", docs.length);
  const statusCounts = {};
  for (const doc of docs) {
    statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;
  }
  console.log("Statuses:", statusCounts);
  
  const pendingDocs = docs.filter(d => d.status !== "approved");
  console.log("Pending sample:", pendingDocs.slice(0, 2).map(d => ({ name: d.name, status: d.status })));
  
  await client.close();
}
check();
