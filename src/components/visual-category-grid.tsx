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
 * Mobile “Shop by category” grid under the hero.
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
    <section className="bg-[var(--background-strong)] px-3 pb-4 pt-3 md:hidden">
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
 * Adorama-style blue product strip under the hero — product stills on a blue gradient.
 */
export function VisualCategoryRail({ items }: { items: VisualCategoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(90deg,#cc6600_0%,#e8770a_45%,#b35900_100%)] py-3 sm:py-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.12),transparent_42%)]" />
      <div className="relative">
        <div className="no-scrollbar flex gap-0 overflow-x-auto px-1 sm:px-2">
          {items.map((item) => (
            <Link
              key={`rail-${item.name}`}
              href={item.href}
              className="group relative flex h-[7.5rem] w-[7.25rem] shrink-0 flex-col items-center justify-end px-2 pb-2 pt-1 sm:h-36 sm:w-40"
            >
              <span className="relative mb-1 block h-[4.5rem] w-full sm:h-24">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105"
                  />
                ) : item.icon ? (
                  <span className="grid h-full w-full place-items-center text-white/90">
                    <item.icon className="h-10 w-10" />
                  </span>
                ) : null}
              </span>
              <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-white sm:text-xs">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
