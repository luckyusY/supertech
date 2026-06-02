import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { AiContentGenerator } from "@/components/ai-content-generator";
import { requirePageSession } from "@/lib/auth";
import { hasAiConfig, getAiModel } from "@/lib/ai";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "Generate SuperTech articles, product copy, social posts, and support content.",
};

export const dynamic = "force-dynamic";

export default async function AdminAiPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/ai" });

  const aiConfigured = hasAiConfig();

  return (
    <div className="page-shell py-8">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="mt-5 soft-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              SuperTech AI
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              AI Studio
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Create articles, product descriptions, social captions, and customer emails using your ChatGPT API settings.
            </p>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[var(--accent)]" />
              <p className="font-semibold">AI connection</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {aiConfigured
                ? `Ready with ${getAiModel()}.`
                : "Add OPENAI_API_KEY or CHATGPT_API_KEY to enable generation."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AiContentGenerator />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-md border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p>
          AI drafts should be reviewed before publishing, especially for prices, availability, delivery promises, and promotions.
        </p>
      </div>
    </div>
  );
}
