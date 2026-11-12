import Link from 'next/link';
import { CheckInButton } from '../../Buttons';
import BrandLogo from '@/components/BrandLogo';
import { fmtTime } from '@/lib/format';
import { getReservation } from '@/lib/reservations';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Check-in', robots: { index: false } };

// Staff scan a guest's QR code with any phone camera; it opens this page.
export default async function CheckIn({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const r = await getReservation(code);
  return (
    <div className="door-list">
      <div className="checkin">
        <BrandLogo className="mark" compact title="Velvet Palms" />
        {!r ? (
          <>
            <h1 className="display" style={{ fontSize: '2.6rem', fontStyle: 'italic' }}>Not on the list.</h1>
            <p className="mono">{code}</p>
          </>
        ) : (
          <>
            <p className="mono" style={{ color: 'var(--gold)' }}>Door check-in</p>
            <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 7vw, 3.6rem)', fontStyle: 'italic' }}>{r.full_name}</h1>
            <p className="mono">{r.sitting_label} · {fmtTime(r.starts_at)}</p>
            <p className="checkin__party">{r.party_size}</p>
            <p className="mono">{r.party_size === 1 ? 'guest' : 'guests'}</p>
            {(r.occasion || r.notes) && <p className="notice">{[r.occasion, r.notes].filter(Boolean).join(' · ')}</p>}
            {r.status === 'cancelled' ? (
              <div className="notice notice--error">This reservation was cancelled.</div>
            ) : (
              <>
                {r.checked_in_at && <p className="pill pill--ok">Checked in at {fmtTime(r.checked_in_at)}</p>}
                <CheckInButton code={r.code} checkedIn={!!r.checked_in_at} big />
              </>
            )}
          </>
        )}
        <Link href="/admin" className="link">Back to guest list</Link>
      </div>
    </div>
  );
}
