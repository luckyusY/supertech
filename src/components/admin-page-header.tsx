import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] sm:h-11 sm:w-11">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          {eyebrow ? (
            <p className="text-overline text-[var(--muted)]">{eyebrow}</p>
          ) : null}
          <h1 className="text-title text-[var(--foreground)]">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-body text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
