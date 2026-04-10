import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  invert?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p
        className={cn(
          "font-mono text-xs uppercase tracking-[0.28em]",
          invert ? "text-[rgba(255,255,255,0.6)]" : "text-[var(--muted)]",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl",
          invert ? "text-white" : "text-[var(--foreground)]",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-sm leading-7 sm:text-base",
          invert ? "text-[rgba(255,255,255,0.72)]" : "text-[var(--muted)]",
        )}
      >
        {description}
      </p>
    </div>
  );
}
