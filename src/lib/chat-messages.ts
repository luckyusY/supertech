import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export type ChatMessage = {
  _id?: ObjectId;
  room: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
  createdAt: Date;
};

export type ChatMessageOut = {
  id: string;
  room: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
  createdAt: string;
};

const COLLECTION = "chat_messages";

function toOut(doc: ChatMessage): ChatMessageOut {
  return {
    id: doc._id?.toString() ?? String(Date.now()),
    room: doc.room,
    senderName: doc.senderName,
    senderRole: doc.senderRole,
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function saveChatMessage(input: {
  room: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
}): Promise<ChatMessageOut> {
  const db = await getDatabase();
  const col = db.collection<ChatMessage>(COLLECTION);
  const doc: ChatMessage = {
    room: input.room,
    senderName: input.senderName.trim() || "Guest",
    senderRole: input.senderRole,
    text: input.text.trim(),
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return toOut({ ...doc, _id: result.insertedId });
}

export async function getChatMessages(
  room: string,
  after?: string,
): Promise<ChatMessageOut[]> {
  const db = await getDatabase();
  const col = db.collection<ChatMessage>(COLLECTION);
  const query: Record<string, unknown> = { room };
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  const docs = await col
    .find(query)
    .sort({ createdAt: 1 })
    .limit(100)
    .toArray();
  return docs.map(toOut);
}

export async function getAllChatRooms(): Promise<
  { room: string; lastMessage: string; lastAt: string; unread: number }[]
> {
  const db = await getDatabase();
  const col = db.collection<ChatMessage>(COLLECTION);
  const rooms = await col
    .aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$text" },
          lastAt: { $first: "$createdAt" },
          unread: {
            $sum: { $cond: [{ $eq: ["$senderRole", "user"] }, 1, 0] },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ])
    .toArray();
  return rooms.map((r) => ({
    room: r._id as string,
    lastMessage: r.lastMessage as string,
    lastAt: (r.lastAt as Date).toISOString(),
    unread: r.unread as number,
  }));
}
