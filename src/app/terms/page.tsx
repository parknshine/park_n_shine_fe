import type { Metadata } from "next";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

export default async function TermsPage() {
  const whatsappNumber = await getWhatsAppNumber();
  return <TermsContent whatsappNumber={whatsappNumber} />;
}
