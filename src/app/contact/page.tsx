import type { Metadata } from "next";
import { getWhatsAppNumber } from "@/lib/get-whatsapp-number";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const whatsappNumber = await getWhatsAppNumber();
  return <ContactContent whatsappNumber={whatsappNumber} />;
}
