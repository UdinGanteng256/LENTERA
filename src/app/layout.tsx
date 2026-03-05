import "./globals.css";
import { AuthProvider } from "@/components/Providers";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata = {
  title: "LENTERA - Ramadhan Super App",
  description: "Terangi Hati, Sempurnakan Ibadah di Bulan Suci - Aplikasi Ramadan untuk meningkatkan ibadah, membaca Quran, dan beramal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ThemeInitializer />
        <AuthProvider>
          <div id="app" role="application" aria-label="LENTERA Ramadhan Application">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
