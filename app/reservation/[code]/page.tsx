import Link from 'next/link';
import { notFound } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import CancelButton from './CancelButton';
import { SaveCardButton, type CardData } from './StoryCard';
import ScrollTop from '@/components/ScrollTop';
import { event } from '@/lib/config';
import { fmtDate, fmtTime } from '@/lib/format';
import { getReservation } from '@/lib/reservations';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your reservation', robots: { index: false } };

function gcalLink(start: Date, code: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + 2.5 * 3600_000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: 'Velvet Palms: Opening Night', dates: `${f(s)}/${f(e)}`,
    details: `Reservation ${code}. Show your QR code at the door.`, location: event.address,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default async function ReservationPage({ params, searchParams }: {
  params: Promise<{ code: string }>; searchParams: Promise<{ new?: string }>;
}) {
  const { code } = await params;
  const { new: isNew } = await searchParams;
  const r = await getReservation(code);
  if (!r) notFound();
  const cancelled = r.status === 'cancelled';
  const card: CardData = {
    name: r.full_name, party: r.party_size, sitting: r.sitting_label,
    time: fmtTime(r.starts_at).toLowerCase(), date: fmtDate(r.starts_at),
  };

  return (
    <section className="ticket-page">
      <ScrollTop />
      <div className="container">
        <div className="center" style={{ marginBottom: 40 }}>
          <span className="script" style={{ fontSize: '3.6rem' }}>{cancelled ? 'Cancelled' : isNew ? 'You’re on the list' : 'Your reservation'}</span>
          {isNew && !cancelled && (
            <p className="lead" style={{ margin: '8px auto 0' }}>
              Thank you, {r.full_name.split(' ')[0]}.{process.env.RESEND_API_KEY ? ` A confirmation has been sent to ${r.email}.` : ''} Save this page or screenshot your code.
            </p>
          )}
        </div>
        <div className="ticket">
          <BrandLogo className="ticket-mark" compact title="Velvet Palms" />
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Opening Night</p>
          <h2 style={{ fontSize: '2rem', marginTop: 10 }}>{fmtDate(r.starts_at)}</h2>
          <p className="muted" style={{ margin: '8px 0 0' }}>
            {r.sitting_label} · {fmtTime(r.starts_at)} · {r.party_size} {r.party_size === 1 ? 'guest' : 'guests'}
          </p>
          {cancelled ? (
            <div className="notice" style={{ marginTop: 28 }}>This reservation was cancelled and its seats released.</div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qr" src={`/api/qr/${r.code}`} alt={`QR code for reservation ${r.code}`} />
              <p className="code">{r.code}</p>
              <p className="muted" style={{ fontSize: '0.9rem', margin: '14px 0 0' }}>Reserved for {r.full_name}</p>
              {r.checked_in_at && <p className="pill ok" style={{ marginTop: 14 }}>Checked in</p>}
            </>
          )}
        </div>
        <div className="center" style={{ marginTop: 34, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!cancelled && <a className="btn small" href={gcalLink(r.starts_at, r.code)} target="_blank" rel="noreferrer">Add to calendar</a>}
          {!cancelled && <SaveCardButton data={card} />}
          {!cancelled && !r.checked_in_at && <CancelButton code={r.code} />}
          {cancelled && <Link className="btn small" href="/#reserve">Back to Opening Night</Link>}
        </div>
        <p className="muted center" style={{ marginTop: 30, fontSize: '0.85rem' }}>Dress code: {event.openingNight.dressCode}</p>
      </div>
    </section>
  );
}
