import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZE_PX = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

type BrandLogoProps = {
  href?: string | null;
  size?: keyof typeof SIZE_PX;
  /** Show SuperTech wordmark next to the mark */
  showWordmark?: boolean;
  wordmark?: string;
  sublabel?: string;
  /** dark = for dark sidebars; light = for white surfaces */
  theme?: "light" | "dark";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
};

/**
 * Shared SuperTech logo mark + optional wordmark for headers, dashboards, auth.
 */
export function BrandLogo({
  href = "/",
  size = "md",
  showWordmark = true,
  wordmark = "SuperTech",
  sublabel,
  theme = "light",
  className,
  imageClassName,
  priority = false,
  badge,
  onClick,
}: BrandLogoProps) {
  const px = SIZE_PX[size];
  const dark = theme === "dark";

  const content = (
    <>
      <span className="relative shrink-0">
        <Image
          src="/logo.png"
          alt={showWordmark ? "" : "SuperTech"}
          width={px}
          height={px}
          priority={priority}
          className={cn(
            "rounded-lg bg-white object-contain shadow-sm",
            size === "sm" && "h-7 w-7",
            size === "md" && "h-9 w-9",
            size === "lg" && "h-11 w-11",
            imageClassName,
          )}
        />
        {badge}
      </span>
      {showWordmark ? (
        <span className="min-w-0 leading-tight">
          {sublabel ? (
            <span
              className={cn(
                "block truncate text-[10px] font-semibold uppercase tracking-[0.16em]",
                dark ? "text-white/55" : "text-[var(--muted)]",
              )}
            >
              {sublabel}
            </span>
          ) : null}
          <span
            className={cn(
              "block truncate font-semibold tracking-[-0.02em]",
              size === "lg" ? "text-base" : "text-sm",
              dark ? "text-white" : "text-[var(--foreground)]",
            )}
          >
            {wordmark}
          </span>
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
        aria-label="SuperTech home"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("inline-flex min-w-0 items-center gap-2.5", className)} onClick={onClick}>
      {content}
    </div>
  );
}
