export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-[var(--radius-sm)] focus:bg-[var(--accent)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-[var(--elevation-3)]"
    >
      Skip to main content
    </a>
  );
}
