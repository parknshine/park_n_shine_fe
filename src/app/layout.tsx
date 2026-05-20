import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Manrope, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/providers/toaster";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Park & Shine",
    template: "%s | Park & Shine",
  },
  description:
    "Waterless car wash PWA for booking, crew operations, and site supervision.",
  applicationName: "Park & Shine",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Park & Shine",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  colorScheme: "light dark",
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
            <PwaProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
