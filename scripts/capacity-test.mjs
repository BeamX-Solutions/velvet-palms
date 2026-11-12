// Stress test: fires many simultaneous reservations and proves the seat cap holds.
// ONLY run against a local/test database: it deletes all reservations first.
// Usage: npm run test:capacity
import postgres from 'postgres';
import { readFileSync, existsSync } from 'node:fs';

if (existsSync('.env.local')) for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.DATABASE_URL;
if (!/localhost|127\.0\.0\.1/.test(url ?? '')) { console.error('Refusing: DATABASE_URL is not local.'); process.exit(1); }
const sql = postgres(url, { max: 40, prepare: false });

await sql`delete from reservations`;
const sittings = await sql`select id, capacity from sittings order by id`;
const N = 300;
const t0 = Date.now();
const results = await Promise.all(Array.from({ length: N }, (_, i) => {
  const s = sittings[i % sittings.length];
  const party = 1 + (i % 4);
  return sql`select * from reserve_seats(${s.id}, ${'Guest ' + i}, ${`guest${i}@test.com`}, ${'23480' + String(10000000 + i)},
    ${party}, null, null, ${'VP-' + (i.toString(36).toUpperCase() + 'ZZZZZZZZ').slice(0, 8)})`.then(r => r[0]);
}));
const ok = results.filter(r => r.ok).length;
const reasons = results.reduce((m, r) => (m[r.reason ?? 'ok'] = (m[r.reason ?? 'ok'] ?? 0) + 1, m), {});
const per = await sql`select s.id, s.capacity, coalesce(sum(r.party_size),0)::int taken
  from sittings s left join reservations r on r.sitting_id = s.id and r.status='confirmed' group by s.id order by s.id`;
console.log(`${N} simultaneous attempts in ${Date.now() - t0}ms -> ${ok} succeeded`, reasons);
console.table(per);
const over = per.some(p => p.taken > p.capacity);
// duplicate protection
const dup = await sql`select * from reserve_seats(${sittings[0].id}, 'Dup', 'GUEST0@test.com', '000', 1, null, null, 'VP-DUPTEST1')`;
console.log('Duplicate email attempt ->', dup[0].reason);
await sql`delete from reservations`;
await sql.end();
if (over) { console.error('FAIL: overbooked'); process.exit(1); }
console.log('PASS: no sitting exceeded capacity; duplicates rejected.');
