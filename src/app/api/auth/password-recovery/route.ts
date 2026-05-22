import { NextResponse } from "next/server";
import { createPasswordRecoveryRequest } from "@/lib/password-recovery";

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
