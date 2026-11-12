# Velvet Palms: Restaurant & Lounge website

A single-page site for Velvet Palms (Awka) with a free reservation system for Opening Night,
capped at 100 seats.

**Stack:** Next.js 15 (App Router) · Postgres (Supabase) · Resend (email) · Vercel (hosting)

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
npm run dev                       # http://localhost:3000
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
3. **Hosting: Vercel**
   - Push this folder to a GitHub repo, import it in Vercel.
   - Add environment variables: `DATABASE_URL`, `SITE_URL` (the live URL, no trailing slash),
     `ADMIN_USER`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `EMAIL_FROM`.
   - Deploy. When the domain is bought, add it in Vercel and update `SITE_URL`.

> `SITE_URL` must be the live address before guests book: it is baked into the QR codes and emails.

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
