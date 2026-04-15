"use client";

import { CSSProperties, ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
  className?: string;
  threshold?: number;
};

export function FadeIn({
  children,
  delay = 0,
  className = "",
  style,
}: FadeInProps) {
  return (
    <div
      style={{ 
        ...style, 
        animationDelay: `${delay}ms`,
        animation: `fadeInUp 0.5s ease-out ${delay}ms both`
      }}
      className={className}
    >
      {children}
    </div>
  );
}

type SlideInProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function SlideIn({
  children,
  className = "",
  style,
}: SlideInProps) {
  return (
    <div
      style={{ ...style, animation: "fadeInUp 0.5s ease-out both" }}
      className={className}
    >
      {children}
    </div>
  );
}

type ScaleInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function ScaleIn({ children, className = "", style }: ScaleInProps) {
  return (
    <div
      style={{ ...style, animation: "fadeInUp 0.5s ease-out both" }}
      className={className}
    >
      {children}
    </div>
  );
}

type HoverScaleProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function HoverScale({ children, className = "", style }: HoverScaleProps) {
  return (
    <div
      style={style}
      className={`${className} hover:scale-105 transition-transform duration-300`}
    >
      {children}
    </div>
  );
}
