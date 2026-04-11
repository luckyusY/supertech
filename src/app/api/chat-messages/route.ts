import { NextResponse } from "next/server";
import { getChatMessages, saveChatMessage } from "@/lib/chat-messages";

export const dynamic = "force-dynamic";

// GET /api/chat-messages?room=support&after=<iso>
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room");
    const after = searchParams.get("after") ?? undefined;

    if (!room) {
      return NextResponse.json({ error: "room is required" }, { status: 400 });
    }

    const messages = await getChatMessages(room, after);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[chat-messages GET]", err);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

// POST /api/chat-messages  { room, senderName, text }
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      room?: string;
      senderName?: string;
      text?: string;
    };

    const room = body.room?.trim();
    const senderName = body.senderName?.trim() || "Guest";
    const text = body.text?.trim();

    if (!room || !text) {
      return NextResponse.json({ error: "room and text are required" }, { status: 400 });
    }

    const message = await saveChatMessage({
      room,
      senderName,
      senderRole: "user",
      text,
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[chat-messages POST]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
