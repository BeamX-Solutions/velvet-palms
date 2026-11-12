// Edit event details here. Times are West Africa Time (UTC+1).
export const event = {
  name: 'Velvet Palms',
  tagline: 'Restaurant & Lounge',
  city: 'Awka, Anambra State',
  openingNight: {
    dateISO: process.env.NEXT_PUBLIC_OPENING_DATE ?? '2026-12-12T18:30:00+01:00',
    dateLabel: 'Saturday, 12 December 2026',
    totalSeats: 100,
    maxPartySize: 6,
    dressCode: 'Evening elegance. Think velvet, gold and your finest.',
  },
  address: 'Address to be announced, Awka',
  phone: '+234 000 000 0000',
  whatsapp: '',
  instagram: 'velvetpalms',
  email: 'hello@velvetpalms.example',
  since: 2025,
  /** From sheet 01 of the architect's drawings: overall width of the room in mm. */
  roomWidthMm: 23400,
  /** Short date for the nav and place card. */
  shortDate: '12.12.26',
};

export const siteUrl = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
