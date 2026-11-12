import type { Metadata } from "next";
import { doorIsOpen, store } from "@/lib/store";
import { zoneName } from "@/lib/zones";
import { seatingById, site } from "@/site.config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The door list", robots: { index: false, follow: false } };

export default async function Door({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;

  if (!doorIsOpen(key)) {
    return (
      <main className="door-list door-list--locked">
        <span className="mark" />
        <h1 className="display">Not on the list.</h1>
        <form>
          <input name="key" type="password" placeholder="Door key" aria-label="Door key" autoFocus />
          <button className="btn btn--gold">Open</button>
        </form>
      </main>
    );
  }

  const entries = await store.all();
  const covers = entries.reduce((n, e) => n + e.party, 0);
  const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="door-list">
      <header>
        <h1 className="display">The door list</h1>
        <a className="btn btn--line" href={`/api/export${key ? `?key=${encodeURIComponent(key)}` : ""}`}>
          Download CSV
        </a>
      </header>

      <dl className="door-list__totals mono">
        <div>
          <dt>Names</dt>
          <dd>{entries.length}</dd>
        </div>
        <div>
          <dt>Covers</dt>
          <dd>{covers}</dd>
        </div>
        {site.seatings.map((s) => (
          <div key={s.id}>
            <dt>
              {s.time} {s.meridiem}
            </dt>
            <dd>{entries.filter((e) => e.seating === s.id).reduce((n, e) => n + e.party, 0)}</dd>
          </div>
        ))}
      </dl>

      {entries.length === 0 ? (
        <p className="door-list__empty">Nobody yet. The first name will show up here.</p>
      ) : (
        <div className="door-list__scroll">
          <table>
            <thead>
              <tr className="mono">
                <th>No.</th>
                <th>Name</th>
                <th>Party</th>
                <th>Seating</th>
                <th>Where</th>
                <th>Contact</th>
                <th>Note</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.number}>
                  <td className="mono">{String(e.number).padStart(3, "0")}</td>
                  <td className="door-list__name">{e.name}</td>
                  <td>{e.party}</td>
                  <td>{seatingById(e.seating)?.label ?? e.seating}</td>
                  <td>{zoneName(e.zone)}</td>
                  <td>
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                    {e.phone && <span> · {e.phone}</span>}
                  </td>
                  <td>{e.note}</td>
                  <td className="mono">{when.format(new Date(e.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
