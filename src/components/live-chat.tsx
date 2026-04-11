"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Minimize2,
  Package,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import { useChatContext } from "@/components/chat-context";
import { formatPrice } from "@/lib/utils";

type Message = {
  id: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
  createdAt: string;
};

const POLL_INTERVAL = 3000; // ms

export function LiveChat() {
  const { isOpen, config, openChat, closeChat } = useChatContext();

  // name entry step
  const [nameInput, setNameInput] = useState("");
  const [userName, setUserName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAtRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRoomRef = useRef(config.room);

  // ── polling ──────────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (room: string, after?: string | null) => {
      try {
        const url = `/api/chat-messages?room=${encodeURIComponent(room)}${after ? `&after=${encodeURIComponent(after)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { messages: Message[] };
        if (data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = data.messages.filter((m) => !existingIds.has(m.id));
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
          lastAtRef.current = data.messages[data.messages.length - 1].createdAt;
        }
      } catch {
        // silent — try again next poll
      }
    },
    [],
  );

  function startPolling(room: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(
      () => void fetchMessages(room, lastAtRef.current),
      POLL_INTERVAL,
    );
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // start/stop polling when chat opens/closes
  useEffect(() => {
    if (isOpen && nameSet) {
      void fetchMessages(config.room, null);
      startPolling(config.room);
    } else {
      stopPolling();
    }
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, nameSet, config.room]);

  // reset when room changes
  useEffect(() => {
    if (config.room !== prevRoomRef.current) {
      prevRoomRef.current = config.room;
      stopPolling();
      setMessages([]);
      lastAtRef.current = null;
      if (nameSet) {
        void fetchMessages(config.room, null);
        startPolling(config.room);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.room]);

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // focus input on open
  useEffect(() => {
    if (isOpen && nameSet) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen, nameSet]);

  // ── handlers ─────────────────────────────────────────────────────
  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    setUserName(name);
    setNameSet(true);
    // fetch history immediately after name is set
    void fetchMessages(config.room, null);
    startPolling(config.room);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError("");
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      senderName: userName,
      senderRole: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: config.room, senderName: userName, text }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to send");
      }

      const data = (await res.json()) as { message: Message };
      // Replace optimistic with confirmed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.message : m)),
      );
      lastAtRef.current = data.message.createdAt;
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err instanceof Error ? err.message : "Failed to send. Try again.");
    } finally {
      setSending(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() =>
            openChat({ room: "support", title: "Live Support", subtitle: "We reply within minutes" })
          }
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-[350px] flex-col overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-2xl sm:bottom-6 sm:right-6">

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-[var(--foreground)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">{config.title}</p>
                {config.subtitle && (
                  <p className="text-[11px] leading-tight text-white/55">{config.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={closeChat} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label="Minimize">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={closeChat} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product context card */}
          {config.productContext && (
            <div className="shrink-0 border-b border-[var(--line)] bg-[rgba(16,32,25,0.03)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.7rem] bg-[rgba(16,32,25,0.08)]">
                  <Package className="h-4 w-4 text-[var(--muted)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-snug">
                    {config.productContext.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <span>{formatPrice(config.productContext.price)}</span>
                    <span>&middot;</span>
                    <ShoppingBag className="h-3 w-3 shrink-0" />
                    <span className="truncate">{config.productContext.vendorName}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Name entry */}
          {!nameSet ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
              <div className="text-center">
                <p className="text-sm font-semibold">What&apos;s your name?</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  So our team knows who to reply to
                </p>
              </div>
              <form onSubmit={handleJoin} className="w-full space-y-3">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  className="w-full rounded-[0.9rem] border border-[var(--line)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-white"
                >
                  Start chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="rounded-[0.9rem] bg-[rgba(16,32,25,0.05)] px-3 py-2.5 text-center text-xs text-[var(--muted)]">
                    {config.productContext
                      ? `Ask anything about ${config.productContext.name} — our team will reply shortly.`
                      : "Send a message and our support team will reply shortly."}
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.senderRole === "user";
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-[1rem] px-3.5 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? "rounded-br-[4px] bg-[var(--foreground)] text-white"
                            : "rounded-bl-[4px] bg-[rgba(16,32,25,0.06)] text-[var(--foreground)]"
                        }`}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {msg.senderName}
                          </p>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {error && (
                  <p className="rounded-[0.7rem] bg-[rgba(228,90,54,0.08)] px-3 py-2 text-center text-xs text-[var(--accent)]">
                    {error}
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  disabled={sending}
                  className="flex-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-opacity disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
