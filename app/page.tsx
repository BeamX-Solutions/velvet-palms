import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { store } from "@/lib/store";
import { site } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function Page() {
  const count = await store.count().catch(() => 0);

  return (
    <>
      <div className="doors" aria-hidden="true">
        <div className="door door--l">
          <span className="door__mark" />
        </div>
        <div className="door door--r">
          <span className="door__mark" />
        </div>
      </div>

      <header className="nav">
        <a href="#top" className="nav__brand" aria-label={`${site.name}, back to top`}>
          <span className="mark" />
        </a>
        <span className="nav__date mono">Opening night · {site.opening.shortLabel}</span>
        <a href="#list" className="nav__cta mono">
          The list
        </a>
      </header>

      <main id="top">
        <Hero count={count} />
        <Experience />
      </main>

      <footer className="footer">
        <span className="wordmark" role="img" aria-label={`${site.name} ${site.descriptor}`} />
        <p className="mono footer__since">Since {site.since}</p>
        <ul className="footer__links mono">
          {site.address && <li>{site.address}</li>}
          {site.instagram && (
            <li>
              <a href={`https://instagram.com/${site.instagram}`} rel="noreferrer">
                @{site.instagram}
              </a>
            </li>
          )}
          {site.email && (
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          )}
        </ul>
        <p className="footer__note mono">(All dimensions are in millimetres. All evenings are approximate.)</p>
      </footer>
    </>
  );
}
