"use client";

import { MessageCircle } from "lucide-react";
import { useChatContext } from "@/components/chat-context";

type Props = {
  vendorSlug: string;
  vendorName: string;
};

export function ChatWithSellerButton({ vendorSlug, vendorName }: Props) {
  const { openChat } = useChatContext();

  return (
    <button
      type="button"
      onClick={() =>
        openChat({
          room: `vendor-${vendorSlug}`,
          title: vendorName,
          subtitle: "Ask about this product",
        })
      }
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-6 py-3 text-sm font-semibold transition-colors hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
    >
      <MessageCircle className="h-4 w-4" />
      Chat with seller
    </button>
  );
}
