import ReservationForm from './_reserve/ReservationForm';
import BrandLogo from '@/components/BrandLogo';
import Countdown from '@/components/Countdown';
import PalmFrond from '@/components/PalmFrond';
import { Reveal, Sheet } from '@/components/Reveal';
import RoomExplorer from '@/components/RoomExplorer';
import { event } from '@/lib/config';
import { fmtTime } from '@/lib/format';
import { safeSittings } from '@/lib/reservations';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sittings = await safeSittings();
  const views = (sittings ?? []).map((s) => ({
    id: s.id, label: s.label, time: fmtTime(s.starts_at), seatsLeft: s.seats_left, capacity: s.capacity, open: s.is_open,
  }));
  const total = views.reduce((n, s) => n + s.capacity, 0) || event.openingNight.totalSeats;
  const left = sittings ? views.reduce((n, s) => n + (s.open ? s.seatsLeft : 0), 0) : null;

  return (
    <>
      <div className="doors" aria-hidden="true">
        <div className="door door--l"><span className="door__mark" /></div>
        <div className="door door--r"><span className="door__mark" /></div>
      </div>

      <section className="hero">
        <PalmFrond className="hero-frond left" />
        <PalmFrond className="hero-frond right" />
        <div className="container">
          <BrandLogo className="hero-logo" title="Velvet Palms Restaurant and Lounge" />
          <p className="lead">
            An evening of fire, flavour and gold-lit velvet in the heart of Awka.
            Opening Night is {event.openingNight.dateLabel.replace('Saturday, ', '')}.
          </p>
          <Countdown dateISO={event.openingNight.dateISO} />
          <div className="actions">
            <a href="#reserve" className="btn">Reserve for Opening Night</a>
            <a href="#room" className="btn ghost">Walk the room</a>
          </div>
          {left !== null && (
            <p className="seats">
              {left === 0 ? 'Opening Night is fully reserved. Join the waitlist.'
                : left <= 30 ? <>Only <span className="gold">{left}</span> seats remain</>
                : <><span className="gold">{left}</span> of {total} seats available</>}
            </p>
          )}
        </div>
      </section>

      <Reveal as="section" className="section room" id="room">
        <Sheet no="01" title="The room" note="(Tap an area to learn more)" />
        <div className="room__intro">
          <h3 className="display">
            Take a look around.
          </h3>
          <p>
            Here&rsquo;s the layout of Velvet Palms. Pick an area to see what it&rsquo;s like and who it suits best.
          </p>
        </div>
        <RoomExplorer />
      </Reveal>

      <Reveal as="section" className="section section--last" id="reserve">
        <Sheet no="02" title="Reserve for opening night" note="(Opening Night only. Free of charge)" />
        <div className="split split--top">
          <div>
            <span className="script" style={{ fontSize: 'clamp(3rem, 7vw, 4.6rem)' }}>Opening Night</span>
            <h2 style={{ margin: '6px 0 26px' }}>{event.openingNight.dateLabel}</h2>
            <ul className="details-list">
              <li><span>Sittings</span><span>{views.length ? views.map((s) => `${s.time} (${s.label.toLowerCase()})`).join(' · ') : 'To be announced'}</span></li>
              <li><span>Seats</span><span>{total} across {views.length || 'two'} sittings</span></li>
              <li><span>Guests</span><span>Up to {event.openingNight.maxPartySize} per reservation</span></li>
              <li><span>Dress code</span><span>{event.openingNight.dressCode}</span></li>
              <li><span>Location</span><span>{event.address}</span></li>
              <li><span>Entry</span><span>Show the QR code from your confirmation at the door</span></li>
            </ul>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: 18 }}>Details may change. Guests with reservations will be notified by email.</p>
          </div>

          <div className="form-card">
            <span className="eyebrow">Reserve</span>
            <h2 style={{ fontSize: '2.2rem', margin: '14px 0 26px' }}>Claim your seat</h2>
            {sittings === null ? (
              <div className="notice error">Reservations are temporarily unavailable. Please try again shortly.</div>
            ) : (
              <ReservationForm sittings={views} maxParty={event.openingNight.maxPartySize} />
            )}
          </div>
        </div>
      </Reveal>
    </>
  );
}
