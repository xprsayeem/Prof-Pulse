"use client";

import { useEffect, useState, useRef, RefObject } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

interface UseStaggeredAnimationOptions {
  count: number;
  baseDelay?: number;
  staggerDelay?: number;
  threshold?: number;
  once?: boolean;
}

export function useStaggeredAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseStaggeredAnimationOptions
): [RefObject<T | null>, number[]] {
  const { count, baseDelay = 0, staggerDelay = 0.1, threshold = 0.1, once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  const delays = isVisible
    ? Array.from({ length: count }, (_, i) => baseDelay + i * staggerDelay)
    : Array.from({ length: count }, () => 0);

  return [ref, delays];
}
