"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const starterMessage: ChatMessage = {
  role: "assistant",
  content: "Hi, I am SuperTech AI Support. Ask me about products, orders, requests, or becoming a vendor.",
};

export function AiSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
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
      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || data.error || "AI support is unavailable right now.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "AI support is unavailable right now." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-[60] sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section className="flex h-[34rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-[var(--line)] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.22)] sm:w-96">
          <div className="flex items-center justify-between gap-3 bg-[var(--foreground)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">AI Support</p>
                <p className="text-xs text-white/62">Shopping and vendor help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close AI support"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--background)] p-4">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-md px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is replying
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[var(--line)] bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask SuperTech..."
              className="h-11 min-w-0 flex-1 rounded-md border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-14 items-center gap-2 rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-colors hover:bg-black"
          aria-label="Open AI support"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">AI Support</span>
        </button>
      )}
    </div>
  );
}
