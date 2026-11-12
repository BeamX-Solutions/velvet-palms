/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
