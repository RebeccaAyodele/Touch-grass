import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Touch Grass — AI-Powered Real-World Challenge Game',
  description:
    'The phone is the scoreboard. The game happens outside. AI-generated real-world challenges for outdoor discovery, creativity, and connection.',
  keywords: ['outdoor game', 'AI challenges', 'touch grass', 'real-world quests', 'nature exploration'],
  openGraph: {
    title: 'Touch Grass — AI-Powered Outdoor Game',
    description: 'Step outside. Earn XP. Touch Grass.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#34784A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;500;600;700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#FFF9EF] text-[#193D2B]">
        {children}
      </body>
    </html>
  );
}
