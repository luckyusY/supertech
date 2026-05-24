import { NextResponse } from "next/server";
import { consumeAccountToken } from "@/lib/account-tokens";
import { markUserEmailVerified } from "@/lib/users";
import { getAbsoluteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  if (!token.trim()) {
    return NextResponse.redirect(getAbsoluteUrl("/sign-in?verified=invalid"));
  }

  const email = await consumeAccountToken({
    token,
    purpose: "email_verification",
  });

  if (!email) {
    return NextResponse.redirect(getAbsoluteUrl("/sign-in?verified=invalid"));
  }

  await markUserEmailVerified(email);
  return NextResponse.redirect(getAbsoluteUrl("/sign-in?verified=1"));
}

