import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableProps = {
  children: ReactNode;
  className?: string;
  minWidth?: string;
};

export function DataTable({ children, className, minWidth = "44rem" }: DataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)]">{children}</tr>
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
        "px-3 py-3 text-label font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:px-4",
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
