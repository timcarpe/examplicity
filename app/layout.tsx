import type { Metadata } from 'next';
import './globals.css';
import { siteDescription, siteTitle, siteUrl } from './site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Examplicity',
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    description: siteDescription,
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: siteTitle,
    }],
    locale: 'en_GB',
    siteName: 'Examplicity',
    title: siteTitle,
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    description: siteDescription,
    images: ['/opengraph-image'],
    title: siteTitle,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
