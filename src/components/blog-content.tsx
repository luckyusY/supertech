import type { ReactNode } from "react";

const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(BOLD_PATTERN).map((segment, index) => {
    if (/^\*\*[^*]+\*\*$/.test(segment)) {
      return (
        <strong key={`${keyPrefix}-b-${index}`} className="font-semibold text-[var(--foreground)]">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${index}`}>{segment}</span>;
  });
}

/**
 * Lightweight, dependency-free markdown renderer for published blog articles.
 * Supports #/##/### headings, "- "/"* " and "1." lists, **bold**, and blank-line
 * separated paragraphs. Rendered as React nodes — no HTML injection.
 */
export function BlogContent({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    blocks.push(
      <p key={key} className="mt-4 text-[15px] leading-8 text-[var(--foreground)]/85">
        {renderInline(text, key)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    const items = listItems.map((item, index) => (
      <li key={`${key}-li-${index}`} className="leading-7">
        {renderInline(item, `${key}-li-${index}`)}
      </li>
    ));
    blocks.push(
      listType === "ol" ? (
        <ol key={key} className="mt-4 list-decimal space-y-1.5 pl-6 text-[15px] text-[var(--foreground)]/85">
          {items}
        </ol>
      ) : (
        <ul key={key} className="mt-4 list-disc space-y-1.5 pl-6 text-[15px] text-[var(--foreground)]/85">
          {items}
        </ul>
      ),
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const key = `blk-${index}`;

    if (!line) {
      flushParagraph(key);
      flushList(key);
      return;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph(key);
      flushList(key);
      const level = heading[1].length;
      const content = renderInline(heading[2], key);
      if (level <= 1) {
        blocks.push(
          <h2 key={key} className="mt-9 text-2xl font-black tracking-[-0.03em] text-[var(--foreground)]">
            {content}
          </h2>,
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={key} className="mt-8 text-xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
            {content}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={key} className="mt-6 text-lg font-bold tracking-[-0.01em] text-[var(--foreground)]">
            {content}
          </h3>,
        );
      }
      return;
    }

    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);

    if (ordered) {
      flushParagraph(key);
      if (listType === "ul") flushList(key);
      listType = "ol";
      listItems.push(ordered[1]);
      return;
    }

    if (bullet) {
      flushParagraph(key);
      if (listType === "ol") flushList(key);
      listType = "ul";
      listItems.push(bullet[1]);
      return;
    }

    flushList(key);
    paragraph.push(line);
  });

  flushParagraph("end");
  flushList("end");

  return <div className="blog-prose">{blocks}</div>;
}
