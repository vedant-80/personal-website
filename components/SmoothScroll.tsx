"use client";

import { useEffect } from "react";

/** Ease desktop wheel input while keeping the browser's native scrolling model. */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame: number | null = null;
    let target = window.scrollY;
    let lastPosition = window.scrollY;
    let previousTime = 0;

    const stop = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      target = window.scrollY;
    };
    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const tick = (time: number) => {
      // Native keyboard, scrollbar, navigation, or focus scrolling takes precedence.
      if (Math.abs(window.scrollY - lastPosition) > 2) {
        stop();
        return;
      }
      target = Math.min(maxScroll(), Math.max(0, target));
      const elapsed = Math.min(64, Math.max(1, time - previousTime));
      previousTime = time;
      const remaining = target - window.scrollY;
      const next = Math.abs(remaining) < 0.5 ? target : window.scrollY + remaining * (1 - Math.exp(-elapsed / 80));
      window.scrollTo({ top: next, behavior: "instant" });
      lastPosition = window.scrollY;
      if (Math.abs(target - lastPosition) < 0.5) {
        window.scrollTo({ top: target, behavior: "instant" });
        lastPosition = window.scrollY;
        frame = null;
      } else {
        frame = window.requestAnimationFrame(tick);
      }
    };
    const wheel = (event: WheelEvent) => {
      if (reducedMotion.matches || !finePointer.matches || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return;
      let element = event.target instanceof Element ? event.target : null;
      if (element?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox'], [role='slider'], [role='spinbutton']")) return;
      // Nested scrollers retain their native behavior, including boundary chaining.
      while (element && element !== document.body && element !== document.documentElement) {
        const overflow = window.getComputedStyle(element).overflowY;
        if (/(auto|scroll|overlay)/.test(overflow) && element.scrollHeight > element.clientHeight) return;
        element = element.parentElement;
      }
      if (frame === null) target = window.scrollY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const nextTarget = Math.min(maxScroll(), Math.max(0, target + event.deltaY * unit));
      if (nextTarget === target) return;
      event.preventDefault();
      target = nextTarget;
      if (frame === null) {
        lastPosition = window.scrollY;
        previousTime = performance.now();
        frame = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("hashchange", stop);
    window.addEventListener("blur", stop);
    reducedMotion.addEventListener("change", stop);
    finePointer.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("hashchange", stop);
      window.removeEventListener("blur", stop);
      reducedMotion.removeEventListener("change", stop);
      finePointer.removeEventListener("change", stop);
    };
  }, []);

  return null;
}
