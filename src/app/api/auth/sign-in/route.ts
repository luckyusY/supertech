import { NextResponse } from "next/server";
import {
  authenticateUser,
  getPostSignInPath,
  setAuthSessionCookie,
} from "@/lib/auth";

type SignInRequestBody = {
  email?: string;
  password?: string;
  nextPath?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignInRequestBody;
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email.trim() || !password.trim()) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const session = await authenticateUser({ email, password });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

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
          error instanceof Error ? error.message : "Unable to sign in right now.",
      },
      { status: 503 },
    );
  }
}
