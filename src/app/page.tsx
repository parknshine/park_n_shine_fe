"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";

const imgParkShineLogo = "/park_n_shine_logo.jpeg.png";
const imgScanningQrCode = "/park-shine-panel-1.jpeg";
const imgPhotographingCarPlate = "/park-shine-panel-2.jpeg";
const imgStaffWashingCar = "/park-shine-panel-3.jpeg";
const imgNotificationOnPhone = "/park-shine-panel-4.jpeg";
const imgHero = "/park-shine-hero.jpeg";

const languages = [
  { code: "ID", label: "Indonesia" },
  { code: "EN", label: "English" },
];

const howItWorksData = [
  { step: 1, image: imgScanningQrCode, tilt: "tilt-left" },
  { step: 2, image: imgPhotographingCarPlate, tilt: "tilt-right raised" },
  { step: 3, image: imgStaffWashingCar, tilt: "tilt-left" },
  { step: 4, image: imgNotificationOnPhone, tilt: "tilt-right raised" },
];

const trackStepsData = [
  { done: true, current: false },
  { done: false, current: true },
  { done: false, current: false },
  { done: false, current: false },
  { done: false, current: false },
];

const navSections = [
  { key: "services" as const, sectionId: "process" },
  { key: "pricing" as const, sectionId: "pricing" },
];

export default function Home() {
  const { t } = useTranslation("customer");
  const locale = useUIStore((s) => s.locale);
  const setLocale = useUIStore((s) => s.setLocale);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pricingFeatures = [
    t("landingPage.pricing.feature1"),
    t("landingPage.pricing.feature2"),
    t("landingPage.pricing.feature3"),
    t("landingPage.pricing.feature4"),
    t("landingPage.pricing.feature5"),
  ];

  function handleNavClick(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  }

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header className='topbar'>
        <nav className='nav shell'>
          <a className='brand' href='#top'>
            <Image
              className='brand-logo'
              src={imgParkShineLogo}
              alt='Park and Shine Car Wash logo'
              width={48}
              height={48}
            />
            <span>Park &amp; Shine</span>
          </a>

          <button
            className='nav-toggle'
            type='button'
            aria-expanded={isMenuOpen}
            aria-controls='nav-menu'
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className={`nav-links${isMenuOpen ? " open" : ""}`}
            id='nav-menu'
          >
            {navSections.map(({ key, sectionId }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(sectionId);
                }}
              >
                {t(`landingPage.nav.${key}`)}
              </a>
            ))}

            <div className='nav-actions'>
              <a className='button button-small' href='/book/capture'>
                {t("landingPage.nav.bookNow")}
              </a>

              {/* Language dropdown */}
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  type='button'
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    border: "1.5px solid var(--outline)",
                    borderRadius: "999px",
                    padding: "0.35rem 0.85rem",
                    background: "transparent",
                    color: "var(--primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  aria-label={
                    locale === "id" ? "Ganti bahasa" : "Change language"
                  }
                >
                  {locale.toUpperCase()}
                  <svg
                    width='10'
                    height='6'
                    viewBox='0 0 10 6'
                    fill='none'
                    style={{
                      transition: "transform 0.2s",
                      transform: isDropdownOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    <path
                      d='M1 1L5 5L9 1'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 0.5rem)",
                      minWidth: "9rem",
                      background: "#fff",
                      borderRadius: "1rem",
                      boxShadow: "0 8px 24px rgba(0,98,137,0.12)",
                      overflow: "hidden",
                      zIndex: 60,
                    }}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type='button'
                        onClick={() => {
                          setLocale(lang.code.toLowerCase() as "id" | "en");
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.65rem 1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "transparent",
                          border: 0,
                          cursor: "pointer",
                          fontWeight:
                            locale.toUpperCase() === lang.code ? 700 : 400,
                          color:
                            locale.toUpperCase() === lang.code
                              ? "var(--primary)"
                              : "var(--text-soft)",
                        }}
                      >
                        <span>{lang.label}</span>
                        <span style={{ fontSize: "0.78rem" }}>{lang.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main id='top'>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className='hero shell'>
          <div className='hero-copy'>
            <span className='eyebrow'>
              Save Time &amp; Spend It With Loved Ones
            </span>
            <h1>
              {t("landingPage.hero.heading")
                .split("\n")
                .map((line, i) =>
                  i === 0 ? line : <span key={i}>{line}</span>,
                )}
            </h1>
            <p>{t("landingPage.hero.description")}</p>
            <div className='hero-actions'>
              <a className='button' href='/book/capture'>
                {t("landingPage.hero.btnBookNow")}
              </a>
              <a className='button button-muted' href='#pricing'>
                {t("landingPage.hero.btnViewPricing")}
              </a>
            </div>
          </div>

          <div className='hero-visual'>
            <div className='hero-glow hero-glow-yellow' />
            <div className='hero-glow hero-glow-blue' />
            <Image
              src={imgHero}
              alt={t("landingPage.hero.imageAlt")}
              fill
              priority
              sizes='(max-width: 1050px) 100vw, 52vw'
            />
          </div>
        </section>

        {/* ── How the Magic Happens ─────────────────────────────── */}
        <section className='process-wrap' id='process'>
          <div className='shell'>
            <div className='section-heading centered'>
              <h2>{t("landingPage.howItWorks.title")}</h2>
            </div>

            <div className='comic-grid'>
              {howItWorksData.map(({ step, image, tilt }) => (
                <article key={step} className={`comic-card ${tilt}`}>
                  <span className='panel-step'>{step}</span>
                  <div className='panel-image'>
                    <Image
                      src={image}
                      alt=''
                      fill
                      sizes='(max-width: 800px) 50vw, 25vw'
                    />
                  </div>
                  <div className='speech-bubble'>
                    <h3>{t(`landingPage.howItWorks.card${step}.title`)}</h3>
                    <p>{t(`landingPage.howItWorks.card${step}.description`)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────── */}
        <section className='shell plans-section' id='pricing'>
          <div className='section-heading centered'>
            <h2>{t("landingPage.pricing.title")}</h2>
            <p>{t("landingPage.pricing.subtitle")}</p>
          </div>

          <div className='plans-grid'>
            <article className='plan-card'>
              <h3>{t("landingPage.pricing.serviceLabel")}</h3>
              <p className='price'>Rp50.000</p>
              <p>{t("landingPage.pricing.description")}</p>
              <ul>
                {pricingFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* ── Track Your Wash ───────────────────────────────────── */}
        <section className='shell tracker-section'>
          <div className='tracker-card'>
            <div className='tracker-copy'>
              <h2>{t("landingPage.track.title")}</h2>
              <p>{t("landingPage.track.description")}</p>
            </div>

            <div className='bubble-progress' aria-label='Wash progress example'>
              {trackStepsData.flatMap(({ done, current }, i) => {
                const bubbleCls = current
                  ? "bubble bubble-active"
                  : done
                    ? "bubble bubble-done"
                    : "bubble bubble-idle";
                const stepCls = `progress-step ${current ? "progress-step-active" : done ? "progress-step-done" : "progress-step-upcoming"}`;
                const elements = [
                  <div key={`step-${i}`} className={stepCls}>
                    <div className={bubbleCls}>{i + 1}</div>
                    <span>{t(`landingPage.track.step${i + 1}`)}</span>
                  </div>,
                ];
                if (i < trackStepsData.length - 1) {
                  const lineActive = done || current;
                  elements.push(
                    <div
                      key={`line-${i}`}
                      className={`bubble-line${lineActive ? " bubble-line-active" : ""}`}
                    />,
                  );
                }
                return elements;
              })}
            </div>

            <div className='tracker-action'>
              <a className='button' href='/book/capture'>
                {t("landingPage.track.bookNow")}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className='footer'>
        <div className='shell footer-inner'>
          <div className='footer-brand'>Park &amp; Shine</div>
          <div className='footer-links'>
            <a href='/terms'>{t("landingPage.footer.termsOfService")}</a>
            <a href='/privacy-policy'>
              {t("landingPage.footer.privacyPolicy")}
            </a>
            <a href='/support'>{t("landingPage.footer.support")}</a>
            <a href='/contact'>{t("landingPage.footer.contactUs")}</a>
          </div>
          <p>{t("landingPage.footer.copyright")}</p>
        </div>
      </footer>

      {/* ── Mobile dock ────────────────────────────────────────── */}
      <nav className='mobile-dock'>
        <a className='dock-link active' href='#top'>
          Home
        </a>
        <a
          className='dock-link'
          href='#process'
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("process");
          }}
        >
          {t("landingPage.nav.services")}
        </a>
        <a className='dock-link dock-link-cta' href='/book/capture'>
          {t("landingPage.nav.bookNow")}
        </a>
      </nav>
    </>
  );
}
