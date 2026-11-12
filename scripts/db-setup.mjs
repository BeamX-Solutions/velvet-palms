// Applies db/schema.sql to DATABASE_URL.  Usage: npm run db:setup
import postgres from 'postgres';
import { readFileSync, existsSync } from 'node:fs';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set'); process.exit(1); }
const local = /localhost|127\.0\.0\.1/.test(url);
const sql = postgres(url, { prepare: false, ssl: local ? false : 'require', max: 1 });
await sql.unsafe(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
const rows = await sql`select id, label, starts_at, capacity from sittings order by starts_at`;
console.log('Schema applied. Sittings:');
console.table(rows);
await sql.end();
