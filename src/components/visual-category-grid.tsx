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
    <section className="border-b border-[var(--line)] bg-white py-4 sm:py-5">
      <div className="page-shell">
        <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Explore</p>
            <h2 className="mt-1 text-lg font-bold text-[var(--foreground)] sm:text-xl">Shop by category</h2>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] sm:text-sm">
            View catalog
          </Link>
        </div>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
          {items.map((item) => (
            <Link
              key={`rail-${item.name}`}
              href={item.href}
              className="group flex h-[7.75rem] w-[7rem] shrink-0 flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--neutral-50)] sm:h-[9rem] sm:w-[8.5rem]"
            >
              <span className="relative block min-h-0 flex-1 w-full">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-contain p-2 transition duration-300 group-hover:scale-105"
                  />
                ) : item.icon ? (
                  <span className="grid h-full w-full place-items-center text-[var(--accent)]">
                    <item.icon className="h-10 w-10" />
                  </span>
                ) : null}
              </span>
              <span className="flex min-h-10 items-center justify-center border-t border-[var(--line)] bg-white px-2 text-center text-[11px] font-semibold leading-tight text-[var(--foreground)] sm:text-xs">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
