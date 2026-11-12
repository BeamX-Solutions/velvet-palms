/** The seven places a guest can ask for, taken from sheet 02 of the floor plan. */
export const zones = [
  {
    id: "bar",
    name: "The Round Bar",
    tag: "BAR",
    line: "A full circle under a crown of bottles, dead centre of the room. No corners, so nobody gets stuck in one.",
    bestFor: "Twos, solo arrivals, people who talk to bartenders",
  },
  {
    id: "floor",
    name: "The Floor",
    tag: "FLOOR",
    line: "Round tables for four on white marble, in the middle of everything. You see who walks in. They see you.",
    bestFor: "Fours, and dinner done properly",
  },
  {
    id: "long",
    name: "The Long Table",
    tag: "LONG TABLE",
    line: "One table running down the wall, a lot of chairs. Bring a crowd or inherit one.",
    bestFor: "Birthdays, teams, big families",
  },
  {
    id: "stage",
    name: "Stage Side",
    tag: "STAGE",
    line: "The tables within reach of the stage. Conversation becomes optional once it starts.",
    bestFor: "Night owls, and anyone here for the lounge half of the name",
  },
  {
    id: "velvet",
    name: "The Velvet Booths",
    tag: "V.I.P",
    line: "Deep booths off the main floor, behind the palms. You can see the room. The room has to work to see you.",
    bestFor: "Sixes and up, and occasions",
  },
  {
    id: "booths",
    name: "The Corner Booths",
    tag: "BOOTHS",
    line: "Banquettes beside the pastry counter. Dangerous, if you were planning to skip dessert.",
    bestFor: "Twos and threes with a sweet tooth",
  },
  {
    id: "terrace",
    name: "The Terrace",
    tag: "TERRACE",
    line: "The open-air curve that wraps the back of the room. Same menu, more sky.",
    bestFor: "Warm nights and long conversations",
  },
] as const;

export type ZoneId = (typeof zones)[number]["id"];

export const ANYWHERE = "anywhere";

export function zoneName(id: string) {
  return zones.find((z) => z.id === id)?.name ?? "Wherever you put us";
}
