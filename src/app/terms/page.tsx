import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

export default function TermsPage() {
  return <TermsContent />;
}
