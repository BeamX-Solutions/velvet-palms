import { store, doorIsOpen } from "@/lib/store";
import { zoneName } from "@/lib/zones";
import { seatingById } from "@/site.config";

// Quote every cell, and defuse anything a spreadsheet would run as a formula.
const cell = (v: string | number) => {
  const s = String(v);
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!doorIsOpen(new URL(req.url).searchParams.get("key"))) {
    return new Response("Not on the list.", { status: 401 });
  }
  const rows = await store.all();
  const csv = [
    ["No.", "Name", "Party", "Seating", "Where", "Email", "Phone", "Note", "Added"].map(cell).join(","),
    ...rows.map((e) =>
      [
        e.number,
        e.name,
        e.party,
        seatingById(e.seating)?.label ?? e.seating,
        zoneName(e.zone),
        e.email,
        e.phone,
        e.note,
        e.createdAt,
      ]
        .map(cell)
        .join(","),
    ),
  ].join("\r\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="velvet-palms-opening-night.csv"',
      "cache-control": "no-store",
    },
  });
}
