import { NextResponse } from "next/server";

/**
 * Digital Asset Links for the Android Trusted Web Activity (Bubblewrap).
 *
 * This file must be reachable at:
 *   https://www.supertech.africa/.well-known/assetlinks.json
 *
 * It tells Chrome that the SuperTech Android app is allowed to open
 * supertech.africa in full-screen (no browser address bar).
 *
 * Fill these in after `bubblewrap init` / `bubblewrap build`:
 *   TWA_PACKAGE_NAME        e.g. "africa.supertech.twa"
 *   TWA_SHA256_FINGERPRINTS comma-separated SHA-256 cert fingerprints.
 *                           Include BOTH your upload key and Google Play's
 *                           app-signing key (Play Console > Setup > App
 *                           integrity). Get the local one with:
 *                             bubblewrap fingerprint
 *
 * Until the env vars are set, this returns the structure with empty
 * fingerprints so the route exists and is testable — the address bar will
 * only disappear once a real fingerprint is present.
 */

export const dynamic = "force-static";

const PACKAGE_NAME = process.env.TWA_PACKAGE_NAME?.trim() || "africa.supertech.app";

const FINGERPRINTS = (process.env.TWA_SHA256_FINGERPRINTS ?? "")
  .split(",")
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

export function GET() {
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: FINGERPRINTS,
      },
    },
  ];

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
