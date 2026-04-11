"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ProductContext = {
  name: string;
  price: number;
  vendorName: string;
  category: string;
  description: string;
  features: string[];
  stockLabel: string;
  shipWindow: string;
  slug: string;
};

export type ChatConfig = {
  room: string;
  title: string;
  subtitle?: string;
  productContext?: ProductContext;
};

type ChatContextValue = {
  isOpen: boolean;
  config: ChatConfig;
  openChat: (config: ChatConfig) => void;
  closeChat: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const DEFAULT: ChatConfig = {
  room: "support",
  title: "Live Support",
  subtitle: "Ask us anything — we reply fast",
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig>(DEFAULT);

  const openChat = useCallback((newConfig: ChatConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  return (
    <ChatContext.Provider value={{ isOpen, config, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}
