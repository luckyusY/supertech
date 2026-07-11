import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "danger" | "whatsapp";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[var(--elevation-1)] hover:bg-[var(--accent-hover)]",
  secondary:
    "border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  dark: "supertech-dark-cta bg-[#313133] text-white hover:bg-[#252527]",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--neutral-100)]",
  danger: "bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]",
  whatsapp: "bg-[#1fae5b] text-white hover:bg-[#178d49]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-11 px-5 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-6 text-sm gap-2 rounded-[var(--radius-md)]",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    type = "button",
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
