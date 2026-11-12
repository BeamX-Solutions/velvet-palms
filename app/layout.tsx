import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, DM_Mono, Jost, Ms_Madi } from "next/font/google";
import { site } from "@/site.config";
import "./globals.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const script = Ms_Madi({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: `${site.name} — Opening night has a list`,
  description: `${site.name} ${site.descriptor} opens ${site.opening.dateLabel}. Walk the room, pick your spot, put your name down.`,
  openGraph: {
    title: `${site.name} — Opening night has a list`,
    description: `Doors open ${site.opening.dateLabel}. Put your name down.`,
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#011c13" };

// Runs before first paint: marks JS as available (so scroll reveals can hide
// content safely) and skips the doors for anyone who has already walked in.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('vp-in'))d.classList.add('seen');sessionStorage.setItem('vp-in','1')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${script.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
