import { CancelButton, CheckInButton, SittingToggle } from './Buttons';
import { fmtDateTime, fmtTime } from '@/lib/format';
import { getSittings, listReservations, listWaitlist } from '@/lib/reservations';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Guest list', robots: { index: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const [sittings, all, waitlist] = await Promise.all([getSittings(), listReservations(), listWaitlist()]);
  const confirmed = all.filter((r) => r.status === 'confirmed');
  const guests = confirmed.reduce((n, r) => n + r.party_size, 0);
  const arrived = confirmed.filter((r) => r.checked_in_at).reduce((n, r) => n + r.party_size, 0);
  const capacity = sittings.reduce((n, s) => n + s.capacity, 0);
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? all.filter((r) => [r.full_name, r.email, r.phone, r.code].some((f) => f.toLowerCase().includes(needle)))
    : all;

  return (
    <div className="door-list">
      <header>
        <h1 className="display">The guest list</h1>
        <a className="btn btn--line" href="/api/admin/export">Download CSV</a>
      </header>

      <dl className="door-list__totals mono">
        <div><dt>Seats reserved</dt><dd>{guests} / {capacity}</dd></div>
        <div><dt>Seats left</dt><dd>{capacity - guests}</dd></div>
        <div><dt>Reservations</dt><dd>{confirmed.length}</dd></div>
        <div><dt>Checked in</dt><dd>{arrived}</dd></div>
      </dl>

      <h2 className="display">Sittings</h2>
      <div className="door-list__scroll"><table>
        <thead><tr className="mono"><th>Sitting</th><th>Time</th><th>Reserved</th><th>Left</th><th>Bookings</th><th /></tr></thead>
        <tbody>
          {sittings.map((s) => (
            <tr key={s.id}>
              <td className="door-list__name">{s.label}</td><td className="mono">{fmtTime(s.starts_at)}</td>
              <td>{s.taken} / {s.capacity}</td><td>{s.seats_left}</td>
              <td><span className={`pill ${s.is_open ? 'pill--ok' : ''}`}>{s.is_open ? 'Open' : 'Closed'}</span></td>
              <td><SittingToggle id={s.id} open={s.is_open} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <div className="door-list__bar">
        <h2 className="display">Reservations</h2>
        <form className="door-list__search">
          <input name="q" defaultValue={q} placeholder="Search name, email, phone or code" aria-label="Search reservations" />
        </form>
      </div>
      <div className="door-list__scroll"><table>
        <thead><tr className="mono"><th>Guest</th><th>Contact</th><th>Sitting</th><th>Party</th><th>Notes</th><th>Code</th><th>Status</th><th /></tr></thead>
        <tbody>
          {shown.length === 0 && <tr><td colSpan={8} className="door-list__empty">No reservations yet. The first name will show up here.</td></tr>}
          {shown.map((r) => (
            <tr key={r.id} className={r.status === 'cancelled' ? 'is-cancelled' : ''}>
              <td><span className="door-list__name">{r.full_name}</span><br /><small>{fmtDateTime(r.created_at)}</small></td>
              <td><small>{r.email}<br />+{r.phone}</small></td>
              <td className="mono">{fmtTime(r.starts_at)}</td>
              <td>{r.party_size}</td>
              <td><small>{[r.occasion, r.notes].filter(Boolean).join(' · ')}</small></td>
              <td className="mono">{r.code}</td>
              <td>
                {r.status === 'cancelled' ? <span className="pill">Cancelled</span>
                  : r.checked_in_at ? <span className="pill pill--ok">Arrived {fmtTime(r.checked_in_at)}</span>
                  : <span className="pill">Confirmed</span>}
              </td>
              <td>
                {r.status === 'confirmed' && (
                  <div className="row-actions">
                    <CheckInButton code={r.code} checkedIn={!!r.checked_in_at} />
                    {!r.checked_in_at && <CancelButton code={r.code} name={r.full_name} />}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <h2 className="display">Waitlist ({waitlist.length})</h2>
      <div className="door-list__scroll"><table>
        <thead><tr className="mono"><th>Name</th><th>Email</th><th>Phone</th><th>Party</th><th>Joined</th></tr></thead>
        <tbody>
          {waitlist.length === 0 && <tr><td colSpan={5} className="door-list__empty">Nobody on the waitlist.</td></tr>}
          {waitlist.map((w) => (
            <tr key={w.id}><td className="door-list__name">{w.full_name}</td><td>{w.email}</td><td>+{w.phone}</td><td>{w.party_size}</td><td className="mono">{fmtDateTime(w.created_at)}</td></tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
