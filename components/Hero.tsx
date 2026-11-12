import { site } from "@/site.config";
import { Countdown } from "./Countdown";
import { Velvet } from "./Velvet";

export function Hero({ count }: { count: number }) {
  return (
    <section className="hero">
      <Velvet />

      <div className="hero__body">
        <p className="hero__eyebrow mono rise" style={{ "--i": 0 } as React.CSSProperties}>
          {site.name} {site.descriptor} — {site.opening.dateLabel}
        </p>

        <h1 className="hero__title">
          <span className="rise" style={{ "--i": 1 } as React.CSSProperties}>
            Opening night
          </span>
          <span className="rise" style={{ "--i": 2 } as React.CSSProperties}>
            has a <em>list.</em>
          </span>
          <span className="hero__script rise" style={{ "--i": 4 } as React.CSSProperties}>
            your name isn&rsquo;t on it yet
          </span>
        </h1>

        <div className="hero__foot rise" style={{ "--i": 5 } as React.CSSProperties}>
          <div className="hero__actions">
            <a href="#list" className="btn btn--gold">
              Put my name down
            </a>
            <a href="#room" className="link">
              Walk the room first
            </a>
          </div>

          <dl className="hero__facts mono">
            <div>
              <dt>Doors in</dt>
              <dd>
                <Countdown to={site.opening.doors} />
              </dd>
            </div>
            <div>
              <dt>On the list</dt>
              <dd>{count === 0 ? "Nobody. Be first." : `${count} ${count === 1 ? "name" : "names"} so far`}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="dim rise" style={{ "--i": 6 } as React.CSSProperties} aria-hidden="true">
        <span className="dim__label mono">{site.roomWidthMm.toLocaleString("en-GB")}</span>
      </div>
      <p className="hero__dimnote mono rise" style={{ "--i": 6 } as React.CSSProperties}>
        The room, wall to wall, in millimetres. One night to fill it.
      </p>
    </section>
  );
}
