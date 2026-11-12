'use client';
import { useState } from 'react';
import { FloorPlan } from './FloorPlan';
import { type ZoneId, zones } from '@/lib/zones';

/** The architect's floor plan, for browsing the room. Nothing picked here is saved. */
export default function RoomExplorer() {
  const [viewing, setViewing] = useState<ZoneId>('bar');
  const current = zones.find((z) => z.id === viewing)!;
  const index = zones.indexOf(current);

  return (
    <>
      <div className="room__stage">
        <div className="room__plan">
          <FloorPlan active={viewing} onPick={setViewing} />
        </div>

        <aside className="room__panel" aria-live="polite">
          <p className="mono room__index">
            {String(index + 1).padStart(2, '0')} <span>/ {String(zones.length).padStart(2, '0')}</span>
          </p>
          <h4 className="display room__name" key={current.id}>{current.name}</h4>
          <p className="room__line">{current.line}</p>
          <p className="mono room__best"><span>Best for</span> {current.bestFor}</p>
          <a href="#reserve" className="btn btn--line">Reserve a seat</a>
        </aside>
      </div>

      <div className="chips" role="group" aria-label="Places in the room">
        {zones.map((z) => (
          <button key={z.id} type="button" className="chip mono" aria-pressed={viewing === z.id} onClick={() => setViewing(z.id)}>
            {z.name}
          </button>
        ))}
      </div>
    </>
  );
}
