import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono, Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({ 
  subsets: ['latin'],
  variable: '--sans',
  weight: ['400', '500', '600', '700'] 
});

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--serif',
  style: ['normal', 'italic'],
  weight: ['300', '500', '700', '900'] 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--mono',
  weight: ['400', '500', '600'] 
});

export const metadata: Metadata = {
  title: 'CodePath — Written DSA Prep',
  description: 'Master Data Structures & Algorithms through clear written explanations, structured roadmaps, and 500+ free problems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const scriptContent = `
    (function() {
      try {
        var localTheme = window.localStorage.getItem('theme');
        var theme = localTheme ? localTheme : 'light';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className={`${instrumentSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

