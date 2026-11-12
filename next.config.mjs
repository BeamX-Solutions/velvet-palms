// The site is served at the root of velvetpalms.beamxsolutions.com.
// To serve it under a path instead (e.g. beamxsolutions.com/velvetpalms), set NEXT_PUBLIC_BASE_PATH=/velvetpalms.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Extra hosts allowed to submit the booking forms. Only needed if another site proxies to this one
// (e.g. ALLOWED_ORIGINS=beamxsolutions.com); the site's own domain is always allowed.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  experimental: { serverActions: { allowedOrigins } },
  // The site is a single page now; old addresses go to the home page (which always opens at the top).
  async redirects() {
    return [
      { source: '/opening-night', destination: '/', permanent: true },
      { source: '/experience', destination: '/', permanent: true },
      { source: '/visit', destination: '/', permanent: true },
    ];
  },
};
export default nextConfig;
