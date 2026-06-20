import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { buildSessionFromMongo, setAuthSessionCookie } from "@/lib/auth";
import { findOrCreateGoogleUser } from "@/lib/users";

type GoogleSignInBody = {
  idToken?: string;
};

export async function POST(request: Request) {
  try {
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID?.trim();
    if (!clientId) {
      return NextResponse.json(
        { error: "Google sign-in is not configured yet." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as GoogleSignInBody;
    const idToken = typeof body.idToken === "string" ? body.idToken.trim() : "";
    if (!idToken) {
      return NextResponse.json({ error: "Google ID token is required." }, { status: 400 });
    }

    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken,
      audience: clientId,
    });
    const profile = ticket.getPayload();
    if (!profile?.email || profile.email_verified !== true) {
      return NextResponse.json(
        { error: "Google did not provide a verified email address." },
        { status: 401 },
      );
    }

    const user = await findOrCreateGoogleUser({
      email: profile.email,
      name: profile.name ?? profile.email.split("@")[0],
    });
    const session = buildSessionFromMongo(user);
    const response = NextResponse.json({ session });
    setAuthSessionCookie(response, session);
    return response;
  } catch (error) {
    console.error("[auth/google]", error);
    return NextResponse.json(
      { error: "Google sign-in could not be verified. Please try again." },
      { status: 401 },
    );
  }
}
