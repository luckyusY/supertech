import { NextResponse } from "next/server";
import { getGoogleWebClientId } from "@/lib/google-auth";

/**
 * Public Web client id for GIS / One Tap.
 * The OAuth Web client ID is designed to appear in the browser.
 * Reads GOOGLE_WEB_CLIENT_ID or NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID at runtime
 * (so a single Vercel env var works without a rebuild for NEXT_PUBLIC_*).
 */
export async function GET() {
  const clientId = getGoogleWebClientId();
  if (!clientId) {
    return NextResponse.json(
      {
        clientId: null,
        error:
          "Set GOOGLE_WEB_CLIENT_ID in Vercel environment variables and redeploy.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ clientId });
}
