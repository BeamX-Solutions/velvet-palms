import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { event } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="footer" id="visit">
      <BrandLogo className="wordmark" title="Velvet Palms Restaurant and Lounge, since 2025" />
      <p className="mono footer__since">Opening Night · {event.openingNight.dateLabel}</p>
      <Link href="/#reserve" className="btn btn--line">Reserve for opening night</Link>
      <p className="mono footer__note" style={{ marginTop: 0 }}>{event.address}</p>
      <ul className="footer__links mono">
        <li><a href={`tel:${event.phone.replace(/\s/g, '')}`}>{event.phone}</a></li>
        <li><a href={`mailto:${event.email}`}>{event.email}</a></li>
        <li><a href={`https://www.instagram.com/${event.instagram}`} target="_blank" rel="noreferrer">@{event.instagram}</a></li>
      </ul>
      <p className="footer__legal">© {new Date().getFullYear()} Velvet Palms Restaurant &amp; Lounge. All rights reserved.</p>
    </footer>
  );
}
