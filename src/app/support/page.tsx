import type { Metadata } from "next";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";
import { SupportContent } from "./support-content";

export const metadata: Metadata = { title: "Support" };

export default async function SupportPage() {
  const whatsappNumber = await getWhatsAppNumber();
  return <SupportContent whatsappNumber={whatsappNumber} />;
}
