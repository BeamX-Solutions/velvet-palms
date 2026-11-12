# Velvet Palms — opening night list

A one-page site for opening night: guests walk the floor plan, pick a seating and a spot, and put their name down.

## Run it

```
npm install
npm run dev
```

Then open http://localhost:3000. Staff see the names at `/door`.

## Change the details

Everything editable is in `site.config.ts`: the opening date, seating times, address, Instagram and email.
Entries marked `PLACEHOLDER` were invented and need replacing. The copy for each part of the room is in `lib/zones.ts`.

## Where names are stored

- With `DATABASE_URL` set (any Postgres, e.g. Neon), names go to a `reservations` table that is created on first use.
- Without it, names go to `.data/reservations.json`. That is fine locally but will not work on serverless hosts such as Vercel.

Set `ADMIN_KEY` before deploying. `/door?key=…` and the CSV export are locked without it in production.
# Velvelt-palms
