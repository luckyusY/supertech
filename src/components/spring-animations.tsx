"use client";

import { useSpring, animated, SpringConfig } from "@react-spring/web";
import { CSSProperties, ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
  className?: string;
  threshold?: number;
};

const defaultConfig: SpringConfig = {
  tension: 120,
  friction: 14,
};

export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  style,
  className = "",
  threshold = 0.1,
}: FadeInProps) {
  const [springStyle, api] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: defaultConfig,
    delay,
    immediate: false,
  }));

  return (
    <animated.div
      ref={(node) => {
        if (node) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                api.start();
                observer.disconnect();
              }
            },
            { threshold }
          );
          observer.observe(node);
        }
      }}
      style={{ ...springStyle, ...style }}
      className={className}
    >
      {children}
    </animated.div>
  );
}

type SlideInProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function SlideIn({
  children,
  direction = "up",
  distance = 40,
  delay = 0,
  className = "",
  style,
}: SlideInProps) {
  const directionValues = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
  };

  const fromValues = directionValues[direction];

  const [springStyle, api] = useSpring(() => ({
    from: { opacity: 0, ...fromValues },
    to: { opacity: 1, x: 0, y: 0 },
    config: defaultConfig,
    delay,
  }));

  return (
    <animated.div
      ref={(node) => {
        if (node) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                api.start();
                observer.disconnect();
              }
            },
            { threshold: 0.1 }
          );
          observer.observe(node);
        }
      }}
      style={{ ...springStyle, ...style }}
      className={className}
    >
      {children}
    </animated.div>
  );
}

type ScaleInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function ScaleIn({ children, delay = 0, className = "", style }: ScaleInProps) {
  const [springStyle, api] = useSpring(() => ({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    config: { tension: 150, friction: 12 },
    delay,
  }));

  return (
    <animated.div
      ref={(node) => {
        if (node) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                api.start();
                observer.disconnect();
              }
            },
            { threshold: 0.1 }
          );
          observer.observe(node);
        }
      }}
      style={{ ...springStyle, ...style }}
      className={className}
    >
      {children}
    </animated.div>
  );
}

type HoverScaleProps = {
  children: ReactNode;
  scale?: number;
  className?: string;
  style?: CSSProperties;
};

export function HoverScale({ children, scale = 1.03, className = "", style }: HoverScaleProps) {
  const [springStyle, springApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 200, friction: 16 },
  }));

  return (
    <animated.div
      style={{ ...springStyle, ...style }}
      className={className}
      onMouseEnter={() => springApi.start({ scale })}
      onMouseLeave={() => springApi.start({ scale: 1 })}
    >
      {children}
    </animated.div>
  );
}
