import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getAllChatRooms } from "@/lib/chat-messages";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== "admin" && session.role !== "vendor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rooms = await getAllChatRooms();
    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("[chat rooms]", err);
    return NextResponse.json({ error: "Failed to load rooms" }, { status: 500 });
  }
}
