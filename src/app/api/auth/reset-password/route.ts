import { NextResponse } from "next/server";
import { consumeAccountToken } from "@/lib/account-tokens";
import { updateUserPassword } from "@/lib/users";

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPasswordBody;
    const token = body.token?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!token || !password) {
      return NextResponse.json({ error: "Reset token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const email = await consumeAccountToken({
      token,
      purpose: "password_reset",
    });

    if (!email) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const updated = await updateUserPassword(email, password);
    if (!updated) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 400 },
    );
  }
}

