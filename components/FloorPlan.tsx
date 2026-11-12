"use client";

import type { ZoneId } from "@/lib/zones";
import { zones } from "@/lib/zones";
import { event } from "@/lib/config";

/*
 * Redrawn from sheet 02 of the architect's set. Proportions follow the drawing,
 * so the hall, the round bar, the stage and the terrace sit where they do in
 * the building; furniture is simplified.
 */

const BAR = { x: 500, y: 312 };
const FLOOR_TABLES = [[255, 200], [355, 200], [255, 290], [330, 290], [255, 400], [330, 400]];
const STAGE_TABLES = [[645, 200], [745, 200], [670, 290], [745, 290], [670, 400], [745, 400]];
const PALMS = [[424, 180], [576, 180], [428, 452], [572, 452]];

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  // Rounded so server and browser print identical coordinates.
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))] as const;
};

// The counter is a ring left open at the back, where the bartenders walk in.
function barCounter() {
  const [ax, ay] = polar(BAR.x, BAR.y, 80, -62);
  const [bx, by] = polar(BAR.x, BAR.y, 80, 242);
  const [cx, cy] = polar(BAR.x, BAR.y, 58, 242);
  const [dx, dy] = polar(BAR.x, BAR.y, 58, -62);
  return `M${ax} ${ay} A80 80 0 1 1 ${bx} ${by} L${cx} ${cy} A58 58 0 1 0 ${dx} ${dy} Z`;
}

function Table({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle className="furn" cx={x} cy={y} r={15} />
      {[45, 135, 225, 315].map((deg) => {
        const [cx, cy] = polar(x, y, 24, deg);
        return <circle key={deg} className="furn furn--seat" cx={cx} cy={cy} r={6.5} />;
      })}
    </g>
  );
}

function Palm({ x, y }: { x: number; y: number }) {
  return (
    <g className="palm">
      {Array.from({ length: 12 }, (_, i) => {
        const [x2, y2] = polar(x, y, i % 2 ? 15 : 11, i * 30);
        return <line key={i} x1={x} y1={y} x2={x2} y2={y2} />;
      })}
    </g>
  );
}

const HIT: Record<ZoneId, React.ReactNode> = {
  terrace: <path d="M20 380V110Q500 -10 980 110V380H900V160H570V70H430V160H100V380Z" />,
  long: <rect x={108} y={168} width={102} height={294} />,
  floor: <rect x={212} y={168} width={176} height={294} />,
  bar: <circle cx={BAR.x} cy={BAR.y} r={114} />,
  stage: <rect x={612} y={168} width={282} height={294} />,
  velvet: <path d="M20 380H100V470H436L452 590H20Z" />,
  booths: <path d="M564 470H900V380H980V590H548Z" />,
};

const ART: Record<ZoneId, React.ReactNode> = {
  terrace: (
    <>
      <text className="tag" x={190} y={126} textAnchor="middle">TERRACE</text>
      <text className="tag" x={810} y={126} textAnchor="middle">TERRACE</text>
    </>
  ),
  long: (
    <>
      <rect className="furn" x={150} y={195} width={26} height={220} rx={6} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect className="furn furn--seat" x={134} y={203 + i * 30} width={9} height={18} rx={3} />
          <rect className="furn furn--seat" x={183} y={203 + i * 30} width={9} height={18} rx={3} />
        </g>
      ))}
    </>
  ),
  floor: (
    <>
      {FLOOR_TABLES.map(([x, y]) => <Table key={`${x}-${y}`} x={x} y={y} />)}
      <text className="tag" x={292} y={349} textAnchor="middle">FLOOR</text>
    </>
  ),
  bar: (
    <>
      <path className="furn furn--solid" d={barCounter()} />
      <circle className="furn furn--dash" cx={BAR.x} cy={BAR.y} r={40} />
      {Array.from({ length: 11 }, (_, i) => {
        const [cx, cy] = polar(BAR.x, BAR.y, 100, -45 + i * 27);
        return <circle key={i} className="furn furn--stool" cx={cx} cy={cy} r={8} />;
      })}
      <text className="tag" x={BAR.x} y={BAR.y + 4} textAnchor="middle">BAR</text>
    </>
  ),
  stage: (
    <>
      <path className="furn furn--solid" d="M899 172H838Q796 290 852 408H899Z" />
      <text className="tag" x={864} y={294} textAnchor="middle">STAGE</text>
      {STAGE_TABLES.map(([x, y]) => <Table key={`${x}-${y}`} x={x} y={y} />)}
    </>
  ),
  velvet: (
    <>
      <path className="furn furn--sofa" d="M122 494V572H222V494" />
      <rect className="furn" x={147} y={512} width={50} height={30} rx={6} />
      <path className="furn furn--sofa" d="M314 494V572H414V494" />
      <rect className="furn" x={339} y={512} width={50} height={30} rx={6} />
      <path className="furn furn--sofa" d="M40 402V568" />
      <circle className="furn" cx={70} cy={486} r={9} />
      <text className="tag" x={268} y={540} textAnchor="middle">V.I.P</text>
    </>
  ),
  booths: (
    <>
      <path className="furn furn--sofa" d="M612 572H722" />
      <path className="furn furn--sofa" d="M742 572H852" />
      {[640, 667, 694, 770, 797, 824].map((x) => (
        <circle key={x} className="furn" cx={x} cy={538} r={9} />
      ))}
      <text className="tag" x={732} y={502} textAnchor="middle">BOOTHS</text>
    </>
  ),
};

export function FloorPlan({
  active,
  onPick,
}: {
  active: ZoneId;
  onPick: (id: ZoneId) => void;
}) {
  return (
    <svg className="plan" viewBox="0 0 1000 646" role="group" aria-label="Floor plan of Velvet Palms">
      {/* Terrace edge, vestibule, and the light partition between hall and booths */}
      <path className="wall wall--thin wall--dash" pathLength={1} d="M20 380V110Q500 -10 980 110V380" />
      <path className="wall wall--thin" pathLength={1} d="M430 160V70H570V160" />
      <path className="wall wall--thin" pathLength={1} d="M100 470H436M564 470H900" />

      {/* Outer walls, broken at the front door */}
      <path className="wall" pathLength={1} d="M452 590H20V380H100V160H900V380H980V590H548" />
      <path className="wall" pathLength={1} d="M436 470L452 590M564 470L548 590" />

      <g className="plan__fixed">
        {PALMS.map(([x, y]) => <Palm key={`${x}-${y}`} x={x} y={y} />)}
        <path className="furn furn--seat" d="M452 590A48 48 0 0 1 500 542M548 590A48 48 0 0 0 500 542" />
        <text className="tag tag--quiet" x={500} y={520} textAnchor="middle">ENTRANCE</text>
        <rect className="furn furn--hatch" x={866} y={484} width={20} height={94} />
        <circle className="furn furn--seat" cx={946} cy={452} r={8} />
        <circle className="furn furn--seat" cx={946} cy={478} r={8} />
        <text className="tag tag--quiet" x={974} y={540} textAnchor="end">PASTRIES</text>
      </g>

      {zones.map((z, i) => (
        <g
          key={z.id}
          className="zone"
          data-active={active === z.id}
          style={{ "--i": i } as React.CSSProperties}
          role="button"
          tabIndex={0}
          aria-pressed={active === z.id}
          aria-label={z.name}
          onClick={() => onPick(z.id)}
          onPointerEnter={(e) => e.pointerType === "mouse" && onPick(z.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPick(z.id);
            }
          }}
        >
          <g className="hit">{HIT[z.id]}</g>
          <g className="zone__art">{ART[z.id]}</g>
        </g>
      ))}

      {/* Overall width, as dimensioned on sheet 01 */}
      <g className="plan__dim">
        <path d="M20 624H430M570 624H980M14 630L26 618M974 630L986 618M20 604V634M980 604V634" />
        <text className="tag tag--quiet" x={500} y={628} textAnchor="middle">
          {event.roomWidthMm.toLocaleString("en-GB")}
        </text>
      </g>
    </svg>
  );
}
