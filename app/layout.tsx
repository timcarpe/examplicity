import type { Metadata } from 'next';
import './globals.css';

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (deploymentHost ? `https://${deploymentHost}` : 'https://examplicity.org');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Examplicity',
  title: 'Examplicity — Make complex ideas click',
  description: 'Interactive Computer Science labs for Cambridge 0478 and 9618.',
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
