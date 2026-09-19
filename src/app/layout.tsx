import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const sindieEldora = localFont({
  src: '../../public/fonts/SindieEldoraDemoRegular.ttf',
  variable: '--font-brand',
  display: 'swap',
});

const medino = localFont({
  src: '../../public/fonts/Medino-Regular.otf',
  variable: '--font-title',
  display: 'swap',
});

const garamond = localFont({
  src: '../../public/fonts/garamond_[allfont.ru].ttf',
  variable: '--font-body',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "PausePalette | Premium Clothing Brand",
  description: "Discover the latest trends in premium clothing with PausePalette.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sindieEldora.variable} ${medino.variable} ${garamond.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ShopProvider>
            <Toaster position="top-right" />
            {children}
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
