import { promises as fs } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

export type Entry = {
  number: number;
  name: string;
  email: string;
  phone: string;
  party: number;
  seating: string;
  zone: string;
  note: string;
  createdAt: string;
};

export type NewEntry = Omit<Entry, "number" | "createdAt">;

type Store = {
  add(entry: NewEntry): Promise<{ entry: Entry; existing: boolean }>;
  all(): Promise<Entry[]>;
  count(): Promise<number>;
};

/* ---------- Local JSON file: development and single-server hosting ---------- */

const FILE = path.join(process.cwd(), ".data", "reservations.json");
let queue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

const fileStore: Store = {
  add(input) {
    // Writes are chained so two signups in the same instant can't clobber each other.
    const run = queue.then(async () => {
      const entries = await readFile();
      const found = entries.find((e) => e.email === input.email);
      if (found) return { entry: found, existing: true };
      const entry: Entry = {
        ...input,
        number: (entries.at(-1)?.number ?? 0) + 1,
        createdAt: new Date().toISOString(),
      };
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify([...entries, entry], null, 2));
      return { entry, existing: false };
    });
    queue = run.catch(() => {});
    return run;
  },
  all: readFile,
  count: async () => (await readFile()).length,
};

/* ---------- Postgres: used whenever DATABASE_URL is set ---------- */

function pgStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= sql`
      CREATE TABLE IF NOT EXISTS reservations (
        number      SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        phone       TEXT NOT NULL DEFAULT '',
        party       INTEGER NOT NULL,
        seating     TEXT NOT NULL,
        zone        TEXT NOT NULL,
        note        TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

  const toEntry = (r: Record<string, unknown>): Entry => ({
    number: r.number as number,
    name: r.name as string,
    email: r.email as string,
    phone: r.phone as string,
    party: r.party as number,
    seating: r.seating as string,
    zone: r.zone as string,
    note: r.note as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  });

  return {
    async add(e) {
      await init();
      const inserted = await sql`
        INSERT INTO reservations (name, email, phone, party, seating, zone, note)
        VALUES (${e.name}, ${e.email}, ${e.phone}, ${e.party}, ${e.seating}, ${e.zone}, ${e.note})
        ON CONFLICT (email) DO NOTHING
        RETURNING *`;
      if (inserted.length) return { entry: toEntry(inserted[0]), existing: false };
      const found = await sql`SELECT * FROM reservations WHERE email = ${e.email}`;
      return { entry: toEntry(found[0]), existing: true };
    },
    async all() {
      await init();
      return (await sql`SELECT * FROM reservations ORDER BY number`).map(toEntry);
    },
    async count() {
      await init();
      const rows = await sql`SELECT count(*)::int AS n FROM reservations`;
      return rows[0].n as number;
    },
  };
}

export const store: Store = process.env.DATABASE_URL
  ? pgStore(process.env.DATABASE_URL)
  : fileStore;

/** The door list is open in development and locked behind ADMIN_KEY everywhere else. */
export function doorIsOpen(key: string | undefined | null) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return process.env.NODE_ENV !== "production";
  return key === expected;
}
