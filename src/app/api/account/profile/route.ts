import { NextResponse } from "next/server";
import {
  authorizeRequest,
  buildSessionFromMongo,
  setAuthSessionCookie,
} from "@/lib/auth";
import { updateUserProfile } from "@/lib/users";

type AccountProfileBody = {
  name?: string;
  phone?: string;
};

export async function PUT(request: Request) {
  const auth = authorizeRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as AccountProfileBody;
    const user = await updateUserProfile(auth.session.email, {
      name: body.name,
      phone: body.phone,
    });

    if (!user) {
      return NextResponse.json(
        { error: "This account profile cannot be edited here." },
        { status: 400 },
      );
    }

    const session = buildSessionFromMongo(user);
    const response = NextResponse.json({
      ok: true,
      profile: {
        name: user.name,
        phone: user.phone ?? "",
      },
      session,
    });
    setAuthSessionCookie(response, session);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update profile.",
      },
      { status: 400 },
    );
  }
}
