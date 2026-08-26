import type { Metadata } from 'next';
import './globals.css';

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (deploymentHost ? `https://${deploymentHost}` : 'https://examplicity.org');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Examplicity',
  title: 'Examplicity — Computer science, made obvious',
  description: 'Interactive Computer Science labs for Cambridge 0478 and 9618.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Examplicity — Computer science, made obvious',
    description: 'Interactive Computer Science labs for Cambridge 0478 and 9618.',
    type: 'website',
    url: '/',
    siteName: 'Examplicity',
    images: [{ url: '/og.png', alt: 'Examplicity — Computer science, made obvious' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examplicity — Computer science, made obvious',
    description: 'Interactive Computer Science labs for Cambridge 0478 and 9618.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
