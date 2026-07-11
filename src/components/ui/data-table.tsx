import type { CSSProperties, ReactNode } from "react";
import { HoverScrollRegion } from "@/components/hover-scroll-region";
import { cn } from "@/lib/utils";

type DataTableProps = {
  children: ReactNode;
  className?: string;
  minWidth?: string;
  /**
   * Cap body height so rows scroll inside the table instead of growing the page.
   * Pass false to disable (short tables). Default: viewport-aware cap.
   */
  maxHeight?: string | false;
};

const DEFAULT_MAX_HEIGHT = "min(32rem, calc(100dvh - 14rem))";

export function DataTable({
  children,
  className,
  minWidth = "44rem",
  maxHeight = DEFAULT_MAX_HEIGHT,
}: DataTableProps) {
  const scrollStyle: CSSProperties | undefined =
    maxHeight === false ? undefined : { maxHeight };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]",
        className,
      )}
    >
      <HoverScrollRegion
        className={cn(
          "dashboard-table-scroll",
          maxHeight === false ? "overflow-x-auto" : "overflow-auto",
        )}
        style={scrollStyle}
        axis="both"
      >
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </HoverScrollRegion>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-[1]">
      <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)] shadow-[0_1px_0_var(--line)]">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableTh({
  children,
  className,
  numeric,
}: {
  children?: ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <th
      className={cn(
        "bg-[var(--neutral-50)] px-3 py-3 text-label font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:px-4",
        numeric && "text-right font-numeric",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
  muted,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--line)] last:border-0 even:bg-[var(--neutral-50)]/60",
        muted && "opacity-55",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableTd({
  children,
  className,
  numeric,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  numeric?: boolean;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-3 py-3.5 align-middle text-body text-[var(--foreground)] sm:px-4",
        numeric && "text-right font-numeric",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** 1-based row number for paginated tables */
export function RowNumber({
  index,
  offset = 0,
}: {
  index: number;
  offset?: number;
}) {
  return (
    <span className="font-numeric text-caption text-[var(--muted)]">
      {offset + index + 1}
    </span>
  );
}
