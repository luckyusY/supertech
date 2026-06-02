import { NextResponse } from "next/server";
import { createAccountToken } from "@/lib/account-tokens";
import { sendEmail } from "@/lib/email";
import { getAbsoluteUrl } from "@/lib/site-url";
import { findUserByEmail } from "@/lib/users";

type MagicLinkRequestBody = {
  email?: string;
  nextPath?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeNextPath(nextPath?: string) {
  if (!nextPath) return "";
  const trimmed = nextPath.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "";
  return trimmed;
}

export async function POST(request: Request) {
  // Generic success message avoids leaking which emails have accounts.
  const genericResponse = NextResponse.json({
    message:
      "If an account exists for that email, we've sent a sign-in link. Check your inbox.",
  });

  try {
    const body = (await request.json()) as MagicLinkRequestBody;
    const email = String(body.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Do not reveal non-existence.
      return genericResponse;
    }

    const next = safeNextPath(body.nextPath);
    const link = await createAccountToken({
      email: user.email,
      purpose: "magic_link",
      ttlMinutes: 20,
    });

    const params = new URLSearchParams({ token: link.token });
    if (next) params.set("next", next);
    const magicUrl = getAbsoluteUrl(`/api/auth/magic-link/consume?${params.toString()}`);

    await sendEmail({
      to: user.email,
      subject: "Your SuperTech sign-in link",
      text: `Sign in to SuperTech with this link: ${magicUrl}. It expires in 20 minutes. If you didn't request it, ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#313133">
          <h2>Sign in to SuperTech</h2>
          <p>Click the button below to sign in. This link expires in 20 minutes and can be used once.</p>
          <p><a href="${magicUrl}" style="display:inline-block;background:#f68b1e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Sign in to SuperTech</a></p>
          <p>If the button does not work, copy this link into your browser:</p>
          <p>${magicUrl}</p>
          <p style="color:#8a8a8a;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return genericResponse;
  } catch {
    // Still return generic success to avoid enumeration/timing leaks.
    return genericResponse;
  }
}
