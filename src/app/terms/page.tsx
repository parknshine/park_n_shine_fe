import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-341.5 mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[#0036a4] text-xl md:text-2xl whitespace-nowrap"
            style={{ fontFamily: manrope, fontWeight: 700 }}
          >
            Park &amp; Shine
          </Link>
          <Link
            href="/"
            className="text-[#5f5e5e] text-sm flex items-center gap-2 hover:text-[#0036a4] transition-colors"
            style={{ fontFamily: inter, fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-12 py-12 md:py-20">
        <h1
          className="text-[32px] md:text-[44px] leading-tight text-black mb-2"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          Terms of Service
        </h1>
        <p className="text-[#5f5e5e] text-sm mb-10" style={{ fontFamily: inter }}>
          Last updated: May 2026
        </p>

        <div className="flex flex-col gap-10" style={{ fontFamily: inter }}>
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using the Park &amp; Shine platform — including our web app, booking system, and any related services — you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Park &amp; Shine provides a waterless car wash service available at selected parking locations. Customers can book a wash through our web app, track service progress in real time, and receive notifications upon completion. Service availability depends on crew presence at the selected location.</p>
          </Section>

          <Section title="3. Booking and Payment">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Bookings are confirmed only after successful payment processing.</li>
              <li>Pricing is displayed at the time of booking and may vary by location or promotion.</li>
              <li>Promotional pricing is valid for a limited time and subject to availability.</li>
              <li>All payments are processed securely. We do not store full payment card details.</li>
            </ul>
          </Section>

          <Section title="4. Cancellations and Refunds">
            <p>Cancellations made before a crew member has been assigned will receive a full refund. Once service has begun, no refund is available. Refunds, if applicable, will be processed within 5–7 business days to the original payment method.</p>
          </Section>

          <Section title="5. Customer Responsibilities">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Ensure your vehicle is accessible at the specified parking location during the service window.</li>
              <li>Provide an accurate vehicle plate number during booking.</li>
              <li>Do not remove valuables from your vehicle before service; we are not responsible for lost or missing items.</li>
              <li>Notify us promptly if your vehicle has any pre-existing damage.</li>
            </ul>
          </Section>

          <Section title="6. Service Quality">
            <p>We take pride in our waterless car wash process. If you are unsatisfied with the result, contact us within 24 hours of service completion at <a href="mailto:support@parknshine.id" className="text-[#0036a4] underline">support@parknshine.id</a> and we will make it right.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>Park &amp; Shine is not liable for any indirect, incidental, or consequential damages arising from the use of our service. Our total liability for any claim arising from a single booking shall not exceed the amount paid for that booking.</p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>All content on the Park &amp; Shine platform — including logos, text, and software — is the property of Park &amp; Shine and may not be reproduced or used without prior written consent.</p>
          </Section>

          <Section title="9. Modifications">
            <p>We reserve the right to update these Terms at any time. Continued use of our services after changes are posted constitutes your acceptance of the revised Terms. We will provide notice of material changes via email or in-app notification.</p>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms are governed by the laws of the Republic of Indonesia. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Jakarta, Indonesia.</p>
          </Section>

          <Section title="11. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:legal@parknshine.id" className="text-[#0036a4] underline">legal@parknshine.id</a>.</p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-[20px] text-black mb-3"
        style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500 }}
      >
        {title}
      </h2>
      <div className="text-[#3d3d3d] text-base leading-[26px]">{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#00164f] border-t border-[#455b72] mt-auto">
      <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="text-[#b2c9e4] text-sm"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          © 2026 Park & Shine. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Privacy Policy</Link>
          <Link href="/terms" className="text-white text-sm hover:text-[#b2c9e4] transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Terms</Link>
          <Link href="/contact" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
