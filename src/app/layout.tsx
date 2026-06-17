import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/providers/toaster";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Park & Shine",
    template: "%s | Park & Shine",
  },
  description:
    "Book a waterless car wash at your parking spot — no water, no hassle. Park & Shine comes to you.",
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
  themeColor: "#006289",
  colorScheme: "light",
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
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={`${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
        {/* DARK MODE DISABLED — script below reads localStorage/system preference and applies dark class */}
        {/* <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        /> */}
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <PwaProvider />
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
