// The site is served at beamxsolutions.com/velvetpalms. Set NEXT_PUBLIC_BASE_PATH to '' to serve it at the root instead.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/velvetpalms';

// Hosts allowed to submit the booking forms. Requests arrive through the beamxsolutions.com proxy,
// so its host must be listed or Next.js rejects the form as cross-site.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'beamxsolutions.com,www.beamxsolutions.com')
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
