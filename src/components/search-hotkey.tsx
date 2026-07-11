"use client";

import { useEffect } from "react";

/**
 * Press `/` to focus the first visible marketplace search field
 * (skips when user is already typing in an input/textarea/contenteditable).
 */
export function SearchHotkey() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      const candidates = Array.from(
        document.querySelectorAll<HTMLInputElement>(
          'header input[type="search"], form[role="search"] input[type="search"]',
        ),
      );
      const visible = candidates.find((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
      });

      if (!visible) return;
      event.preventDefault();
      visible.focus();
      visible.select?.();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
