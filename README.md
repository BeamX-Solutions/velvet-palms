# Velvet Palms: Restaurant & Lounge website

A single-page site for Velvet Palms (Awka) with a free reservation system for Opening Night,
capped at 100 seats.

**Stack:** Next.js 15 (App Router) · Postgres (Supabase) · Resend (email) · Netlify (hosting)

**Live at:** https://beamxsolutions.com/velvetpalms (served through the beamxsolutions.com site; see *Hosting under beamxsolutions.com* below)

## What's included

| Page | Path | Notes |
|---|---|---|
| Home | `/` | Hero and countdown, floor plan, kitchen, lounge & bar, live sittings and the reservation form (becomes a waitlist when full). `/opening-night`, `/experience` and `/visit` redirect here |
| Reservation ticket | `/reservation/VP-XXXXXXXX` | QR code, add-to-calendar, guest self-cancel |
| Staff guest list | `/admin` | Password protected. Counts, search, check-in, cancel, close a sitting, waitlist, CSV export |
| Door check-in | `/admin/checkin/VP-XXXXXXXX` | Opened by scanning the guest's QR code with any phone camera |

### How the 100-seat limit works
- Seats, not bookings, are counted: a party of 4 uses 4 seats. Max 6 per booking.
- Two sittings of 50 by default (6:30 PM and 9:00 PM). Change times or capacity in the `sittings` table.
- Seats are reserved inside a Postgres function (`reserve_seats`) that locks the sitting row, so two
  guests can never take the same last seats. Tested with 300 simultaneous bookings: both sittings filled
  to exactly 50, never more (`npm run test:capacity`, local database only).
- One active reservation per email and per phone number.
- Spam protection: hidden honeypot field plus a minimum time on the form.
- Cancelled reservations release their seats immediately.

## Run it locally
```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL and ADMIN_PASSWORD
npm run db:setup                  # creates tables, function and the two sittings
npm run dev                       # http://localhost:3000/velvetpalms
```

## Deploy (about 20 minutes)
1. **Database: Supabase** (free tier is enough)
   - Create a project at supabase.com (choose a region close to Nigeria, e.g. EU West).
   - Project Settings > Database > Connection string > **Transaction pooler** (port 6543). This is `DATABASE_URL`.
   - Run `npm run db:setup` with that URL in `.env.local`, or paste `db/schema.sql` into the Supabase SQL editor.
2. **Email: Resend** (optional but recommended)
   - Create an account at resend.com, verify the restaurant's domain, create an API key.
   - Set `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `Velvet Palms <reservations@velvetpalms.com>`).
   - Without a key, bookings still work; the email is skipped and the guest saves their ticket page.
3. **Hosting: Netlify, under beamxsolutions.com/velvetpalms**
   - See *Hosting under beamxsolutions.com/velvetpalms* at the end of this file.

> `SITE_URL` must be the live address (`https://beamxsolutions.com/velvetpalms`) before guests book: it is baked into the QR codes and emails.

## Editing content
- **Event details** (date, dress code, address, phone, Instagram): `lib/config.ts`
- **Sittings** (times, capacity, open/closed): `sittings` table, or the buttons on `/admin`
- **Photos**: `public/images/` holds free Unsplash stock photos (credits in `lib/images.ts`). Replace them with the restaurant's own photos when available.
- **Menu and copy**: `app/page.tsx`; room descriptions in `lib/zones.ts`
- **Brand**: colours and fonts are CSS variables at the top of `app/globals.css`; logo files are in `public/brand/`.

## Before launch checklist
- [ ] Confirm opening date and sitting times (currently 12 Dec 2026, 6:30 PM and 9:00 PM)
- [ ] Real address, phone, email, Instagram handle in `lib/config.ts`
- [ ] Real photos and final menu
- [ ] Strong `ADMIN_PASSWORD`; share it only with door staff
- [ ] Domain bought, `SITE_URL` updated, Resend domain verified
- [ ] Note: the logo reads "Since 2025"; confirm with the client if the opening is in 2026

## Hosting under beamxsolutions.com/velvetpalms
The app runs as its own Netlify site, and the main beamxsolutions.com site forwards `/velvetpalms` to it,
so visitors only ever see beamxsolutions.com.

1. **Deploy this repo as a new Netlify site** (Add new site > Import from GitHub > `BeamX-Solutions/velvet-palms`).
   Netlify detects Next.js automatically. Add the environment variables: `DATABASE_URL`, `ADMIN_USER`,
   `ADMIN_PASSWORD`, `SITE_URL=https://beamxsolutions.com/velvetpalms`, and optionally `RESEND_API_KEY` and `EMAIL_FROM`.
2. **Check it works** at `https://<new-site>.netlify.app/velvetpalms`.
3. **Add the proxy to the main site** (`BeamX-Solutions/beam_x_solutions`, `netlify.toml`), above any catch-all rule:
   ```toml
   [[redirects]]
     from = "/velvetpalms"
     to = "https://<new-site>.netlify.app/velvetpalms"
     status = 200
     force = true

   [[redirects]]
     from = "/velvetpalms/*"
     to = "https://<new-site>.netlify.app/velvetpalms/:splat"
     status = 200
     force = true
   ```

All pages, files and the staff area live under `/velvetpalms` (set by `basePath` in `next.config.mjs`).
Booking forms submitted through beamxsolutions.com are allowed by `ALLOWED_ORIGINS` (default: beamxsolutions.com).

