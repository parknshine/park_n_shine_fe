import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CrewShell } from "./crew-shell";

export const metadata: Metadata = {
  manifest: "/crew-manifest.webmanifest",
  applicationName: "Park & Shine Crew",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Park & Shine Crew",
  },
};

export default function CrewLayout({ children }: { children: ReactNode }) {
  return <CrewShell>{children}</CrewShell>;
}
