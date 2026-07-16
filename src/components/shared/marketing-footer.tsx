"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import {
  CONTACT_EMAIL,
  OFFICE_ADDRESS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  FACEBOOK_NAME,
  FACEBOOK_URL,
} from "@/lib/contact-info";
import { InstagramIcon, FacebookIcon } from "./social-icons";

type ActivePage = "support" | "privacy-policy" | "terms" | "contact";

interface MarketingFooterProps {
  activePage?: ActivePage;
  whatsappNumber?: string;
}

const inter = "var(--font-inter), sans-serif";
const linkColor = "rgba(0, 98, 137, 0.72)";

const links: { labelKey: string; href: string; page: ActivePage }[] = [
  { labelKey: "contact.nav.privacyPolicy", href: "/privacy-policy", page: "privacy-policy" },
  { labelKey: "contact.nav.terms", href: "/terms", page: "terms" },
  { labelKey: "contact.nav.support", href: "/support", page: "support" },
  { labelKey: "contact.nav.contact", href: "/contact", page: "contact" },
];

export function MarketingFooter({ activePage, whatsappNumber }: MarketingFooterProps) {
  const { t } = useTranslation("common");

  return (
    <footer
      className="mt-auto rounded-t-[3rem]"
      style={{ background: "rgba(223, 234, 241, 0.7)" }}
    >
      <div className="max-w-341.5 mx-auto px-4 md:px-12 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-base" style={{ fontFamily: inter, fontWeight: 800, color: "var(--primary)" }}>
            Park &amp; Shine
          </span>
          <p className="text-sm max-w-70" style={{ fontFamily: inter, color: "var(--text-soft)" }}>
            {OFFICE_ADDRESS}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm" style={{ fontFamily: inter, fontWeight: 700, color: "var(--primary)" }}>
            {t("contact.quickLinksHeading")}
          </span>
          <div className="flex flex-col gap-2">
            {links.map(({ labelKey, href, page }) => (
              <Link
                key={page}
                href={href}
                className="text-sm transition-colors w-fit"
                style={{
                  fontFamily: inter,
                  fontWeight: 700,
                  color: activePage === page ? "var(--primary)" : linkColor,
                }}
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm" style={{ fontFamily: inter, fontWeight: 700, color: "var(--primary)" }}>
            {t("contact.contactHeading")}
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm transition-colors w-fit"
            style={{ fontFamily: inter, color: linkColor }}
          >
            {CONTACT_EMAIL}
          </a>
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm transition-colors w-fit"
              style={{ fontFamily: inter, color: linkColor }}
            >
              {whatsappNumber}
            </a>
          ) : (
            <span className="text-sm" style={{ fontFamily: inter, color: "var(--text-soft)" }}>
              {t("contact.numberTba")}
            </span>
          )}
          <div className="flex gap-4 mt-1">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={INSTAGRAM_HANDLE}
              className="transition-colors"
              style={{ color: linkColor }}
            >
              <InstagramIcon />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={FACEBOOK_NAME}
              className="transition-colors"
              style={{ color: linkColor }}
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-341.5 mx-auto px-4 md:px-12 py-6">
          <span className="text-sm" style={{ fontFamily: inter, color: "var(--text-soft)" }}>
            © 2026 Park &amp; Shine. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
