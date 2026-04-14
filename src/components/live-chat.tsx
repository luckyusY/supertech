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
import { io, Socket } from "socket.io-client";
import { useChatContext } from "@/components/chat-context";
import { formatPrice } from "@/lib/utils";

type Message = {
  id: string;
  senderName: string;
  senderRole: "user" | "support";
  text: string;
  createdAt: string;
};

type SocketMessage = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  at: string;
};

export function LiveChat() {
  const { isOpen, config, openChat, closeChat } = useChatContext();

  const [nameInput, setNameInput] = useState("");
  const [userName, setUserName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Connect socket when chat opens + name is set
  useEffect(() => {
    if (!isOpen || !nameSet) return;

    const socket = io({
      path: "/api/socket",
      transports: ["polling", "websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { room: config.room, userName });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("history", (msgs: SocketMessage[]) => {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs: Message[] = msgs
          .filter((m) => !existingIds.has(m.id))
          .map((msg) => ({
            id: msg.id,
            senderName: msg.userName,
            senderRole: msg.userId === socket.id ? "user" : "support",
            text: msg.text,
            createdAt: msg.at,
          }));
        return [...prev, ...newMsgs];
      });
    });

    socket.on("message", (msg: SocketMessage) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            senderName: msg.userName,
            senderRole: msg.userId === socket.id ? "user" : "support",
            text: msg.text,
            createdAt: msg.at,
          },
        ];
      });
    });

    socket.on("system", (data: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderName: "System",
          senderRole: "support",
          text: `• ${data.message}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, nameSet, config.room]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen && nameSet) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen, nameSet]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    setUserName(name);
    setNameSet(true);
  }

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || sending || !socketRef.current) return;

      setSending(true);
      setInput("");
      setError("");

      // Optimistic message
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        senderName: userName,
        senderRole: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      socketRef.current.emit("message", { text });
      setSending(false);
    },
    [input, sending, userName],
  );

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() =>
            openChat({ room: "support", title: "Live Support", subtitle: "We reply within minutes" })
          }
          className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500 sm:h-3.5 sm:w-3.5" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[520px] sm:w-[350px] sm:rounded-2xl sm:border sm:border-[var(--line)] sm:shadow-2xl">

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-[var(--accent)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
                <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--accent)] ${connected ? "bg-green-400" : "bg-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">{config.title}</p>
                <p className="text-[11px] leading-tight text-white/70">
                  {connected ? "Online" : "Connecting..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={closeChat} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label="Close chat">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product context card */}
          {config.productContext && (
            <div className="shrink-0 border-b border-[var(--line)] bg-[var(--accent-soft)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                  <Package className="h-4 w-4 text-white" />
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <MessageCircle className="h-7 w-7 text-[var(--accent)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Chat with us</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  What&apos;s your name?
                </p>
              </div>
              <form onSubmit={handleJoin} className="w-full space-y-3">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white"
                >
                  Start chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 bg-[var(--background)]">
                {messages.length === 0 && (
                  <div className="rounded-xl bg-white px-3 py-4 text-center text-xs text-[var(--muted)] shadow-sm">
                    {config.productContext
                      ? `Ask anything about ${config.productContext.name} — our team will reply shortly.`
                      : "Send a message and our support team will reply shortly."}
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.senderRole === "user";
                  const isSystem = msg.senderName === "System";

                  if (isSystem) {
                    return (
                      <p key={msg.id} className="text-center text-[10px] text-[var(--muted)]">
                        {msg.text}
                      </p>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? "rounded-br-md bg-[var(--accent)] text-white"
                            : "rounded-bl-md bg-white text-[var(--foreground)] shadow-sm"
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
                  <p className="rounded-xl bg-[var(--red-soft)] px-3 py-2 text-center text-xs text-[var(--red)]">
                    {error}
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] bg-white p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  disabled={sending || !connected}
                  className="flex-1 rounded-full border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || !connected}
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
