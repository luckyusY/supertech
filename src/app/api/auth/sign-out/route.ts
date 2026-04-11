import { NextResponse } from "next/server";
import { clearAuthSessionCookie } from "@/lib/auth";

function signOutResponse(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/sign-in`, { status: 303 });
  clearAuthSessionCookie(response);
  return response;
}

export async function POST(request: Request) {
  return signOutResponse(request);
}

export async function GET(request: Request) {
  return signOutResponse(request);
}
