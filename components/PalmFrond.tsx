// A procedurally drawn palm frond used as a decorative motif.
type Props = { className?: string; style?: React.CSSProperties; leaflets?: number };

export default function PalmFrond({ className, style, leaflets = 26 }: Props) {
  // stem: quadratic bezier from base (20,380) through control (160,120) to tip (400,40)
  const P0 = [20, 380], C = [150, 110], P1 = [400, 40];
  const pt = (t: number) => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P1[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P1[1],
  ];
  const tan = (t: number) => {
    const dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P1[0] - C[0]);
    const dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P1[1] - C[1]);
    return Math.atan2(dy, dx);
  };
  const leaves: string[] = [];
  for (let i = 1; i <= leaflets; i++) {
    const t = 0.08 + (i / leaflets) * 0.9;
    const [x, y] = pt(t);
    const a = tan(t);
    const len = 150 * Math.sin(Math.PI * Math.min(t + 0.08, 1)) + 30;
    for (const side of [-1, 1]) {
      const ang = a + side * (Math.PI / 2.6) + 0.35; // droop
      const tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len;
      const w = 7;
      const nx = Math.cos(ang + Math.PI / 2) * w, ny = Math.sin(ang + Math.PI / 2) * w;
      const mx = (x + tx) / 2, my = (y + ty) / 2;
      leaves.push(
        `M${x.toFixed(1)} ${y.toFixed(1)} Q${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(mx - nx).toFixed(1)} ${(my - ny).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`,
      );
    }
  }
  return (
    <svg viewBox="-80 -120 620 620" className={className} style={style} aria-hidden="true" fill="currentColor">
      <path d={`M${P0[0]} ${P0[1]} Q${C[0]} ${C[1]} ${P1[0]} ${P1[1]}`} stroke="currentColor" strokeWidth="5" fill="none" />
      <path d={leaves.join(' ')} />
    </svg>
  );
}
