"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n";
import { MarketingHeader, MarketingFooter } from "@/components/shared";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";
const inputClass =
  "w-full rounded border border-[#e8e8e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#024ad8] transition-colors placeholder:text-[#9ca3af]";

const EMAIL = "info@parknshine.net";
const OFFICE_ADDRESS =
  "Komplek Prima Center I Blok I Nomor 1, Jl. Pool PPD Jl. Pesing Poglar No.2, Kedaung Kali Angke, Cengkareng, Jakarta Barat, 11710";

const emailIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
  </svg>
);
const phoneIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor" />
  </svg>
);
const locationIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
  </svg>
);
const clockIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" fill="currentColor" />
  </svg>
);

export function ContactContent() {
  const { t } = useTranslation("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const contactItems = [
    { icon: emailIcon, label: t("contact.email"), value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: phoneIcon, label: t("contact.whatsapp"), value: t("contact.numberTba"), href: null },
    { icon: locationIcon, label: t("contact.office"), value: OFFICE_ADDRESS, href: null },
    { icon: clockIcon, label: t("contact.businessHours"), value: t("contact.businessHoursValue"), href: null },
  ];

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    globalThis.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MarketingHeader showLanguageSwitcher backLabel={t("contact.backHome")} />

      {/* Hero */}
      <section className="bg-[#f7f7f7] border-b border-[#e8e8e8] py-12 md:py-16">
        <div className="max-w-200 mx-auto px-4 md:px-12 text-center">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-[#1a1a1a] mb-3"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t("contact.title")}
          </h1>
          <p
            className="text-[#636363] text-base md:text-lg leading-relaxed max-w-120 mx-auto"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-250 mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="flex flex-col gap-4">
            {contactItems.map(({ icon, label, value, href }) => (
              <div
                key={label}
                className="rounded-xl border border-[#e8e8e8] p-5 flex gap-4 items-start shadow-[0_2px_8px_rgba(26,26,26,0.06)]"
              >
                <div className="size-10 rounded-lg bg-[#f0f4ff] text-[#024ad8] flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-widest text-[#636363] mb-0.5"
                    style={{ fontFamily: inter, fontWeight: 600 }}
                  >
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="text-base text-[#1a1a1a] hover:text-[#024ad8] transition-colors"
                      style={{ fontFamily: inter, fontWeight: 400 }}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-base text-[#1a1a1a]" style={{ fontFamily: inter, fontWeight: 400 }}>
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div>
            <h2
              className="text-[24px] text-[#1a1a1a] mb-2"
              style={{ fontFamily: manrope, fontWeight: 500 }}
            >
              {t("contact.form.title")}
            </h2>
            <p
              className="text-[#636363] text-sm mb-6"
              style={{ fontFamily: inter, fontWeight: 400 }}
            >
              {t("contact.form.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" style={{ fontFamily: inter, fontWeight: 600 }}>
                    {t("contact.form.fullName")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("contact.form.namePlaceholder")}
                    className={inputClass}
                    style={{ fontFamily: inter }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-[#1a1a1a]" style={{ fontFamily: inter, fontWeight: 600 }}>
                    {t("contact.form.emailAddress")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("contact.form.emailPlaceholder")}
                    className={inputClass}
                    style={{ fontFamily: inter }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a1a]" style={{ fontFamily: inter, fontWeight: 600 }}>
                  {t("contact.form.subject")}
                </label>
                <input
                  type="text"
                  placeholder={t("contact.form.subjectPlaceholder")}
                  className={inputClass}
                  style={{ fontFamily: inter }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#1a1a1a]" style={{ fontFamily: inter, fontWeight: 600 }}>
                  {t("contact.form.message")}
                </label>
                <textarea
                  rows={5}
                  placeholder={t("contact.form.messagePlaceholder")}
                  className={`${inputClass} resize-none`}
                  style={{ fontFamily: inter }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#024ad8] text-white rounded px-8 py-3 text-sm tracking-[0.7px]"
                  style={{ fontFamily: inter, fontWeight: 600, textTransform: "uppercase" }}
                >
                  {t("contact.form.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <MarketingFooter activePage="contact" />
    </div>
  );
}
