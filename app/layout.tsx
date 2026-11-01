import type { Metadata } from 'next';
import { Barlow_Condensed, Barlow } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const display = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display' });
const body = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'ASES – Home Of Champions',
  description: 'Association Sportive de l’ENCG de Settat – 26 ans d’héritage.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
