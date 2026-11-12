"use client";

import { useEffect, useRef } from "react";

/**
 * The hero is upholstered. Dragging a pointer across it brushes the nap of the
 * velvet: with the grain it catches the light, against it goes dark, and the
 * pile slowly settles back. Drawn at a quarter resolution so the browser's own
 * upscaling does the softening.
 */
export function Velvet() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SCALE = 0.25;
    let last: { x: number; y: number } | null = null;
    let idleFrames = 0;
    let raf = 0;

    const resize = () => {
      canvas.width = Math.ceil(host.clientWidth * SCALE);
      canvas.height = Math.ceil(host.clientHeight * SCALE);
    };

    const settle = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      idleFrames += 1;
      raf = idleFrames < 240 ? requestAnimationFrame(settle) : 0;
    };

    const brush = (e: PointerEvent) => {
      const box = host.getBoundingClientRect();
      const x = (e.clientX - box.left) * SCALE;
      const y = (e.clientY - box.top) * SCALE;
      if (last) {
        const withGrain = x - last.x + (last.y - y) * 0.6 > 0;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = withGrain ? "rgba(74,140,104,0.5)" : "rgba(0,6,4,0.6)";
        ctx.lineWidth = 26;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      last = { x, y };
      idleFrames = 0;
      if (!raf) raf = requestAnimationFrame(settle);
    };

    const lift = () => (last = null);

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener("pointermove", brush);
    host.addEventListener("pointerleave", lift);
    return () => {
      ro.disconnect();
      host.removeEventListener("pointermove", brush);
      host.removeEventListener("pointerleave", lift);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="velvet" aria-hidden="true" />;
}
