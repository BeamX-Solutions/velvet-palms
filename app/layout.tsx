import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { siteUrl } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Velvet Palms Opening Night | 12 December 2026, Awka', template: '%s | Velvet Palms Opening Night' },
  description: 'Opening Night at Velvet Palms Restaurant & Lounge, Awka: Saturday 12 December 2026. Two sittings, 100 seats. Reserve yours free.',
  openGraph: {
    title: 'Velvet Palms Opening Night | 12 December 2026',
    description: 'Opening Night in Awka. 100 seats. Reserve yours.',
    images: ['/brand/logo-full.png'],
  },
};

export const viewport: Viewport = { themeColor: '#011c13' };

// Runs before first paint, on every full load or reload:
// - marks JS as available (so scroll reveals can hide content safely);
// - always starts at the top: no restored scroll position, and any #section in the address is
//   dropped before the browser can jump to it;
// - on the home page, opens the curtain, then clears the flag once it has finished so moving
//   around inside the site does not replay it.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if('scrollRestoration' in history)history.scrollRestoration='manual';if(location.hash)history.replaceState(null,'',location.pathname+location.search);}catch(e){}var top=function(){window.scrollTo({top:0,left:0,behavior:'instant'})};top();addEventListener('load',top);if(location.pathname==='/'){d.classList.add('doors-on');setTimeout(function(){d.classList.remove('doors-on')},3000)}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <Nav />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
