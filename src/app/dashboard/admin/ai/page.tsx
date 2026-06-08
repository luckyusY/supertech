import type { Metadata } from "next";
import Link from "next/link";
import { Bot, PenLine, Sparkles } from "lucide-react";
import { AiContentGenerator } from "@/components/ai-content-generator";
import { AdminPageHeader } from "@/components/admin-page-header";
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Sparkles}
        eyebrow="SuperTech AI"
        title="AI Studio"
        description="Create articles, product descriptions, social captions, and customer emails using your ChatGPT API settings."
        actions={
          <>
            <Link
              href="/blog/write"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              <PenLine className="h-3.5 w-3.5" />
              Write product SEO blog
            </Link>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                aiConfigured
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              {aiConfigured ? `Ready · ${getAiModel()}` : "Not configured"}
            </span>
          </>
        }
      />

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
