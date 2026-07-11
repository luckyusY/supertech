"use client";

import type { CSSProperties, ReactNode } from "react";
import { HoverScrollRegion } from "@/components/hover-scroll-region";
import { cn } from "@/lib/utils";

/**
 * Wrapper for non-DataTable dashboard tables (overview, analytics, recovery).
 * Hover focuses wheel scroll on the table pane instead of the page.
 */
export function DashboardScrollTable({
  children,
  className,
  maxHeight = "min(28rem, calc(100dvh - 16rem))",
}: {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}) {
  const style: CSSProperties = { maxHeight };

  return (
    <HoverScrollRegion
      className={cn(
        "dashboard-table-scroll overflow-auto rounded-[var(--radius-lg)] border border-[var(--line)] bg-white",
        className,
      )}
      style={style}
      axis="both"
    >
      {children}
    </HoverScrollRegion>
  );
}
