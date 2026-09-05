import type { NextConfig } from 'next';
import { labPageHref, labs } from './app/labs.ts';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return labs.map((lab) => ({
      source: lab.href,
      has: [{ type: 'query', key: 'embed', value: '1' }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
    }));
  },
  async redirects() {
    return [
      ...labs.map((lab) => ({
        source: `/labs/${lab.slug}.html`,
        destination: labPageHref(lab),
        permanent: true,
      })),
      ...labs.map((lab) => ({
        source: lab.href,
        destination: labPageHref(lab),
        permanent: true,
        missing: [{ type: 'query' as const, key: 'embed' }],
      })),
      {
        source: '/favicon.ico',
        destination: '/icon.svg',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
