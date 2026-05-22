import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
};

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const contactItems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#0036a4" />
      </svg>
    ),
    label: "Email",
    value: "hello@parknshine.id",
    href: "mailto:hello@parknshine.id",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#0036a4" />
      </svg>
    ),
    label: "Phone / WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#0036a4" />
      </svg>
    ),
    label: "Office",
    value: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220",
    href: null,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" fill="#0036a4" />
      </svg>
    ),
    label: "Business Hours",
    value: "Monday – Saturday, 08:00 – 20:00 WIB",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
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

      {/* Hero */}
      <section className="bg-[#f7f7f7] py-12 md:py-16 border-b border-[#e8e8e8]">
        <div className="max-w-[800px] mx-auto px-4 md:px-12 text-center">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-black mb-3"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            Contact Us
          </h1>
          <p
            className="text-[#5f5e5e] text-base md:text-lg leading-[27px] max-w-[480px] mx-auto"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            Have a question or need help? We&apos;d love to hear from you. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact info grid */}
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {contactItems.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="bg-white border border-[#e8e8e8] rounded-xl p-6 flex gap-4 items-start"
              style={{ filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.06))" }}
            >
              <div className="shrink-0 bg-[#dce1ff] rounded-xl size-12 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <p
                  className="text-[#5f5e5e] text-xs uppercase tracking-[0.7px] mb-1"
                  style={{ fontFamily: inter, fontWeight: 600 }}
                >
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="text-[#1a1c1c] text-base leading-6 hover:text-[#0036a4] transition-colors"
                    style={{ fontFamily: inter, fontWeight: 400 }}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {value}
                  </a>
                ) : (
                  <p
                    className="text-[#1a1c1c] text-base leading-6"
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-[#e8e8e8] pt-10">
          <h2
            className="text-[24px] text-black mb-2"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            Send us a message
          </h2>
          <p
            className="text-[#5f5e5e] text-base mb-6"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            Fill out the form and our team will get back to you within 1 business day.
          </p>

          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1c1c]" style={{ fontFamily: inter, fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="border border-[#c2c2c2] rounded-md px-4 py-3 text-base text-[#1a1c1c] outline-none focus:border-[#0036a4] transition-colors"
                  style={{ fontFamily: inter }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1c1c]" style={{ fontFamily: inter, fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="border border-[#c2c2c2] rounded-md px-4 py-3 text-base text-[#1a1c1c] outline-none focus:border-[#0036a4] transition-colors"
                  style={{ fontFamily: inter }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1c1c]" style={{ fontFamily: inter, fontWeight: 600 }}>Subject</label>
              <input
                type="text"
                placeholder="What is your message about?"
                className="border border-[#c2c2c2] rounded-md px-4 py-3 text-base text-[#1a1c1c] outline-none focus:border-[#0036a4] transition-colors"
                style={{ fontFamily: inter }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#1a1c1c]" style={{ fontFamily: inter, fontWeight: 600 }}>Message</label>
              <textarea
                rows={5}
                placeholder="Tell us how we can help..."
                className="border border-[#c2c2c2] rounded-md px-4 py-3 text-base text-[#1a1c1c] outline-none focus:border-[#0036a4] transition-colors resize-none"
                style={{ fontFamily: inter }}
              />
            </div>
            <div>
              <button
                type="submit"
                className="bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-4 rounded w-full sm:w-auto"
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
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
          <Link href="/terms" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Terms</Link>
          <Link href="/contact" className="text-white text-sm hover:text-[#b2c9e4] transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
