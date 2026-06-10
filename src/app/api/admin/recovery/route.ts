import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { getPasswordRecoveryRequests } from "@/lib/password-recovery";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? 30);
  const requests = await getPasswordRecoveryRequests(Number.isFinite(limit) ? limit : 30);
  return NextResponse.json({ requests });
}
