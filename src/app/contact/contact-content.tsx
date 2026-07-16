"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n";
import { MarketingHeader, MarketingFooter } from "@/components/shared";
import {
  CONTACT_EMAIL,
  OFFICE_ADDRESS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  FACEBOOK_NAME,
  FACEBOOK_URL,
} from "@/lib/contact-info";
import {
  EmailIcon,
  WhatsAppIcon,
  LocationIcon,
  ClockIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/components/shared/social-icons";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";
const inputClass =
  "w-full rounded border border-[#e8e8e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#024ad8] transition-colors placeholder:text-[#9ca3af]";

interface ContactContentProps {
  whatsappNumber: string;
}

export function ContactContent({ whatsappNumber }: ContactContentProps) {
  const { t } = useTranslation("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const contactItems = [
    { icon: <EmailIcon />, label: t("contact.email"), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    {
      icon: <WhatsAppIcon />,
      label: t("contact.whatsapp"),
      value: whatsappNumber || t("contact.numberTba"),
      href: whatsappNumber ? `https://wa.me/${whatsappNumber}` : null,
    },
    { icon: <LocationIcon />, label: t("contact.office"), value: OFFICE_ADDRESS, href: null },
    { icon: <ClockIcon />, label: t("contact.businessHours"), value: t("contact.businessHoursValue"), href: null },
    { icon: <InstagramIcon />, label: t("contact.instagram"), value: INSTAGRAM_HANDLE, href: INSTAGRAM_URL, external: true },
    { icon: <FacebookIcon />, label: t("contact.facebook"), value: FACEBOOK_NAME, href: FACEBOOK_URL, external: true },
  ];

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    globalThis.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MarketingHeader showLanguageSwitcher backLabel={t("action.back")} />

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
            {contactItems.map(({ icon, label, value, href, external }) => (
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
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
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

      <MarketingFooter activePage="contact" whatsappNumber={whatsappNumber} />
    </div>
  );
}
