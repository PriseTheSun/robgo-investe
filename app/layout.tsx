import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { CookieConsent } from '../components/cookie-consent';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'RobGO Investe - Inteligência em Investimentos',
  description: 'Analista de investimentos inteligente para todos os níveis: Iniciante, Intermediário e Avançado.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="antialiased bg-[#F0F2F5] dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
