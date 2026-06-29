import type { Metadata } from "next";
import { SupportContent } from "./support-content";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return <SupportContent />;
}
