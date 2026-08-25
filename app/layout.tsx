import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cambridge Labs',
  description: 'Interactive Computer Science labs for Cambridge 0478 and 9618 exams.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
