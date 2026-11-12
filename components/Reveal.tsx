"use client";

import { useEffect, useRef, useState } from "react";

/** Adds `in` the first time the element scrolls into view. */
export function Reveal({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: {
  as?: "div" | "section";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`reveal ${seen ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** The title block from the architect's sheets: a numbered circle, a name, a small aside. */
export function Sheet({ no, title, note }: { no: string; title: string; note: string }) {
  return (
    <div className="sheet">
      <span className="sheet__no">{no}</span>
      <div className="sheet__text">
        <h2 className="sheet__title mono">{title}</h2>
        <p className="sheet__note mono">{note}</p>
      </div>
    </div>
  );
}
