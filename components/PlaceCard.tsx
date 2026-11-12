"use client";

import { useRef } from "react";
import { zoneName } from "@/lib/zones";
import { seatingById, site } from "@/site.config";

export type Saved = {
  number: number;
  name: string;
  party: number;
  seating: string;
  zone: string;
  existing?: boolean;
};

const no = (n: number) => `No. ${String(n).padStart(3, "0")}`;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function calendarFile(entry: Saved) {
  const seating = seatingById(entry.seating);
  const day = site.opening.doors.slice(0, 10);
  const start = new Date(`${day}T${seating?.start ?? "18:00"}:00`);
  const end = new Date(start.getTime() + 150 * 60 * 1000);
  // No timezone suffix: the event sits at this wall-clock time wherever it is opened.
  const stamp = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T` +
    `${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Velvet Palms//Opening Night//EN",
    "BEGIN:VEVENT",
    `UID:opening-night-${entry.number}@velvetpalms`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${site.name} — opening night`,
    `DESCRIPTION:${no(entry.number)} on the list. Party of ${entry.party}\\, ${seating?.label ?? ""}\\, ${zoneName(entry.zone)}. Requested\\, not yet confirmed — watch your email.`,
    site.address ? `LOCATION:${site.address.replace(/,/g, "\\,")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  download(new Blob([ics], { type: "text/calendar" }), "velvet-palms-opening-night.ics");
}

/** Draws a 9:16 card for stories and saves or shares it. */
async function storyCard(entry: Saved) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const css = getComputedStyle(document.documentElement);
  const font = (v: string) => css.getPropertyValue(v).trim() || "serif";
  const display = font("--font-display");
  const script = font("--font-script");
  const mono = font("--font-mono");
  await Promise.all([
    document.fonts.load(`400 100px ${display}`),
    document.fonts.load(`italic 400 100px ${display}`),
    document.fonts.load(`400 100px ${script}`),
    document.fonts.load(`400 30px ${mono}`),
  ]).catch(() => {});

  ctx.fillStyle = "#011c13";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 0, W / 2, 520, 1100);
  glow.addColorStop(0, "rgba(40,92,68,0.55)");
  glow.addColorStop(1, "rgba(1,28,19,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(184,155,94,0.8)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(184,155,94,0.35)";
  ctx.strokeRect(64, 64, W - 128, H - 128);

  const mark = new Image();
  mark.src = "/brand/mark-gold.svg";
  await mark.decode().catch(() => {});
  if (mark.naturalWidth) ctx.drawImage(mark, W / 2 - 76, 230, 152, 230);

  ctx.textAlign = "center";
  const spaced = (px: string) => ((ctx as unknown as { letterSpacing: string }).letterSpacing = px);

  spaced("9px");
  ctx.fillStyle = "#b89b5e";
  ctx.font = `400 30px ${mono}`;
  ctx.fillText("OPENING NIGHT", W / 2, 610);
  spaced("0px");
  ctx.fillStyle = "#efe7d3";
  ctx.font = `400 46px ${display}`;
  ctx.fillText(site.opening.dateLabel, W / 2, 690);

  let size = 300;
  do {
    ctx.font = `400 ${size}px ${script}`;
    size -= 10;
  } while (ctx.measureText(entry.name).width > 860 && size > 90);
  ctx.fillStyle = "#dcc48e";
  ctx.fillText(entry.name, W / 2, 1040);

  ctx.fillStyle = "#efe7d3";
  ctx.font = `italic 400 84px ${display}`;
  ctx.fillText("is on the list.", W / 2, 1220);

  ctx.fillStyle = "rgba(184,155,94,0.5)";
  ctx.fillRect(W / 2 - 60, 1320, 120, 2);

  const seating = seatingById(entry.seating);
  spaced("6px");
  ctx.fillStyle = "#b89b5e";
  ctx.font = `400 28px ${mono}`;
  ctx.fillText(
    `PARTY OF ${entry.party}  ·  ${seating ? `${seating.time} ${seating.meridiem}`.toUpperCase() : ""}`,
    W / 2,
    1410,
  );
  ctx.fillText(zoneName(entry.zone).toUpperCase(), W / 2, 1462);
  ctx.fillStyle = "rgba(239,231,211,0.6)";
  ctx.fillText(no(entry.number).toUpperCase(), W / 2, 1740);
  ctx.fillText(`${site.name}  —  ${site.descriptor}`.toUpperCase(), W / 2, 1792);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "velvet-palms-opening-night.png", { type: "image/png" });
  // Phones get the share sheet (straight to stories); desktops get a download.
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return;
    }
  }
  download(blob, file.name);
}

export function PlaceCard({ entry, onReset }: { entry: Saved; onReset: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const seating = seatingById(entry.seating);

  const tilt = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
  };
  const rest = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="done">
      <div className="done__card-wrap" onPointerMove={tilt} onPointerLeave={rest}>
        <div className="card" ref={card}>
          <span className="mark card__mark" aria-hidden="true" />
          <p className="mono card__for">Reserved for</p>
          <p className="card__name">{entry.name}</p>
          <p className="mono card__detail">
            Party of {entry.party}
            <i>·</i>
            {seating ? `${seating.time} ${seating.meridiem}` : ""}
            <i>·</i>
            {zoneName(entry.zone)}
          </p>
          <span className="mono card__no">{no(entry.number)}</span>
          <span className="mono card__date">{site.opening.shortLabel}</span>
        </div>
      </div>

      <div className="done__text">
        <h3 className="display">{entry.existing ? "You were already on it." : "You’re on the list."}</h3>
        <p>
          {entry.existing
            ? "That email was written down earlier, so we've kept your original place rather than move you back."
            : "Your name is written down and your place in line is held."}{" "}
          This is a request, not yet a table: we&rsquo;ll confirm by email as the room fills
          {site.address ? "." : ", and send the address with it."}
        </p>
        <div className="done__actions">
          <button type="button" className="btn btn--gold" onClick={() => storyCard(entry)}>
            Save my card
          </button>
          <button type="button" className="btn btn--line" onClick={() => calendarFile(entry)}>
            Add to calendar
          </button>
        </div>
        <button type="button" className="link" onClick={onReset}>
          Put another name down
        </button>
      </div>
    </div>
  );
}
