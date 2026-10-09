"use client";

import { useEffect, useRef } from "react";

/** Decorative atmosphere; pointer tracking stays outside React's render loop. */
export function AmbientBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let enabled = finePointer.matches && !reducedMotion.matches;
    let frame: number | null = null;
    let x = 0;
    let y = 0;

    const hide = () => {
      glow.style.opacity = "0";
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };
    const updatePreference = () => {
      enabled = finePointer.matches && !reducedMotion.matches;
      if (!enabled) hide();
    };
    const move = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        glow.style.opacity = "1";
        frame = null;
      });
    };
    const leave = (event: PointerEvent) => {
      if (event.relatedTarget === null) hide();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", hide);
    reducedMotion.addEventListener("change", updatePreference);
    finePointer.addEventListener("change", updatePreference);

    return () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      reducedMotion.removeEventListener("change", updatePreference);
      finePointer.removeEventListener("change", updatePreference);
    };
  }, []);

  return (
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-background__wash" />
      <svg
        className="ambient-background__contours"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        focusable="false"
      >
        <g stroke="#772b43" strokeWidth="1">
          {Array.from({ length: 18 }, (_, index) => (
            <path
              key={index}
              d="M -250 610 C 80 190, 310 870, 660 500 S 1230 220, 1710 630"
              transform={`translate(0 ${index * 32 - 240})`}
              opacity={0.24 + (index % 4) * 0.05}
            />
          ))}
        </g>
      </svg>
      <div ref={glowRef} className="ambient-background__glow" />
      <style>{`
        .ambient-background {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          background: #080809;
        }
        .ambient-background__wash {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 85% 20%, rgba(94, 24, 44, .13), transparent 58%);
        }
        .ambient-background__contours {
          position: absolute;
          inset: -5%;
          width: 110%;
          height: 110%;
          opacity: .6;
          animation: ambient-contour-drift 18s ease-in-out infinite alternate;
        }
        .ambient-background__glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 640px;
          height: 640px;
          border-radius: 50%;
          opacity: 0;
          background: radial-gradient(circle, rgba(132, 34, 61, .23), rgba(95, 24, 43, .11) 32%, transparent 68%);
          transition: opacity 400ms ease;
          will-change: transform;
        }
        @keyframes ambient-contour-drift {
          from { transform: translate3d(-1%, -1%, 0) rotate(-2deg); }
          to { transform: translate3d(1%, 1%, 0) rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-background__contours { animation: none; }
          .ambient-background__glow { display: none; transition: none; }
        }
        @media (hover: none), (pointer: coarse) {
          .ambient-background__glow { display: none; }
        }
      `}</style>
    </div>
  );
}
