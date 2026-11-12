import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var __velvetSql: ReturnType<typeof postgres> | undefined;
}

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local.');
  if (!globalThis.__velvetSql) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    globalThis.__velvetSql = postgres(url, {
      prepare: false, // required for Supabase's transaction pooler
      ssl: local ? false : 'require',
      max: 5,
      idle_timeout: 20,
    });
  }
  return globalThis.__velvetSql;
}
