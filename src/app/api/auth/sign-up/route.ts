import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { buildSessionFromMongo, setAuthSessionCookie } from "@/lib/auth";

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
    const session = buildSessionFromMongo(user);
    const response = NextResponse.json({ session, redirectTo: "/" });
    setAuthSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 },
    );
  }
}
