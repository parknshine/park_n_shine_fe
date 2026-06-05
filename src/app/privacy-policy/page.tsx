import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function PrivacyPolicyPage() {
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
      <main className="flex-1 max-w-200 mx-auto w-full px-4 md:px-12 py-12 md:py-20">
        <h1
          className="text-[32px] md:text-[44px] leading-tight text-black mb-2"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          Privacy Policy
        </h1>
        <p className="text-[#5f5e5e] text-sm mb-10" style={{ fontFamily: inter }}>
          Last updated: May 2026
        </p>

        <div className="flex flex-col gap-10" style={{ fontFamily: inter }}>
          <Section title="1. Information We Collect">
            <p>We collect information you provide directly when booking our waterless car wash service, including your name, vehicle plate number, phone number, and parking location. We also collect usage data such as booking history and service status to improve our platform.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information is used to:</p>
            <ul className="list-disc pl-5 mt-3 flex flex-col gap-2">
              <li>Process and confirm your car wash bookings</li>
              <li>Notify you of service progress and completion</li>
              <li>Assign crew members to your vehicle</li>
              <li>Improve and personalize our services</li>
              <li>Communicate promotions and service updates (with your consent)</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing">
            <p>We do not sell your personal data to third parties. We share your information only with our crew operators who need it to perform the service, and with service providers who help us operate our platform (e.g., cloud hosting, payment processing). All partners are bound by confidentiality obligations.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us at <a href="mailto:privacy@parknshine.id" className="text-[#0036a4] underline">privacy@parknshine.id</a>.</p>
          </Section>

          <Section title="5. Security">
            <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), secure token authentication, and access controls to protect your personal information from unauthorized access or disclosure.</p>
          </Section>

          <Section title="6. Cookies">
            <p>Our web app uses local storage and session cookies to keep you logged in and remember your preferences (such as language). We do not use tracking cookies for advertising purposes.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:privacy@parknshine.id" className="text-[#0036a4] underline">privacy@parknshine.id</a>. We will respond within 14 business days.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of our service after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>For privacy-related questions, contact our Data Protection Officer at <a href="mailto:privacy@parknshine.id" className="text-[#0036a4] underline">privacy@parknshine.id</a>.</p>
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
          <Link href="/privacy-policy" className="text-white text-sm hover:text-[#b2c9e4] transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Privacy Policy</Link>
          <Link href="/terms" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Terms</Link>
          <Link href="/contact" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
