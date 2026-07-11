import { NextRequest, NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type EventBody = {
  name?: string;
  props?: Record<string, unknown>;
  path?: string;
  ts?: string;
};

const ALLOWED = new Set([
  "search_submit",
  "search_suggest_click",
  "pdp_primary_cta",
  "pdp_add_to_cart",
  "pdp_whatsapp",
  "catalog_empty_request",
  "request_product_start",
  "track_order_view",
  "become_vendor_click",
]);

/**
 * Public, low-sensitivity product analytics ingest.
 * Does not require auth. Rate-limit at edge/CDN in production if needed.
 */
export async function POST(request: NextRequest) {
  let body: EventBody;
  try {
    body = (await request.json()) as EventBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name : "";
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Always acknowledge — analytics must not break UX if Mongo is down
  if (!hasMongoConfig()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const database = await getDatabase();
    await database.collection("product_events").insertOne({
      name,
      props: body.props && typeof body.props === "object" ? body.props : {},
      path: typeof body.path === "string" ? body.path.slice(0, 300) : null,
      ts: typeof body.ts === "string" ? body.ts : new Date().toISOString(),
      createdAt: new Date(),
      ua: request.headers.get("user-agent")?.slice(0, 400) ?? null,
    });
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}
