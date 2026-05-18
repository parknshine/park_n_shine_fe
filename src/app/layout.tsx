import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "@/components/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Base Template",
  description: "Next.js · Tailwind CSS · React Hook Form · Axios · Zustand · Immer · Radix UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Anti-FOUC: apply theme class before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {/* Navbar */}
          <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Next.js Starter
                </span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Page content — offset by navbar height */}
          <div className="pt-14">{children}</div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
