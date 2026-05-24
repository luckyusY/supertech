import { NextResponse } from "next/server";
import { createAccountToken } from "@/lib/account-tokens";
import { sendEmail } from "@/lib/email";
import { getAbsoluteUrl } from "@/lib/site-url";
import { createUser } from "@/lib/users";

export async function POST(request: Request) {
  console.log("[sign-up] MONGODB_URI set:", Boolean(process.env.MONGODB_URI), "| MONGODB_DB:", process.env.MONGODB_DB || "(using default)");
  try {
    const body = await request.json();
    const { email, password, name, phone } = body as { email?: string; password?: string; name?: string; phone?: string };

    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await createUser({ email, password, name, phone, role: "customer" });
    const verification = await createAccountToken({
      email: user.email,
      purpose: "email_verification",
      ttlMinutes: 60 * 24,
    });
    const verifyUrl = getAbsoluteUrl(`/api/auth/verify-email?token=${verification.token}`);

    await sendEmail({
      to: user.email,
      subject: "Confirm your SuperTech account",
      text: `Welcome to SuperTech, ${user.name}. Confirm your account here: ${verifyUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#313133">
          <h2>Welcome to SuperTech, ${user.name}</h2>
          <p>Please confirm your email address to finish setting up your account.</p>
          <p><a href="${verifyUrl}" style="display:inline-block;background:#f68b1e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Confirm email</a></p>
          <p>If the button does not work, copy this link into your browser:</p>
          <p>${verifyUrl}</p>
        </div>
      `,
    });

    return NextResponse.json({ verifyEmailSent: true, email: user.email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 },
    );
  }
}
