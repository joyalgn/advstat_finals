"use client";

import { useEffect, type RefObject } from "react";

export function useCanvasRedraw<T extends HTMLCanvasElement>(
  ref: RefObject<T | null>,
  draw: (duration?: number) => void,
  redrawKey: unknown,
): void {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    draw();
    let firstResize = true;
    const observer = new ResizeObserver(() => {
      if (firstResize) {
        firstResize = false;
        return;
      }
      draw(0);
    });
    observer.observe(canvas);
    const redrawForTheme = () => draw(0);
    window.addEventListener("advstat-theme-change", redrawForTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("advstat-theme-change", redrawForTheme);
    };
  }, [ref, draw, redrawKey]);
}