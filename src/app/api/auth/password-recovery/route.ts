import { NextResponse } from "next/server";
import { createAccountToken } from "@/lib/account-tokens";
import { sendEmail } from "@/lib/email";
import { createPasswordRecoveryRequest } from "@/lib/password-recovery";
import { getAbsoluteUrl } from "@/lib/site-url";
import { findUserByEmail } from "@/lib/users";

type PasswordRecoveryRequestBody = {
  email?: string;
  name?: string;
  phone?: string;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PasswordRecoveryRequestBody;
    const recoveryRequest = await createPasswordRecoveryRequest({
      email: body.email ?? "",
      name: body.name,
      phone: body.phone,
      notes: body.notes,
    });

    const user = await findUserByEmail(body.email ?? "");
    if (user) {
      const reset = await createAccountToken({
        email: user.email,
        purpose: "password_reset",
        ttlMinutes: 60,
      });
      const resetUrl = getAbsoluteUrl(`/reset-password?token=${reset.token}`);

      await sendEmail({
        to: user.email,
        subject: "Reset your SuperTech password",
        text: `Reset your SuperTech password here: ${resetUrl}. This link expires in 1 hour.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#313133">
            <h2>Reset your SuperTech password</h2>
            <p>Use the button below to choose a new password. This link expires in 1 hour.</p>
            <p><a href="${resetUrl}" style="display:inline-block;background:#f68b1e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Reset password</a></p>
            <p>If the button does not work, copy this link into your browser:</p>
            <p>${resetUrl}</p>
          </div>
        `,
      });
    }

    return NextResponse.json(recoveryRequest);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit password recovery request.",
      },
      { status: 400 },
    );
  }
}
