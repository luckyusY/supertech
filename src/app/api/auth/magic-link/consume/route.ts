import { NextResponse } from "next/server";
import { consumeAccountToken } from "@/lib/account-tokens";
import {
  buildSessionFromMongo,
  getPostSignInPath,
  setAuthSessionCookie,
} from "@/lib/auth";
import { getAbsoluteUrl } from "@/lib/site-url";
import { findUserByEmail, markUserEmailVerified } from "@/lib/users";

function safeNextPath(nextPath: string | null) {
  if (!nextPath) return "";
  const trimmed = nextPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "";
  return trimmed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const next = safeNextPath(searchParams.get("next"));

  const invalidRedirect = NextResponse.redirect(
    getAbsoluteUrl("/sign-in?magic=invalid"),
  );

  if (!token) {
    return invalidRedirect;
  }

  try {
    const email = await consumeAccountToken({ token, purpose: "magic_link" });
    if (!email) {
      return invalidRedirect;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return invalidRedirect;
    }

    // A successful magic link also confirms the email address.
    if (user.emailVerified === false) {
      await markUserEmailVerified(email);
    }

    const session = buildSessionFromMongo({
      email: user.email,
      role: user.role,
      name: user.name,
      vendorSlug: user.vendorSlug,
    });

    const destination = getPostSignInPath(session, next || undefined);
    const response = NextResponse.redirect(getAbsoluteUrl(destination));
    setAuthSessionCookie(response, session);
    return response;
  } catch {
    return invalidRedirect;
  }
}
