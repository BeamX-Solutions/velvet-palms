import { listReservations } from '@/lib/reservations';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const rows = await listReservations();
  const head = ['code', 'status', 'full_name', 'email', 'phone', 'party_size', 'sitting', 'starts_at', 'occasion', 'notes', 'checked_in_at', 'created_at'];
  const lines = rows.map((r) => [r.code, r.status, r.full_name, r.email, r.phone, r.party_size, r.sitting_label, r.starts_at, r.occasion, r.notes, r.checked_in_at, r.created_at].map(cell).join(','));
  return new Response([head.join(','), ...lines].join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="velvet-palms-opening-night.csv"',
    },
  });
}
