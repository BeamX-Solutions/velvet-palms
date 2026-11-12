/**
 * Everything a non-developer might need to change lives here.
 * Items marked PLACEHOLDER were invented so the site has something to show —
 * replace them before this goes anywhere public.
 */

export const site = {
  name: "Velvet Palms",
  descriptor: "Restaurant & Lounge",
  since: 2025,

  opening: {
    /** PLACEHOLDER. Local wall-clock time at the restaurant, no timezone suffix. */
    doors: "2026-12-12T18:00:00",
    /** PLACEHOLDER. Written out by hand so it never shifts with a visitor's timezone. */
    dateLabel: "Saturday 12 December 2026",
    shortLabel: "12.12.26",
  },

  /** PLACEHOLDER times. `start` is 24h local time, used for the calendar file. */
  seatings: [
    {
      id: "first",
      label: "First seating",
      time: "6:00",
      meridiem: "pm",
      start: "18:00",
      line: "Dinner while the room is still finding its voice. The kitchen's full attention.",
    },
    {
      id: "second",
      label: "Second seating",
      time: "8:30",
      meridiem: "pm",
      start: "20:30",
      line: "The room at full volume. Dinner first, then see where the night goes.",
    },
    {
      id: "late",
      label: "The late lounge",
      time: "10:30",
      meridiem: "pm",
      start: "22:30",
      line: "Drinks, small plates, the stage. Nobody asks when you're leaving.",
    },
  ],

  maxParty: 12,

  /** Leave blank to hide. With no address, the site says it is sent with the confirmation. */
  address: "" as string,
  instagram: "" as string,
  email: "" as string,

  /** Real figure, from sheet 01 of the architect's drawings: overall width in mm. */
  roomWidthMm: 23400,
} as const;

export type SeatingId = (typeof site.seatings)[number]["id"];

export function seatingById(id: string) {
  return site.seatings.find((s) => s.id === id);
}
