"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";
import {
  usePublicTestimonials,
  usePublicSettings,
} from "@/features/customer/hooks";
import { BookNowModal } from "@/features/customer/components/book-now-modal";
import { MarketingFooter, PromoBannerPopup } from "@/components/shared";

const imgParkShineLogo = "/parknshinelogo.svg";
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

  const { data: testimonials = [] } = usePublicTestimonials();
  const { whatsappNumber } = usePublicSettings();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [bookNowOpen, setBookNowOpen] = useState(false);
  const captureHref = "/book/capture";
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCarouselPaused || testimonials.length === 0) return;
    carouselTimerRef.current = setInterval(() => {
      setTestimonialIndex((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [isCarouselPaused, testimonials.length, testimonialIndex]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    <div className='landing-bg'>
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
              style={{ width: "auto", height: "auto" }}
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
              <button
                type='button'
                className='button button-small'
                onClick={() => setBookNowOpen(true)}
              >
                {t("landingPage.nav.bookNow")}
              </button>

              {/* Language dropdown */}
              <div className='relative' ref={dropdownRef}>
                <button
                  type='button'
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className='flex items-center gap-[0.4rem] border-[1.5px] border-[var(--outline)] rounded-full px-[0.85rem] py-[0.35rem] bg-transparent text-[var(--primary)] font-bold cursor-pointer'
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
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
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
                  <div className='absolute right-0 top-[calc(100%+0.5rem)] min-w-[9rem] bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,98,137,0.12)] overflow-hidden z-[60]'>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type='button'
                        onClick={() => {
                          setLocale(lang.code.toLowerCase() as "id" | "en");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-[0.65rem] flex justify-between items-center bg-transparent border-0 cursor-pointer ${locale.toUpperCase() === lang.code ? "font-bold text-[var(--primary)]" : "font-normal text-[var(--text-soft)]"}`}
                      >
                        <span>{lang.label}</span>
                        <span className='text-[0.78rem]'>{lang.code}</span>
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
              <button
                type='button'
                className='button'
                onClick={() => setBookNowOpen(true)}
              >
                {t("landingPage.hero.btnBookNow")}
              </button>
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
              <svg
                width='48'
                height='48'
                viewBox='0 0 48 48'
                fill='none'
                aria-hidden='true'
                className='mx-auto mb-3'
              >
                <path
                  d='M24 6L26.8 20.2L41 24L26.8 27.8L24 42L21.2 27.8L7 24L21.2 20.2L24 6Z'
                  fill='#006289'
                  fillOpacity='0.15'
                />
                <path
                  d='M24 10L26.2 21.2L37 24L26.2 26.8L24 38L21.8 26.8L11 24L21.8 21.2L24 10Z'
                  fill='#006289'
                />
              </svg>
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
        <section className='plans-section-promo' id='pricing'>
          <div className='shell plans-promo-inner'>
            <div>
              <p className='plans-promo-subtitle'>
                {t("landingPage.pricing.subtitle")}
              </p>
              <h2 className='plans-promo-title'>
                {t("landingPage.pricing.title")}
              </h2>
            </div>
            <article className='plan-card plans-promo-card'>
              <h3>{t("landingPage.pricing.serviceLabel")}</h3>
              <p className='price'>
                <span className='price-original'>Rp70.000</span>
                Rp50.000
              </p>
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
        <section className='shell tracker-section pt-12'>
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
                    <div className={bubbleCls}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/step${i + 1}.svg`}
                        alt=''
                        width={22}
                        height={22}
                        className='bubble-step-icon'
                      />
                    </div>
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
              <button
                type='button'
                className='button'
                onClick={() => setBookNowOpen(true)}
              >
                {t("landingPage.track.bookNow")}
              </button>
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────── */}
        {testimonials.length > 0 && (
          <section id='testimonials' className='shell pt-16 pb-16'>
            <div
              className='relative rounded-3xl bg-[var(--surface-low)] px-8 py-10 md:px-14 md:py-16'
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* Counter — top right */}
              <div className='flex justify-end mb-6 text-sm font-medium text-[var(--text-soft)] select-none'>
                <span className='text-[var(--foreground)] text-lg font-bold'>
                  {String(testimonialIndex + 1).padStart(2, "0")}
                </span>
                <span className='mx-1.5'>／</span>
                <span>{String(testimonials.length).padStart(2, "0")}</span>
              </div>

              {/* Slide content — fade+slide animation on index change */}
              {(() => {
                const item = testimonials[testimonialIndex];
                return (
                  <div
                    key={testimonialIndex}
                    className='testimonial-slide-in'
                    style={{ minHeight: 280 }}
                  >
                    {/* Stars */}
                    <div className='flex gap-1 mb-5'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`star-${i + 1}`}
                          className={`h-[22px] w-[22px] ${i < item.rating ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--surface-high)]"}`}
                        />
                      ))}
                    </div>

                    {/* Headline — large editorial quote */}
                    {item.title && (
                      <h3
                        className='font-semibold text-[var(--foreground)] leading-[1.12] tracking-[-0.025em] mb-5 max-w-[20ch]'
                        style={{ fontSize: "clamp(28px, 4.2vw, 50px)" }}
                      >
                        &ldquo;{item.title}&rdquo;
                      </h3>
                    )}

                    {/* Body */}
                    <p
                      className='text-[var(--text-soft)] leading-relaxed max-w-[56ch]'
                      style={{ fontSize: 17 }}
                    >
                      {item.body}
                    </p>
                  </div>
                );
              })()}

              {/* Footer: author + nav */}
              <div className='flex items-center justify-between gap-4 mt-12 flex-wrap'>
                {/* Author chip */}
                <div className='flex items-center gap-3.5'>
                  <div className='w-11.5 h-11.5 rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0 text-[var(--primary)]'>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      aria-hidden='true'
                    >
                      <circle
                        cx='12'
                        cy='8.2'
                        r='3.6'
                        stroke='currentColor'
                        strokeWidth='1.6'
                      />
                      <path
                        d='M4.8 19.4c0-3.6 3.2-5.6 7.2-5.6s7.2 2 7.2 5.6'
                        stroke='currentColor'
                        strokeWidth='1.6'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                  <div className='flex flex-col leading-tight'>
                    <span className='font-semibold text-[15.5px] text-foreground'>
                      {testimonials[testimonialIndex].authorName}
                    </span>
                    {testimonials[testimonialIndex].location && (
                      <span className='text-[13.5px] text-(--text-soft)'>
                        {testimonials[testimonialIndex].location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar + nav arrows */}
                {testimonials.length > 1 && (
                  <div className='flex items-center gap-3.5 flex-shrink-0'>
                    <div className='hidden sm:block w-40 h-1 rounded-full bg-[var(--surface-high)] overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-[var(--primary)] transition-all duration-500'
                        style={{
                          width: `${((testimonialIndex + 1) / testimonials.length) * 100}%`,
                        }}
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() =>
                        setTestimonialIndex(
                          (c) =>
                            (c - 1 + testimonials.length) % testimonials.length,
                        )
                      }
                      aria-label='Previous testimonial'
                      className='w-[54px] h-[54px] rounded-full border border-[var(--border)] bg-white flex items-center justify-center text-[var(--foreground)] cursor-pointer hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-colors'
                    >
                      <ChevronLeft className='h-5 w-5' />
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        setTestimonialIndex(
                          (c) => (c + 1) % testimonials.length,
                        )
                      }
                      aria-label='Next testimonial'
                      className='w-[54px] h-[54px] rounded-full border border-[var(--border)] bg-white flex items-center justify-center text-[var(--foreground)] cursor-pointer hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-colors'
                    >
                      <ChevronRight className='h-5 w-5' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <MarketingFooter whatsappNumber={whatsappNumber} />

      {/* ── Mobile dock ────────────────────────────────────────── */}
      <nav className='mobile-dock'>
        <a className='dock-link active' href='#top'>
          {t("landingPage.nav.home")}
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
        <button
          type='button'
          className='dock-link dock-link-cta'
          onClick={() => setBookNowOpen(true)}
        >
          {t("landingPage.nav.bookNow")}
        </button>
      </nav>
      <BookNowModal
        captureHref={captureHref}
        open={bookNowOpen}
        onOpenChange={setBookNowOpen}
      />
      <PromoBannerPopup />
    </div>
  );
}
