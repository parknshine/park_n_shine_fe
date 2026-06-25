import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return <ContactContent />;
}
