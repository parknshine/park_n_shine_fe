import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
};

const contactItems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
      </svg>
    ),
    label: "Email",
    value: "hello@parknshine.id",
    href: "mailto:hello@parknshine.id",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor" />
      </svg>
    ),
    label: "Phone / WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
      </svg>
    ),
    label: "Office",
    value: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220",
    href: null,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" fill="currentColor" />
      </svg>
    ),
    label: "Business Hours",
    value: "Monday – Saturday, 08:00 – 20:00 WIB",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", boxShadow: "0 8px 24px rgba(0,98,137,0.04)" }}>
        <div className="max-w-295 mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
            Park &amp; Shine
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold transition-colors" style={{ color: "var(--text-soft)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16" style={{ background: "var(--surface-low)", borderBottom: "1px solid var(--surface-high)" }}>
        <div className="max-w-[800px] mx-auto px-4 md:px-8 text-center">
          <h1 className="text-[32px] md:text-[44px] font-extrabold leading-tight tracking-tight mb-3" style={{ color: "var(--primary)" }}>
            Contact Us
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-120 mx-auto" style={{ color: "var(--text-soft)" }}>
            Have a question or need help? We&apos;d love to hear from you. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact info grid */}
      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {contactItems.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="rounded-2xl p-6 flex gap-4 items-start"
              style={{ background: "var(--surface-card)", boxShadow: "var(--shadow)" }}
            >
              <div className="shrink-0 rounded-xl size-12 flex items-center justify-center" style={{ background: "var(--surface-low)", color: "var(--primary)" }}>
                {icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: "var(--text-soft)" }}>
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    className="text-base leading-6 font-medium transition-colors hover:opacity-80"
                    style={{ color: "var(--foreground)" }}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-base leading-6" style={{ color: "var(--foreground)" }}>
                    {value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ borderTop: "1px solid var(--surface-high)", paddingTop: "2.5rem" }}>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: "var(--primary)" }}>
            Send us a message
          </h2>
          <p className="text-base mb-6" style={{ color: "var(--text-soft)" }}>
            Fill out the form and our team will get back to you within 1 business day.
          </p>

          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Full Name</label>
                <input type="text" placeholder="Your name" className="input-field rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Email Address</label>
                <input type="email" placeholder="you@example.com" className="input-field rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Subject</label>
              <input type="text" placeholder="What is your message about?" className="input-field rounded-xl px-4 py-3 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Message</label>
              <textarea rows={5} placeholder="Tell us how we can help..." className="input-field rounded-xl px-4 py-3 text-sm resize-none" />
            </div>
            <div>
              <button
                type="submit"
                className="px-8 py-3 rounded-full font-extrabold text-sm text-white w-full sm:w-auto transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(180deg, var(--primary-bright), var(--primary))", boxShadow: "var(--shadow-soft)" }}
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer style={{ background: "var(--surface-low)", borderTop: "1px solid var(--surface-high)" }}>
        <div className="max-w-295 mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm" style={{ color: "var(--text-soft)" }}>
            © 2026 Park &amp; Shine. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-soft)" }}>Privacy Policy</Link>
            <Link href="/terms" className="text-sm transition-colors hover:opacity-80" style={{ color: "var(--text-soft)" }}>Terms</Link>
            <Link href="/contact" className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
