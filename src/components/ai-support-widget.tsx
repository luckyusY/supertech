"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { AiRichText } from "@/components/ai-rich-text";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  ts?: number;
};

const STORAGE_KEY = "supertech-ai-chat-v1";
const MAX_STORED = 40;

const starterMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I am **SuperTech AI Support**. Ask me about products, orders, requests, or becoming a vendor.",
  ts: 0,
};

const SUGGESTIONS = [
  "Find me a product",
  "How do I track my order?",
  "How do I pay with MoMoPay?",
  "How do I become a vendor?",
];

function formatTime(ts?: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AiSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // Load persisted conversation once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    hydrated.current = true;
  }, []);

  // Persist conversation whenever it changes (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  const visibleMessages = useMemo(() => messages.slice(-30), [messages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages, isLoading, isOpen]);

  function resetChat() {
    setMessages([starterMessage]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    inputRef.current?.focus();
  }

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || isLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: message, ts: Date.now() },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          messages: nextMessages,
          page: window.location.pathname,
        }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.error || "AI support is unavailable right now.",
            ts: Date.now(),
          },
        ]);
        return;
      }

      // Stream the reply into a placeholder assistant message.
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "", ts: Date.now() },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: accumulated,
          };
          return copy;
        });
      }

      if (!accumulated.trim()) {
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: "AI support is unavailable right now.",
          };
          return copy;
        });
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "AI support is unavailable right now.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  const showSuggestions = messages.length <= 1 && !isLoading;
  const streamingEmpty =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content.length === 0;

  return (
    <div className="fixed bottom-24 right-4 z-[60] sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section className="flex h-[34rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:w-[25rem]">
          {/* Header */}
          <div className="relative flex items-center justify-between gap-3 overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[#e07e17] px-4 py-3.5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--accent)] bg-[#1fae5b]" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold tracking-[-0.01em]">
                  SuperTech AI
                </p>
                <p className="flex items-center gap-1 text-[11px] text-white/80">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7CFFB2]" />
                  Online · replies in seconds
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Close AI support"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[var(--background)] p-4"
          >
            {visibleMessages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}-${message.ts ?? 0}`}
                  className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser ? (
                    <span className="mb-4 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                  ) : null}
                  <div className={isUser ? "max-w-[82%]" : "max-w-[85%]"}>
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm leading-6 ${
                        isUser
                          ? "rounded-br-sm bg-[var(--accent)] text-white"
                          : "rounded-bl-sm border border-[var(--line)] bg-white text-[var(--foreground)]"
                      }`}
                    >
                      {isUser ? (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      ) : message.content ? (
                        <AiRichText text={message.content} />
                      ) : (
                        <TypingDots />
                      )}
                    </div>
                    {message.ts ? (
                      <p
                        className={`mt-1 text-[10px] text-[var(--muted)] ${isUser ? "text-right" : "text-left"}`}
                      >
                        {formatTime(message.ts)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {streamingEmpty ? null : isLoading ? (
              <div className="flex items-end gap-2">
                <span className="mb-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-bl-sm border border-[var(--line)] bg-white px-3.5 py-2.5">
                  <TypingDots />
                </div>
              </div>
            ) : null}

            {/* Suggestions on the welcome screen */}
            {showSuggestions ? (
              <div className="pt-1">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Try asking
                </p>
                <div className="mt-2 grid gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendMessage(suggestion)}
                      className="group flex items-center justify-between gap-2 rounded-2xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-left text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {suggestion}
                      </span>
                      <Send className="h-3.5 w-3.5 -translate-x-1 text-[var(--accent)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--line)] bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--background)] py-1 pl-4 pr-1 transition-colors focus-within:border-[var(--accent)] focus-within:bg-white">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask SuperTech AI…"
                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
              AI can make mistakes — double-check important details.
            </p>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#e07e17] px-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(246,139,30,0.45)] transition-all hover:shadow-[0_16px_42px_rgba(246,139,30,0.55)] active:scale-95"
          aria-label="Open AI support"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[var(--accent)] bg-[#7CFFB2]" />
          </span>
          <span className="hidden sm:inline">AI Support</span>
        </button>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 animate-bounce rounded-full bg-[var(--muted)]"
          style={{ animationDelay: `${dot * 0.15}s` }}
        />
      ))}
    </span>
  );
}
