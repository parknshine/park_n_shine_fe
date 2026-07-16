import type { Metadata } from "next";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPolicyPage() {
  const whatsappNumber = await getWhatsAppNumber();
  return <PrivacyContent whatsappNumber={whatsappNumber} />;
}
