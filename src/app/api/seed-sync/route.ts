import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { runSeedSync } from "@/lib/seed-sync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasMongoConfig()) {
      return NextResponse.json(
        { error: "MongoDB is not configured." },
        { status: 400 },
      );
    }

    const result = await runSeedSync();

    return NextResponse.json({
      ok: true,
      products: result.products,
      vendors: result.vendors,
    });
  } catch (err) {
    console.error("[seed-sync] Failed:", err);
    return NextResponse.json(
      { error: "Sync failed. Check server logs." },
      { status: 500 },
    );
  }
}
