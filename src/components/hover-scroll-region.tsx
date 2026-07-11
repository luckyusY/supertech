"use client";

import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type HoverScrollRegionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Which axes can trap the wheel while hovered */
  axis?: "y" | "x" | "both";
  /** Soft ring on hover so the active scroll target is obvious */
  highlightOnHover?: boolean;
};

/**
 * When the pointer is over this region, wheel/trackpad scrolls *this* pane
 * instead of the page — until the edge is reached.
 */
export function HoverScrollRegion({
  children,
  className,
  axis = "both",
  highlightOnHover = true,
  ...rest
}: HoverScrollRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // allow browser zoom

      const dy = event.deltaY;
      const dx = event.deltaX;
      const absY = Math.abs(dy);
      const absX = Math.abs(dx);

      // Prefer the dominant axis (trackpads send both)
      const preferY = absY >= absX;

      if (preferY && axis !== "x") {
        const maxY = el.scrollHeight - el.clientHeight;
        if (maxY > 1) {
          const atTop = el.scrollTop <= 0;
          const atBottom = el.scrollTop >= maxY - 1;
          const canUp = dy < 0 && !atTop;
          const canDown = dy > 0 && !atBottom;
          if (canUp || canDown) {
            event.preventDefault();
            event.stopPropagation();
            el.scrollTop = Math.min(maxY, Math.max(0, el.scrollTop + dy));
            return;
          }
        }
      }

      if ((!preferY || axis === "x") && axis !== "y") {
        const maxX = el.scrollWidth - el.clientWidth;
        if (maxX > 1) {
          const delta = absX > 0 ? dx : dy;
          const atStart = el.scrollLeft <= 0;
          const atEnd = el.scrollLeft >= maxX - 1;
          const canLeft = delta < 0 && !atStart;
          const canRight = delta > 0 && !atEnd;
          if (canLeft || canRight) {
            event.preventDefault();
            event.stopPropagation();
            el.scrollLeft = Math.min(maxX, Math.max(0, el.scrollLeft + delta));
          }
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [axis]);

  return (
    <div
      ref={ref}
      className={cn(
        "hover-scroll-region min-h-0",
        highlightOnHover &&
          "rounded-[inherit] transition-[box-shadow,background-color] duration-150 hover:shadow-[inset_0_0_0_1px_rgba(232,119,10,0.28)]",
        className,
      )}
      data-hover-scroll=""
      {...rest}
    >
      {children}
    </div>
  );
}
