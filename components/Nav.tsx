import Link from 'next/link';
import BrandLogo from './BrandLogo';

const links = [
  { href: '/#room', label: 'The Room' },
];

function Links() {
  return (
    <div className="nav-links">
      {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      <Link href="/#reserve" className="btn small">Reserve</Link>
    </div>
  );
}

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/#top" className="brand" aria-label="Velvet Palms, back to top">
          <BrandLogo className="brand-mark" compact title="Velvet Palms" />
          <span className="brand-word">VELVET PALMS</span>
        </Link>
        <nav className="nav-desktop" aria-label="Main"><Links /></nav>
        <details className="nav-toggle">
          <summary>Menu</summary>
          <Links />
        </details>
      </div>
    </header>
  );
}
