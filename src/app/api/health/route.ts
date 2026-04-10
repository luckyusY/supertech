import { NextResponse } from "next/server";
import { getIntegrationStatus, hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  let mongoPing: "skipped" | "ok" | "failed" = "skipped";

  if (hasMongoConfig()) {
    try {
      const database = await getDatabase();
      await database.command({ ping: 1 });
      mongoPing = "ok";
    } catch {
      mongoPing = "failed";
    }
  }

  return NextResponse.json({
    service: "supertech-marketplace",
    ok: mongoPing !== "failed",
    checkedAt: new Date().toISOString(),
    mongoPing,
    integrations: getIntegrationStatus(),
  });
}
