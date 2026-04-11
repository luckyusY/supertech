"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MessageCircle, Minimize2, Send, X } from "lucide-react";
import { useChatContext } from "@/components/chat-context";

type ChatMessage = { id: string; userId: string; userName: string; text: string; at: string };
type SystemMsg = { message: string };
type Entry = ChatMessage | { system: string; id: string };

export function LiveChat() {
  const { isOpen, config, openChat, closeChat } = useChatContext();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Entry[]>([]);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io({ path: "/api/socket", transports: ["polling", "websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("system", (msg: SystemMsg) =>
      setMessages((prev) => [...prev, { system: msg.message, id: String(Date.now()) }]),
    );
    return () => { socket.disconnect(); };
  }, []);

  // Rejoin room when config.room changes and user already set their name
  useEffect(() => {
    if (nameSet && socketRef.current && config.room !== currentRoomRef.current) {
      currentRoomRef.current = config.room;
      setMessages([]);
      socketRef.current.emit("join", { room: config.room, userName });
    }
  }, [config.room, nameSet, userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function joinChat(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    setUserName(name);
    setNameSet(true);
    currentRoomRef.current = config.room;
    socketRef.current?.emit("join", { room: config.room, userName: name });
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !connected) return;
    socketRef.current?.emit("message", { text });
    setText("");
  }

  return (
    <>
      {/* Floating button — always visible when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => openChat({ room: "support", title: "Live Support", subtitle: "We typically reply in minutes" })}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span
            className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white ${connected ? "bg-green-500" : "bg-gray-400"}`}
          />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[340px] flex-col overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-[var(--foreground)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${connected ? "bg-green-400" : "bg-gray-400"}`} />
              <div>
                <p className="text-sm font-semibold leading-tight text-white">{config.title}</p>
                {config.subtitle && (
                  <p className="text-[11px] leading-tight text-white/60">{config.subtitle}</p>
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

          {!nameSet ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
              <div className="text-center">
                <p className="text-sm font-semibold">What&apos;s your name?</p>
                <p className="mt-1 text-xs text-[var(--muted)]">So {config.title} knows who they&apos;re talking to</p>
              </div>
              <form onSubmit={joinChat} className="w-full space-y-3">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  required
                  autoFocus
                  className="w-full rounded-[0.9rem] border border-[var(--line)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
                <button type="submit" className="w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-white">
                  Start chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="rounded-[0.9rem] bg-[rgba(16,32,25,0.05)] px-3 py-2 text-center text-xs text-[var(--muted)]">
                  {config.subtitle ?? "We typically reply in minutes."}
                </div>
                {messages.map((msg) => {
                  if ("system" in msg) {
                    return (
                      <p key={msg.id} className="text-center text-xs text-[var(--muted)]">
                        {msg.system}
                      </p>
                    );
                  }
                  const isMe = msg.userName === userName;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-[1rem] px-3 py-2 text-sm leading-relaxed ${
                          isMe
                            ? "rounded-br-[4px] bg-[var(--foreground)] text-white"
                            : "rounded-bl-[4px] bg-[rgba(16,32,25,0.06)] text-[var(--foreground)]"
                        }`}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {msg.userName}
                          </p>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-[var(--line)] p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!connected}
                  className="flex-1 rounded-full border border-[var(--line)] px-4 py-2 text-sm focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || !connected}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-40"
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
