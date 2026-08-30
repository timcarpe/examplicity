import type { NextConfig } from 'next';
import { labs } from './app/labs';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async redirects() {
    return [
      ...labs.map((lab) => ({
        source: `/labs/${lab.slug}.html`,
        destination: lab.href,
        permanent: true,
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
