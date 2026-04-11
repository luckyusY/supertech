"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Minimize2,
  Package,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useChatContext } from "@/components/chat-context";
import { formatPrice } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the SuperTech support assistant. Ask me anything about products, shipping, or orders.",
};

export function LiveChat() {
  const { isOpen, config, openChat, closeChat } = useChatContext();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevRoomRef = useRef(config.room);

  // Reset messages when product/room changes
  useEffect(() => {
    if (config.room !== prevRoomRef.current) {
      prevRoomRef.current = config.room;
      abortRef.current?.abort();
      const greeting: Message = {
        id: "welcome-" + config.room,
        role: "assistant",
        content: config.productContext
          ? `Hi! I can answer questions about **${config.productContext.name}**. What would you like to know?`
          : "Hi! I'm the SuperTech support assistant. Ask me anything about products, shipping, or orders.",
      };
      setMessages([greeting]);
      setError("");
    }
  }, [config.room, config.productContext]);

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setError("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const aId = `a-${Date.now()}`;
    const assistantMsg: Message = { id: aId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          productContext: config.productContext ?? null,
          room: config.room,
        }),
        signal: abort.signal,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === aId ? { ...m, content: full } : m)),
        );
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== aId));
    } finally {
      setStreaming(false);
    }
  }

  const showSuggestions = messages.length <= 1 && config.productContext;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() =>
            openChat({ room: "support", title: "Live Support", subtitle: "Ask us anything" })
          }
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-green-500">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[360px] flex-col overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-[var(--foreground)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-white">{config.title}</p>
                {config.subtitle && (
                  <p className="text-[11px] leading-tight text-white/55">{config.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={closeChat}
                className="rounded-full p-1.5 text-white/70 hover:bg-white/10"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={closeChat}
                className="rounded-full p-1.5 text-white/70 hover:bg-white/10"
                aria-label="Close"
              >
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

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)]">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-[1rem] px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-br-[4px] bg-[var(--foreground)] text-white"
                        : "rounded-bl-[4px] bg-[rgba(16,32,25,0.06)] text-[var(--foreground)]"
                    }`}
                  >
                    {msg.content || (
                      <span className="flex items-center gap-1 text-[var(--muted)]">
                        <span className="animate-bounce inline-block">·</span>
                        <span
                          className="animate-bounce inline-block"
                          style={{ animationDelay: "75ms" }}
                        >
                          ·
                        </span>
                        <span
                          className="animate-bounce inline-block"
                          style={{ animationDelay: "150ms" }}
                        >
                          ·
                        </span>
                      </span>
                    )}
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

          {/* Suggested prompts */}
          {showSuggestions && (
            <div className="shrink-0 border-t border-[var(--line)] px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {["Is this in stock?", "How long to ship?", "What's in the box?"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium transition-colors hover:border-[var(--foreground)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex shrink-0 items-center gap-2 border-t border-[var(--line)] p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={streaming}
              className="flex-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
