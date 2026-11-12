/** The seven areas of the room, as shown on the floor plan. */
export const zones = [
  {
    id: "bar",
    name: "The Round Bar",
    tag: "BAR",
    line: "A round bar right in the middle of the room.",
    bestFor: "Couples, solo guests and anyone who likes to chat with the bartender",
  },
  {
    id: "floor",
    name: "The Floor",
    tag: "FLOOR",
    line: "Round tables for four in the centre of the room.",
    bestFor: "Groups of four and a proper sit-down dinner",
  },
  {
    id: "long",
    name: "The Long Table",
    tag: "LONG TABLE",
    line: "One long table along the wall, with plenty of seats.",
    bestFor: "Birthdays, work teams and big families",
  },
  {
    id: "stage",
    name: "Stage Side",
    tag: "STAGE",
    line: "Tables close to the stage and the live entertainment.",
    bestFor: "Music lovers and late nights",
  },
  {
    id: "velvet",
    name: "The Velvet Booths",
    tag: "V.I.P",
    line: "Private booths tucked away behind the palms.",
    bestFor: "Groups of six or more and special occasions",
  },
  {
    id: "booths",
    name: "The Corner Booths",
    tag: "BOOTHS",
    line: "Cosy booths next to the pastry counter.",
    bestFor: "Couples and small groups",
  },
  {
    id: "terrace",
    name: "The Terrace",
    tag: "TERRACE",
    line: "Outdoor seating around the back of the building.",
    bestFor: "Warm evenings and fresh air",
  },
] as const;

export type ZoneId = (typeof zones)[number]["id"];
