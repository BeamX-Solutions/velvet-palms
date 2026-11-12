import PalmFrond from './PalmFrond';
import { images, type ImageKey } from '@/lib/images';

const glows: Record<ImageKey, string> = {
  dining:   'radial-gradient(circle at 30% 70%, rgba(214,170,96,.35), transparent 35%), radial-gradient(circle at 75% 35%, rgba(214,170,96,.18), transparent 30%), linear-gradient(160deg,#0c3828,#021e15)',
  lounge:   'radial-gradient(ellipse at 50% 100%, rgba(120,30,50,.35), transparent 55%), radial-gradient(circle at 80% 20%, rgba(214,170,96,.22), transparent 30%), linear-gradient(200deg,#154a36,#05261b)',
  bar:      'repeating-linear-gradient(90deg, rgba(214,170,96,.06) 0 2px, transparent 2px 46px), radial-gradient(ellipse at 50% 20%, rgba(214,170,96,.35), transparent 50%), linear-gradient(180deg,#082d21,#021e15)',
  dish:     'radial-gradient(circle at 50% 50%, rgba(239,230,210,.16) 0 22%, rgba(196,166,110,.25) 23% 24%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(214,170,96,.15), transparent 60%), linear-gradient(135deg,#0c3828,#021e15)',
  cocktail: 'radial-gradient(ellipse at 50% 60%, rgba(214,140,70,.35), transparent 30%), radial-gradient(circle at 30% 20%, rgba(214,170,96,.2), transparent 30%), linear-gradient(170deg,#082d21,#021e15)',
  exterior: 'radial-gradient(ellipse at 50% 85%, rgba(214,170,96,.3), transparent 40%), linear-gradient(180deg,#05261b 0%,#0c3828 60%,#021e15 100%)',
  chef:     'radial-gradient(circle at 70% 60%, rgba(230,140,60,.3), transparent 35%), linear-gradient(150deg,#154a36,#021e15)',
};

type Props = { kind: ImageKey; ratio?: string; className?: string; priority?: boolean };

export default function StandIn({ kind, ratio = '4 / 5', className = '' }: Props) {
  const img = images[kind];
  return (
    <div className={`standin ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={img.alt}>
      {img.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="photo" src={img.src} alt={img.alt} />
      ) : (
        <>
          <div className="glow" style={{ background: glows[kind] }} />
          <PalmFrond className="frond" style={{ width: '85%', right: '-25%', top: '-10%', transform: 'rotate(15deg)' }} />
          <span className="caption">Stand-in image · {img.label}</span>
        </>
      )}
    </div>
  );
}
