type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  title?: string;
};

/**
 * Official Velvet Palms logo. The artwork lives in /public/brand as vector SVGs
 * traced from the original logo, so it stays sharp at any size. Do not redraw it here.
 */
export default function BrandLogo({ className, compact = false, title = 'Velvet Palms Restaurant and Lounge' }: BrandLogoProps) {
  if (compact) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={className} src="/brand/emblem.svg" alt={title} width={776} height={1080} decoding="async" />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src="/brand/logo-full.svg" alt={title} width={2128} height={2392} decoding="async" />
  );
}
