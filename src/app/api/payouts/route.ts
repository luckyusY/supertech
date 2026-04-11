import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getAllPayoutSummaries, getVendorPayouts } from "@/lib/payouts";

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) return auth.response;

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  }

  try {
    if (auth.session.role === "admin") {
      const summaries = await getAllPayoutSummaries();
      return NextResponse.json({ summaries });
    }

    if (!auth.session.vendorSlug) {
      return NextResponse.json({ error: "Vendor slug is missing." }, { status: 400 });
    }

    const payouts = await getVendorPayouts(auth.session.vendorSlug);
    return NextResponse.json({ payouts });
  } catch {
    return NextResponse.json({ error: "Unable to load payout data." }, { status: 500 });
  }
}
