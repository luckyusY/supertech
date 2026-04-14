"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type Message = {
  id: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
  createdAt: string;
};

type Room = {
  room: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

const POLL = 4000;

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function roomLabel(room: string) {
  if (room === "support") return "General Support";
  if (room.startsWith("vendor-")) return `Vendor: ${room.replace("vendor-", "")}`;
  return room;
}

export function AdminChatInbox() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAtRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── load rooms ───────────────────────────────────────────────────
  async function loadRooms() {
    try {
      const res = await fetch("/api/chat-messages/rooms", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { rooms: Room[] };
      setRooms(data.rooms);
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => {
    void loadRooms();
    const t = setInterval(() => void loadRooms(), 8000);
    return () => clearInterval(t);
  }, []);

  // ── load messages for active room ─────────────────────────────────
  const fetchMsgs = useCallback(async (room: string, after?: string | null) => {
    try {
      const url = `/api/chat-messages?room=${encodeURIComponent(room)}${after ? `&after=${encodeURIComponent(after)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      if (data.messages.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = data.messages.filter((m) => !ids.has(m.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
        lastAtRef.current = data.messages[data.messages.length - 1].createdAt;
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    setMessages([]);
    lastAtRef.current = null;
    void fetchMsgs(activeRoom, null);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(
      () => void fetchMsgs(activeRoom, lastAtRef.current),
      POLL,
    );
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeRoom, fetchMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── send reply ────────────────────────────────────────────────────
  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !activeRoom || sending) return;

    setReply("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, senderName: "Support", senderRole: "support", text, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat-messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: activeRoom, text }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { message: Message };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)));
      lastAtRef.current = data.message.createdAt;
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white">
      <div className="flex h-[480px]">
        {/* Sidebar — room list */}
        <div className="flex w-48 shrink-0 flex-col border-r border-[var(--line)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <p className="px-4 py-3 text-xs text-[var(--muted)]">Loading…</p>
            ) : rooms.length === 0 ? (
              <p className="px-4 py-4 text-xs text-[var(--muted)]">No conversations yet.</p>
            ) : (
              rooms.map((r) => (
                <button
                  key={r.room}
                  onClick={() => setActiveRoom(r.room)}
                  className={`w-full border-b border-[var(--line)] px-4 py-3 text-left transition-colors hover:bg-[rgba(15,23,42,0.04)] ${
                    activeRoom === r.room ? "bg-[rgba(15,23,42,0.06)]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="truncate text-xs font-semibold leading-snug">
                      {roomLabel(r.room)}
                    </p>
                    {r.unread > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {r.unread}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                    {r.lastMessage}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right — messages + reply */}
        <div className="flex flex-1 flex-col">
          {!activeRoom ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-[var(--muted)] opacity-40" />
              <p className="text-sm font-semibold">Select a conversation</p>
              <p className="text-xs text-[var(--muted)]">
                Customer messages appear here in real time.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="shrink-0 border-b border-[var(--line)] px-4 py-3">
                <p className="text-sm font-semibold">{roomLabel(activeRoom)}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-[var(--muted)]">No messages yet.</p>
                )}
                {messages.map((msg) => {
                  const isSupport = msg.senderRole === "support";
                  return (
                    <div key={msg.id} className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-[1rem] px-3.5 py-2.5 text-sm leading-relaxed ${
                          isSupport
                            ? "rounded-br-[4px] bg-[var(--foreground)] text-white"
                            : "rounded-bl-[4px] bg-[rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {!isSupport && (
                          <p className="mb-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {msg.senderName}
                          </p>
                        )}
                        <p>{msg.text}</p>
                        <p className={`mt-1 text-[10px] ${isSupport ? "text-white/50" : "text-[var(--muted)]"}`}>
                          {fmt(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <form
                onSubmit={handleReply}
                className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] p-3"
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply…"
                  disabled={sending}
                  className="flex-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white disabled:opacity-40"
                  aria-label="Send reply"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
