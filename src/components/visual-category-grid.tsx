import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type VisualCategoryItem = {
  name: string;
  href: string;
  image?: string | null;
  icon?: LucideIcon;
};

/**
 * Photo Factory mobile “Shop by category” visual grid.
 * Prefers product photos; falls back to icon tiles.
 */
export function VisualCategoryGrid({
  items,
  title = "Shop by category",
}: {
  items: VisualCategoryItem[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="bg-[var(--background-strong)] px-3 pb-4 pt-3">
      <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-white">
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={`${item.name}-${item.href}`}
            href={item.href}
            className="grid min-h-[118px] place-items-center rounded-[var(--radius-sm)] bg-white p-2 text-center shadow-sm"
          >
            {item.image ? (
              <span className="relative block h-14 w-full sm:h-16">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="33vw"
                  className="object-contain"
                />
              </span>
            ) : item.icon ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <item.icon className="h-5 w-5" />
              </span>
            ) : (
              <span className="h-12 w-12 rounded-full bg-[var(--neutral-100)]" />
            )}
            <span className="mt-2 line-clamp-2 text-[12px] font-semibold leading-4 text-[var(--foreground)] sm:text-[13px]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Desktop/tablet horizontal category cards with photos (PF CardSwiper style).
 */
export function VisualCategoryRail({ items }: { items: VisualCategoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-[linear-gradient(90deg,var(--background-strong),#1a1a1c,var(--background-strong))] py-4">
      <div className="page-shell">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <Link
              key={`rail-${item.name}`}
              href={item.href}
              className="group relative block h-40 w-44 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-black"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="176px"
                  className="object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                />
              ) : (
                <div className="absolute inset-0 bg-[var(--neutral-200)]" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2.5">
                <p className="line-clamp-2 text-sm font-bold text-white">{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
