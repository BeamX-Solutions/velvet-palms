import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { zones, ANYWHERE } from "@/lib/zones";
import { site } from "@/site.config";

const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "We couldn't read that. Try again?" }, { status: 400 });
  }

  // Honeypot: real guests never see this field, so anything in it is a bot.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true, number: 0 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (tooMany(ip)) {
    return NextResponse.json(
      { error: "That's a lot of names from one place. Give it ten minutes." },
      { status: 429 },
    );
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 30);
  const note = clean(body.note, 400);
  const party = Number(body.party);
  const seating = clean(body.seating, 20);
  const zone = clean(body.zone, 20);

  if (name.length < 2) {
    return NextResponse.json({ error: "We need a name to put on the list.", field: "name" }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right.", field: "email" }, { status: 422 });
  }
  if (!Number.isInteger(party) || party < 1 || party > site.maxParty) {
    return NextResponse.json({ error: `Parties of 1 to ${site.maxParty}, please.`, field: "party" }, { status: 422 });
  }
  if (!site.seatings.some((s) => s.id === seating)) {
    return NextResponse.json({ error: "Pick a seating.", field: "seating" }, { status: 422 });
  }
  if (zone !== ANYWHERE && !zones.some((z) => z.id === zone)) {
    return NextResponse.json({ error: "Pick a spot in the room.", field: "zone" }, { status: 422 });
  }

  try {
    const { entry, existing } = await store.add({ name, email, phone, party, seating, zone, note });
    // A repeat email keeps its original place. Echo back what was just typed
    // rather than the stored row, so nobody can look up another guest by email.
    return NextResponse.json({ ok: true, existing, number: entry.number, name, party, seating, zone });
  } catch (err) {
    console.error("reserve failed", err);
    return NextResponse.json(
      { error: "The list jammed on our side. Nothing was saved — please try again." },
      { status: 500 },
    );
  }
}
