'use client';

export type CardData = {
  name: string;
  party: number;
  sitting: string; // e.g. "First sitting"
  time: string; // e.g. "6:30 pm"
  date: string; // e.g. "Saturday, 12 December 2026"
};

/** Draws a 9:16 card for stories and saves or shares it. */
async function storyCard(c: CardData) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const css = getComputedStyle(document.documentElement);
  const font = (v: string) => css.getPropertyValue(v).trim() || 'serif';
  const display = font('--font-display');
  const script = font('--font-script');
  const mono = font('--font-mono');
  await Promise.all([
    document.fonts.load(`400 100px ${display}`),
    document.fonts.load(`italic 400 100px ${display}`),
    document.fonts.load(`400 100px ${script}`),
    document.fonts.load(`400 30px ${mono}`),
  ]).catch(() => {});

  ctx.fillStyle = '#011c13';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 0, W / 2, 520, 1100);
  glow.addColorStop(0, 'rgba(40,92,68,0.55)');
  glow.addColorStop(1, 'rgba(1,28,19,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(184,155,94,0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = 'rgba(184,155,94,0.35)';
  ctx.strokeRect(64, 64, W - 128, H - 128);

  const mark = new Image();
  mark.src = '/brand/emblem.svg';
  await mark.decode().catch(() => {});
  if (mark.naturalWidth) ctx.drawImage(mark, W / 2 - 83, 220, 166, 231);

  ctx.textAlign = 'center';
  const spaced = (px: string) => ((ctx as unknown as { letterSpacing: string }).letterSpacing = px);

  spaced('9px');
  ctx.fillStyle = '#b89b5e';
  ctx.font = `400 30px ${mono}`;
  ctx.fillText('OPENING NIGHT', W / 2, 610);
  spaced('0px');
  ctx.fillStyle = '#efe7d3';
  ctx.font = `400 46px ${display}`;
  ctx.fillText(c.date, W / 2, 690);

  let size = 300;
  do {
    ctx.font = `400 ${size}px ${script}`;
    size -= 10;
  } while (ctx.measureText(c.name).width > 860 && size > 90);
  ctx.fillStyle = '#dcc48e';
  ctx.fillText(c.name, W / 2, 1040);

  ctx.fillStyle = '#efe7d3';
  ctx.font = `italic 400 84px ${display}`;
  ctx.fillText('has a seat.', W / 2, 1220);

  ctx.fillStyle = 'rgba(184,155,94,0.5)';
  ctx.fillRect(W / 2 - 60, 1320, 120, 2);

  spaced('6px');
  ctx.fillStyle = '#b89b5e';
  ctx.font = `400 28px ${mono}`;
  ctx.fillText(`PARTY OF ${c.party}  ·  ${c.time.toUpperCase()}`, W / 2, 1410);
  ctx.fillText(c.sitting.toUpperCase(), W / 2, 1462);
  ctx.fillStyle = 'rgba(239,231,211,0.6)';
  ctx.fillText('VELVET PALMS  —  RESTAURANT & LOUNGE', W / 2, 1792);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const file = new File([blob], 'velvet-palms-opening-night.png', { type: 'image/png' });
  // Phones get the share sheet (straight to stories); desktops get a download.
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SaveCardButton({ data }: { data: CardData }) {
  return (
    <button type="button" className="btn small" onClick={() => storyCard(data)}>
      Save my card
    </button>
  );
}
