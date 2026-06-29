"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { MarketingHeader, MarketingFooter } from "@/components/shared";
import { FaqAccordion } from "./_components/faq-accordion";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const quickLinks = [
  { key: "bookWash" as const, href: "/book/location" },
  { key: "contactUs" as const, href: "/contact" },
  { key: "privacyPolicy" as const, href: "/privacy-policy" },
  { key: "terms" as const, href: "/terms" },
];

export function SupportContent() {
  const { t } = useTranslation("common");

  const faqs = t("support.faqs", { returnObjects: true }) as {
    question: string;
    answer: string;
  }[];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MarketingHeader showLanguageSwitcher backLabel={t("support.backHome")} />

      {/* Hero */}
      <section className="bg-[#f7f7f7] border-b border-[#e8e8e8] py-12 md:py-16">
        <div className="max-w-200 mx-auto px-4 md:px-12 text-center">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-[#1a1a1a] mb-3"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t("support.title")}
          </h1>
          <p
            className="text-[#636363] text-base md:text-lg leading-6.75 max-w-120 mx-auto"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            {t("support.subtitle")}
          </p>
        </div>
      </section>

      {/* Quick links */}
      <section className="bg-white border-b border-[#e8e8e8] py-6">
        <div className="max-w-200 mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="rounded-xl border border-[#e8e8e8] px-4 py-3 text-sm text-center text-[#024ad8] hover:bg-[#f7f7f7] hover:border-[#024ad8] transition-colors"
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                {t(`support.quickLinks.${key}`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-200 mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        {/* FAQ */}
        <h2
          className="text-[24px] text-[#1a1a1a] mb-6"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          {t("support.faqTitle")}
        </h2>
        <FaqAccordion items={faqs} />

        {/* Still need help */}
        <div className="bg-[#f0f4ff] border border-[#dce1ff] rounded-2xl p-8 text-center mt-12">
          <h3
            className="text-[#024ad8] text-[22px] mb-2"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t("support.cta.title")}
          </h3>
          <p
            className="text-[#3d3d3d] text-base mb-6"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            {t("support.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:info@parknshine.net"
              className="bg-[#024ad8] text-white text-sm tracking-[0.7px] px-8 py-3 rounded text-center"
              style={{ fontFamily: inter, fontWeight: 600, textTransform: "uppercase" }}
            >
              {t("support.cta.emailBtn")}
            </a>
            <Link
              href="/contact"
              className="border border-[#024ad8] text-[#024ad8] text-sm tracking-[0.7px] px-8 py-3 rounded text-center"
              style={{ fontFamily: inter, fontWeight: 600, textTransform: "uppercase" }}
            >
              {t("support.cta.contactBtn")}
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter activePage="support" />
    </div>
  );
}
