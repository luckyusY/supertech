import type { ReactNode } from "react";

const LINK_PATTERN = /(https?:\/\/[^\s)]+|\/[A-Za-z0-9\-/?=&#]+)/g;

function renderLinks(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK_PATTERN.lastIndex = 0;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const href = match[0];
    const isExternal = href.startsWith("http");
    nodes.push(
      <a
        key={`${keyPrefix}-link-${match.index}`}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="font-medium text-[var(--accent)] underline underline-offset-2"
      >
        {href}
      </a>,
    );
    lastIndex = match.index + href.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);

  return segments.flatMap((segment, index) => {
    if (/^\*\*[^*]+\*\*$/.test(segment)) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold">
          {renderLinks(segment.slice(2, -2), `${keyPrefix}-b-${index}`)}
        </strong>
      );
    }
    return renderLinks(segment, `${keyPrefix}-${index}`);
  });
}

/**
 * Minimal, dependency-free markdown-ish renderer for AI replies.
 * Supports **bold**, "- " / "* " bullet lists, and auto-linking of URLs
 * and internal paths. Everything is rendered as React nodes (no HTML
 * injection), so it is safe by construction.
 */
export function AiRichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-0.5 pl-5">
        {bullets.map((item, index) => (
          <li key={`${key}-li-${index}`}>{renderInline(item, `${key}-li-${index}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);

    if (bulletMatch) {
      bullets.push(bulletMatch[1]);
      return;
    }

    flushBullets(`ul-${index}`);

    if (trimmed.length > 0) {
      blocks.push(
        <p key={`p-${index}`} className="whitespace-pre-wrap">
          {renderInline(trimmed, `p-${index}`)}
        </p>,
      );
    }
  });

  flushBullets("ul-end");

  return <div className="space-y-1.5">{blocks}</div>;
}
