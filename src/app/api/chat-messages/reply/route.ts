import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { saveChatMessage } from "@/lib/chat-messages";

export const dynamic = "force-dynamic";

// POST /api/chat-messages/reply  { room, text }  — admin/vendor only
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== "admin" && session.role !== "vendor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { room?: string; text?: string };
    const room = body.room?.trim();
    const text = body.text?.trim();

    if (!room || !text) {
      return NextResponse.json({ error: "room and text are required" }, { status: 400 });
    }

    const message = await saveChatMessage({
      room,
      senderName: session.name ?? "Support",
      senderRole: "support",
      text,
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[chat-messages reply]", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
