import type { Metadata } from 'next';
import './globals.css';

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (deploymentHost ? `https://${deploymentHost}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Cambridge Labs',
  description: 'Interactive Computer Science labs for Cambridge 0478 and 9618 exams.',
  openGraph: {
    title: 'Cambridge Labs',
    description: 'Interactive Computer Science labs for Cambridge 0478 and 9618 exams.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cambridge Labs',
    description: 'Interactive Computer Science labs for Cambridge 0478 and 9618 exams.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
