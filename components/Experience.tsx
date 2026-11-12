"use client";

import { useState } from "react";
import type { ZoneId } from "@/lib/zones";
import { ANYWHERE, zones } from "@/lib/zones";
import type { SeatingId } from "@/site.config";
import { site } from "@/site.config";
import { FloorPlan } from "./FloorPlan";
import { ListForm } from "./ListForm";
import { Reveal, Sheet } from "./Reveal";

const toList = () =>
  document.getElementById("list")?.scrollIntoView({ behavior: "smooth", block: "start" });

/** The room, the evening and the list share one set of choices, so they live together. */
export function Experience() {
  const [viewing, setViewing] = useState<ZoneId>("bar");
  const [zone, setZone] = useState<ZoneId | typeof ANYWHERE>(ANYWHERE);
  const [seating, setSeating] = useState<SeatingId>("second");

  const current = zones.find((z) => z.id === viewing)!;
  const index = zones.indexOf(current);

  return (
    <>
      <Reveal as="section" className="section room" id="room">
        <Sheet no="01" title="Floor plan" note="(All dimensions are in millimetres)" />

        <div className="room__intro">
          <h3 className="display">
            Twenty-three metres of marble, one round bar, and palms where you&rsquo;d least expect a tree.
          </h3>
          <p>
            This is the architect&rsquo;s drawing of the room, more or less as it was handed to the builders.
            Have a wander. When you find where you&rsquo;d like to be found, ask for it.
          </p>
        </div>

        <div className="room__stage">
          <div className="room__plan">
            <FloorPlan active={viewing} onPick={setViewing} />
          </div>

          <aside className="room__panel" aria-live="polite">
            <p className="mono room__index">
              {String(index + 1).padStart(2, "0")} <span>/ {String(zones.length).padStart(2, "0")}</span>
            </p>
            <h4 className="display room__name" key={current.id}>
              {current.name}
            </h4>
            <p className="room__line">{current.line}</p>
            <p className="mono room__best">
              <span>Best for</span> {current.bestFor}
            </p>
            <button
              type="button"
              className="btn btn--line"
              onClick={() => {
                setZone(current.id);
                toList();
              }}
            >
              Ask for this spot
            </button>
          </aside>
        </div>

        <div className="chips" role="group" aria-label="Places in the room">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className="chip mono"
              aria-pressed={viewing === z.id}
              onClick={() => setViewing(z.id)}
            >
              {z.name}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="section evening" id="evening">
        <Sheet no="02" title="The evening" note="(All times are approximate)" />

        <div className="evening__grid">
          {site.seatings.map((s) => (
            <button
              key={s.id}
              type="button"
              className="seating"
              aria-pressed={seating === s.id}
              onClick={() => {
                setSeating(s.id);
                toList();
              }}
            >
              <span className="seating__time display">
                {s.time}
                <small>{s.meridiem}</small>
              </span>
              <span className="seating__label mono">{s.label}</span>
              <span className="seating__line">{s.line}</span>
              <span className="seating__pick mono">{seating === s.id ? "Chosen" : "Take this one"}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="section list" id="list">
        <Sheet no="03" title="The list" note="(All names are spelled as given)" />
        <ListForm zone={zone} setZone={setZone} seating={seating} setSeating={setSeating} />
      </Reveal>
    </>
  );
}
