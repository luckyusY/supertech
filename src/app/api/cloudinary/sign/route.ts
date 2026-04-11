import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

type SignaturePayload = {
  paramsToSign?: Record<string, string | number | boolean | undefined>;
};

export async function POST(request: Request) {
  const authorization = authorizeRequest(request, ["admin", "vendor"]);

  if (!authorization.ok) {
    return authorization.response;
  }

  try {
    const body = (await request.json()) as SignaturePayload;
    const timestamp =
      typeof body?.paramsToSign?.timestamp === "number"
        ? body.paramsToSign.timestamp
        : Math.round(Date.now() / 1000);

    const paramsToSign = {
      ...body?.paramsToSign,
      timestamp,
    };

    const signature = createUploadSignature(paramsToSign);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate Cloudinary signature.",
      },
      { status: 500 },
    );
  }
}
