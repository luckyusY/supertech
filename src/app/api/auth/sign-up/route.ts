import { NextResponse } from "next/server";
import { createCustomerAccount } from "@/lib/customer-accounts";
import {
  getPostSignInPath,
  isReservedStaffEmail,
  setAuthSessionCookie,
  type AuthSession,
} from "@/lib/auth";

type SignUpRequestBody = {
  name?: string;
  email?: string;
  city?: string;
  password?: string;
  nextPath?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpRequestBody;
    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const city = typeof body.city === "string" ? body.city : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name.trim() || !email.trim() || !password.trim()) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (isReservedStaffEmail(email)) {
      return NextResponse.json(
        { error: "This email is reserved for staff access." },
        { status: 400 },
      );
    }

    const account = await createCustomerAccount({
      name,
      email,
      city,
      password,
    });

    const session: AuthSession = {
      email: account.email,
      role: "customer",
      name: account.name,
      dashboardPath: "/account",
    };

    const response = NextResponse.json({
      session,
      redirectTo: getPostSignInPath(session, body.nextPath),
    });

    setAuthSessionCookie(response, session);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create your account.",
      },
      { status: 400 },
    );
  }
}
