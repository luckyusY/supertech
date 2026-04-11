import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const session = getAuthSessionFromRequest(request);

  return NextResponse.json({ session });
}
