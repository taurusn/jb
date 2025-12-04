import type { Metadata } from 'next';
import { Inter, Space_Grotesk, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-ibm-plex-arabic',
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ready HR - Find Your Next Opportunity',
  description: 'Connect talented professionals with leading employers. Submit your application or find the perfect candidate for your team.',
  keywords: ['jobs', 'recruitment', 'employment', 'careers', 'hiring'],
  openGraph: {
    title: 'Ready HR - Land Your Next Opportunity',
    description: 'One simple application connects you with employers actively seeking talent. No complicated processes, no endless forms.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Ready HR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ready HR - Land Your Next Opportunity',
    description: 'One simple application connects you with employers actively seeking talent.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexArabic.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
