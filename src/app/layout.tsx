import "./globals.css";
import { AuthProvider } from "@/components/Providers";
import ThemeInitializer from "@/components/ThemeInitializer";
import { TranslationProvider } from '@/contexts/TranslationContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "LENTERA - Ramadhan Companion",
    template: "%s | LENTERA"
  },
  description: "Terangi Hati, Sempurnakan Ibadah di Bulan Suci - Aplikasi Ramadan untuk meningkatkan ibadah, membaca Quran, dan beramal",
  keywords: ["ramadan", "quran", "prayer times", "islamic app", "muslim", "puasa", "zakat"],
  authors: [{ name: "LENTERA Team" }],
  creator: "LENTERA",
  publisher: "LENTERA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lentera-ramadhan.vercel.app'),
  openGraph: {
    title: "LENTERA - Ramadhan Companion",
    description: "Terangi Hati, Sempurnakan Ibadah di Bulan Suci",
    url: "https://lentera-ramadhan.vercel.app",
    siteName: "LENTERA",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LENTERA - Ramadhan Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LENTERA - Ramadhan Companion",
    description: "Terangi Hati, Sempurnakan Ibadah di Bulan Suci",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <TranslationProvider>
          <ThemeInitializer />
          <AuthProvider>
            <div id="app" role="application" aria-label="LENTERA Ramadhan Application">
              {children}
            </div>
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
