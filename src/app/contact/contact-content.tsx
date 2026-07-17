"use client";

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

interface ContactContentProps {
  whatsappNumber: string;
}

export function ContactContent({ whatsappNumber }: ContactContentProps) {
  const { t } = useTranslation("common");

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </main>

      <MarketingFooter activePage="contact" whatsappNumber={whatsappNumber} />
    </div>
  );
}
