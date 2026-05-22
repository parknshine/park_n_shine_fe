"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { useUIStore } from "@/store/ui-store";

const imgParkShineLogo = "/park_n_shine_logo.jpeg.png";
const imgScanningQrCode = "/park-shine-panel-1.jpeg";
const imgPhotographingCarPlate = "/park-shine-panel-2.jpeg";
const imgStaffWashingCar = "/park-shine-panel-3.jpeg";
const imgNotificationOnPhone = "/park-shine-panel-4.jpeg";
const imgHero = "/park-shine-hero.jpeg";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const languages = [
  { code: "ID", label: "Indonesia" },
  { code: "EN", label: "English" },
];

const howItWorksData = [
  {
    step: 1,
    image: imgScanningQrCode,
    imageStyle: { left: "-69.35%", width: "238.69%", height: "100%", top: "0" },
  },
  {
    step: 2,
    image: imgPhotographingCarPlate,
    imageStyle: { left: "-16.67%", width: "133.33%", height: "100%", top: "0" },
  },
  {
    step: 3,
    image: imgStaffWashingCar,
    imageStyle: { left: "-16.67%", width: "133.33%", height: "100%", top: "0" },
  },
  {
    step: 4,
    image: imgNotificationOnPhone,
    imageStyle: { left: "-16.67%", width: "133.33%", height: "100%", top: "0" },
  },
];

const trackStepsData = [
  { active: true, current: false },
  { active: false, current: true },
  { active: false, current: false },
  { active: false, current: false },
  { active: false, current: false },
];

const navSections = [
  { key: "services" as const, sectionId: "services" },
  { key: "pricing" as const, sectionId: "pricing" },
  { key: "about" as const, sectionId: "about" },
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
    <div className='bg-white relative min-h-screen'>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header
        className='fixed left-0 right-0 top-0 z-50 bg-white'
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className='flex items-center justify-between max-w-[1366px] mx-auto px-4 md:px-12 py-4'>
          {/* Logo */}
          <div className='flex items-center gap-3 shrink-0'>
            <div className='h-8 w-[57px] relative overflow-hidden shrink-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt='Park & Shine Logo'
                src={imgParkShineLogo}
                className='absolute h-full w-full object-contain'
              />
            </div>
            <span
              className='text-[#0036a4] text-xl md:text-2xl whitespace-nowrap'
              style={{ fontFamily: manrope, fontWeight: 700 }}
            >
              Park &amp; Shine
            </span>
          </div>

          {/* Nav links — desktop only */}
          <nav className='hidden md:flex items-center gap-6'>
            {navSections.map(({ key, sectionId }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(sectionId);
                }}
                className='text-[#5f5e5e] text-sm tracking-[0.7px] py-1'
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                {t(`landingPage.nav.${key}`)}
              </a>
            ))}
          </nav>

          {/* CTA group — desktop only */}
          <div className='hidden md:flex items-center gap-3'>
            <a
              href='/book/location'
              className='bg-[#0036a4] text-white text-sm tracking-[0.7px] px-6 py-3 rounded text-center'
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t("landingPage.nav.bookNow")}
            </a>

            {/* Language dropdown */}
            <div className='relative' ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className='flex items-center gap-1.5 border border-[#c2c2c2] rounded-md h-11 px-4 bg-white text-black text-base'
                style={{ fontFamily: inter, fontWeight: 400 }}
                aria-label={locale === "id" ? "Ganti bahasa" : "Change language"}
              >
                {locale.toUpperCase()}
                <svg
                  width='10'
                  height='6'
                  viewBox='0 0 10 6'
                  fill='none'
                  className={`shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d='M1 1L5 5L9 1'
                    stroke='#5f5e5e'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className='absolute right-0 mt-1 w-36 bg-white border border-[#e8e8e8] rounded-md overflow-hidden z-50'
                  style={{ boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLocale(lang.code.toLowerCase() as "id" | "en");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-[#f7f7f7] transition-colors ${
                        locale.toUpperCase() === lang.code
                          ? "text-[#0036a4] font-semibold"
                          : "text-[#3d3d3d]"
                      }`}
                      style={{ fontFamily: inter }}
                    >
                      <span>{lang.label}</span>
                      <span className='text-xs text-[#5f5e5e]'>{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className='flex md:hidden items-center justify-center p-2 rounded-md text-[#3d3d3d]'
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path d='M18 6L6 18M6 6l12 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            ) : (
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                <path d='M4 6h16M4 12h16M4 18h16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {isMenuOpen && (
          <div className='md:hidden border-t border-[#e8e8e8] bg-white px-4 py-4 flex flex-col gap-1'>
            {navSections.map(({ key, sectionId }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(sectionId);
                }}
                className='text-[#5f5e5e] text-base tracking-[0.7px] py-3 border-b border-[#f0f0f0]'
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                {t(`landingPage.nav.${key}`)}
              </a>
            ))}
            <div className='flex items-center gap-3 pt-3'>
              <a
                href='/book/location'
                className='flex-1 bg-[#0036a4] text-white text-sm tracking-[0.7px] px-6 py-3 rounded text-center'
                style={{ fontFamily: inter, fontWeight: 600 }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("landingPage.nav.bookNow")}
              </a>
              <div className='flex gap-1'>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLocale(lang.code.toLowerCase() as "id" | "en");
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                      locale.toUpperCase() === lang.code
                        ? "border-[#0036a4] text-[#0036a4] font-semibold bg-[#f0f4ff]"
                        : "border-[#c2c2c2] text-[#3d3d3d]"
                    }`}
                    style={{ fontFamily: inter }}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className='pt-[76px]'>
        {/* ── Hero Section ────────────────────────────────────── */}
        <section className='bg-[#f7f7f7] py-12 md:py-20 relative overflow-hidden'>
          {/* Corner gradients */}
          <div
            className='absolute left-0 top-0 size-64 opacity-20 pointer-events-none'
            style={{
              backgroundImage:
                "linear-gradient(60deg, rgb(0,54,164) 0%, rgb(0,54,164) 2.86%, rgba(0,54,164,0) 2.86%, rgba(0,54,164,0) 5.72%)",
            }}
          />
          <div
            className='absolute right-0 bottom-0 size-64 opacity-20 pointer-events-none'
            style={{
              backgroundImage:
                "linear-gradient(60deg, rgb(0,54,164) 0%, rgb(0,54,164) 2.86%, rgba(0,54,164,0) 2.86%, rgba(0,54,164,0) 5.72%)",
            }}
          />

          <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-center max-w-[1366px] mx-auto px-4 md:px-12'>
            {/* Left: copy */}
            <div className='flex-1 flex flex-col gap-6 min-w-0 w-full'>
              <h1
                className='text-[36px] leading-[40px] md:text-[56px] md:leading-[56px] text-black'
                style={{ fontFamily: manrope, fontWeight: 500 }}
              >
                {t("landingPage.hero.heading").split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </h1>
              <p
                className='text-[#3d3d3d] text-base md:text-lg leading-[27px] max-w-[512px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {t("landingPage.hero.description")}
              </p>
              <div className='flex flex-col sm:flex-row gap-3 pt-3'>
                <a
                  href='#services'
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className='bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-[17px] rounded text-center'
                  style={{ fontFamily: inter, fontWeight: 600 }}
                >
                  {t("landingPage.hero.viewServices")}
                </a>
                <a
                  href='/book/location'
                  className='border border-[#c2c2c2] text-black text-sm tracking-[0.7px] px-8 py-[17px] rounded text-center'
                  style={{ fontFamily: inter, fontWeight: 600 }}
                >
                  {t("landingPage.hero.findLocations")}
                </a>
              </div>
            </div>

            {/* Right: hero image */}
            <div className='flex-1 min-w-0 w-full'>
              <div
                className='bg-[#eee] rounded-2xl overflow-hidden'
                style={{ boxShadow: "0px 2px 8px 0px rgba(26,26,26,0.08)" }}
              >
                <div className='h-[240px] sm:h-[320px] md:h-[426px] relative overflow-hidden'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={t("landingPage.hero.imageAlt")}
                    src={imgHero}
                    className='absolute w-full max-w-none object-cover'
                    style={{ height: "133.33%", top: "-16.67%", left: 0 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How the Magic Happens ────────────────────────────── */}
        <section id='services' className='bg-white py-12 md:py-20'>
          <div className='flex flex-col gap-8 md:gap-12 max-w-[1366px] mx-auto px-4 md:px-12'>
            <h2
              className='text-[36px] leading-[40px] md:text-[56px] md:leading-[56px] text-black text-center'
              style={{ fontFamily: manrope, fontWeight: 500 }}
            >
              {t("landingPage.howItWorks.title")}
            </h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {howItWorksData.map(({ step, image, imageStyle }) => (
                <div
                  key={step}
                  className='bg-white border border-[#e8e8e8] rounded-lg px-[17px] pt-[33px] pb-10 relative flex flex-col'
                  style={{
                    filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))",
                  }}
                >
                  {/* Step badge */}
                  <div
                    className='absolute top-[-16px] right-4 bg-[#f9e285] rounded-xl size-10 flex items-center justify-center'
                    style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
                  >
                    <span
                      className='text-[#1a1c1c] text-lg text-center'
                      style={{ fontFamily: inter, fontWeight: 700 }}
                    >
                      {step}
                    </span>
                  </div>

                  {/* Image */}
                  <div className='rounded-lg overflow-hidden mb-4'>
                    <div className='relative overflow-hidden h-[220px] sm:h-[260px] lg:h-[325px]'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=''
                        src={image}
                        className='absolute max-w-none object-cover'
                        style={imageStyle as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <p
                    className='text-[#0036a4] text-base leading-6 mb-1'
                    style={{ fontFamily: manrope, fontWeight: 400 }}
                  >
                    {t(`landingPage.howItWorks.card${step}.title`)}
                  </p>

                  {/* Description */}
                  <p
                    className='text-[#3d3d3d] text-base leading-6'
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {t(`landingPage.howItWorks.card${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Limited Time Promotion ───────────────────────────── */}
        <section id='pricing' className='bg-white py-12 md:py-20'>
          <div className='flex flex-col gap-8 items-center max-w-[1366px] mx-auto px-4 md:px-12'>
            <div className='text-center'>
              <h2
                className='text-[#0036a4] text-[32px] leading-[38px] md:text-[44px] md:leading-[48px] font-bold uppercase'
                style={{ fontFamily: inter }}
              >
                {t("landingPage.pricing.title")}
              </h2>
              <p
                className='text-[#5f5e5e] text-base mt-1'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {t("landingPage.pricing.subtitle")}
              </p>
            </div>

            <div
              className='bg-white border border-[#e8e8e8] rounded-lg p-6 md:p-[33px] w-full max-w-[576px]'
              style={{ filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))" }}
            >
              <p
                className='text-[#0036a4] text-base leading-6'
                style={{ fontFamily: manrope, fontWeight: 400 }}
              >
                {t("landingPage.pricing.serviceLabel")}
              </p>
              <p
                className='text-[#1a1c1c] text-[36px] leading-[42px] md:text-[44px] md:leading-[48px] font-bold'
                style={{ fontFamily: manrope }}
              >
                Rp50.000
              </p>
              <p
                className='text-[#3d3d3d] text-base leading-6 mt-3'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {t("landingPage.pricing.description")}
              </p>
              <ul className='flex flex-col gap-3 mt-5'>
                {pricingFeatures.map((feature) => (
                  <li key={feature} className='flex gap-3 items-start'>
                    <span className='mt-[9px] shrink-0 bg-[#0036a4] rounded-full size-[6px]' />
                    <span
                      className='text-[#3d3d3d] text-base leading-6'
                      style={{ fontFamily: inter, fontWeight: 400 }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Track Your Wash ─────────────────────────────────── */}
        <section className='bg-[#f7f7f7] py-12 md:py-20'>
          <div className='flex flex-col gap-8 max-w-[1366px] mx-auto px-4 md:px-12'>
            {/* Card */}
            <div
              className='bg-white border border-[#e8e8e8] rounded-2xl p-6 md:p-[33px] flex flex-col md:flex-row items-center justify-between gap-8'
              style={{ filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))" }}
            >
              {/* Left: copy */}
              <div className='flex-1 min-w-0 flex flex-col gap-4 w-full'>
                <h2
                  className='text-[#0036a4] text-[30px] leading-[36px] md:text-[44px] md:leading-[48px] font-bold'
                  style={{ fontFamily: manrope }}
                >
                  {t("landingPage.track.title")}
                </h2>
                <p
                  className='text-[#3d3d3d] text-base leading-6'
                  style={{ fontFamily: inter, fontWeight: 400 }}
                >
                  {t("landingPage.track.description")}
                </p>
              </div>

              {/* Right: steps */}
              <div className='flex-1 min-w-0 flex items-center justify-center py-6 w-full'>
                <div className='relative flex items-start justify-center w-full max-w-[512px]'>
                  {/* Background divider */}
                  <div className='absolute top-6 left-0 right-0 h-[2px] bg-[#c3c5d7]' />
                  {/* Active segment */}
                  <div className='absolute top-6 left-0 w-1/4 h-[2px] bg-[#0036a4]' />

                  {trackStepsData.map(({ active, current }, i) => (
                    <div
                      key={i}
                      className='flex-1 flex flex-col gap-3 items-center relative'
                    >
                      <div
                        className='size-10 md:size-12 rounded-xl flex items-center justify-center'
                        style={{
                          background: current
                            ? "#024ad8"
                            : active
                              ? "#0036a4"
                              : "#e5e2e1",
                          boxShadow: current
                            ? "0px 0px 10px rgba(2,74,216,0.3)"
                            : "none",
                        }}
                      >
                        <span
                          className='text-sm md:text-base text-center font-bold'
                          style={{
                            fontFamily: inter,
                            color: current
                              ? "#c2ceff"
                              : active
                                ? "white"
                                : "#5f5e5e",
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <span
                        className='text-[10px] md:text-xs text-center leading-[17px]'
                        style={{
                          fontFamily: inter,
                          fontWeight: 400,
                          color: current ? "#0036a4" : "#1a1c1c",
                        }}
                      >
                        {t(`landingPage.track.step${i + 1}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Book a Wash CTA */}
            <div className='flex justify-center'>
              <a
                href='/book/location'
                className='w-full sm:w-auto bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-4 rounded text-center'
                style={{
                  fontFamily: inter,
                  fontWeight: 600,
                  boxShadow: "0px 8px 12px rgba(26,26,26,0.12)",
                }}
              >
                {t("landingPage.track.bookNow")}
              </a>
            </div>
          </div>
        </section>

        {/* ── Seamless Integration ─────────────────────────────── */}
        <section id='about' className='bg-[#f7f7f7] py-12 md:py-20'>
          <div className='flex flex-col gap-8 md:gap-12 max-w-[1366px] mx-auto px-4 md:px-12'>
            <div className='text-center flex flex-col gap-2'>
              <h2
                className='text-[32px] leading-[38px] md:text-[44px] md:leading-[48px] text-black'
                style={{ fontFamily: manrope, fontWeight: 500 }}
              >
                {t("landingPage.integration.title")}
              </h2>
              <p
                className='text-[#5f5e5e] text-base'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {t("landingPage.integration.subtitle")}
              </p>
            </div>

            <div className='flex flex-col gap-8 md:gap-12'>
              {/* Step 1: image left, text right */}
              <div
                className='bg-white border border-[#e8e8e8] rounded-2xl p-6 md:p-[25px] flex flex-col md:flex-row gap-8 md:gap-12 items-center'
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))",
                }}
              >
                <div className='flex-1 min-w-0 w-full'>
                  <div className='aspect-video relative rounded overflow-hidden'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={t("landingPage.integration.step1.imageAlt")}
                      src={imgScanningQrCode}
                      className='absolute max-w-none h-full object-cover'
                      style={{ left: "-0.35%", width: "100.7%" }}
                    />
                  </div>
                </div>
                <div className='flex-1 min-w-0 flex flex-col gap-4 w-full'>
                  <div className='bg-[#dce1ff] size-12 rounded-xl flex items-center justify-center shrink-0'>
                    <span
                      className='text-[#0036a4] text-base text-center'
                      style={{ fontFamily: manrope, fontWeight: 400 }}
                    >
                      1
                    </span>
                  </div>
                  <h3
                    className='text-[24px] leading-[30px] md:text-[32px] md:leading-[38px] text-black'
                    style={{ fontFamily: manrope, fontWeight: 500 }}
                  >
                    {t("landingPage.integration.step1.title")}
                  </h3>
                  <p
                    className='text-[#3d3d3d] text-base md:text-lg leading-[27px]'
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {t("landingPage.integration.step1.description")}
                  </p>
                </div>
              </div>

              {/* Step 2: text left, image right — reverse on mobile (text first) */}
              <div
                className='bg-white border border-[#e8e8e8] rounded-2xl p-6 md:p-[25px] flex flex-col md:flex-row gap-8 md:gap-12 items-center'
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))",
                }}
              >
                <div className='flex-1 min-w-0 flex flex-col gap-4 w-full'>
                  <div className='bg-[#dce1ff] size-12 rounded-xl flex items-center justify-center shrink-0'>
                    <span
                      className='text-[#0036a4] text-base text-center'
                      style={{ fontFamily: manrope, fontWeight: 400 }}
                    >
                      2
                    </span>
                  </div>
                  <h3
                    className='text-[24px] leading-[30px] md:text-[32px] md:leading-[38px] text-black'
                    style={{ fontFamily: manrope, fontWeight: 500 }}
                  >
                    {t("landingPage.integration.step2.title")}
                  </h3>
                  <p
                    className='text-[#3d3d3d] text-base md:text-lg leading-[27px]'
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {t("landingPage.integration.step2.description")}
                  </p>
                </div>
                <div className='flex-1 min-w-0 w-full'>
                  <div className='aspect-video relative rounded overflow-hidden'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={t("landingPage.integration.step2.imageAlt")}
                      src={imgNotificationOnPhone}
                      className='absolute max-w-none w-full object-cover'
                      style={{ height: "177.78%", top: "-38.89%", left: 0 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className='bg-[#00164f] border-t border-[#455b72]'>
        <div className='max-w-[1366px] mx-auto px-4 md:px-12 py-12 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6'>
          {/* Brand */}
          <div className='col-span-1 sm:col-span-2 flex flex-col gap-4'>
            <h3
              className='text-white text-[28px] leading-[34px] md:text-[32px] md:leading-[38px]'
              style={{ fontFamily: manrope, fontWeight: 500 }}
            >
              Park &amp; Shine
            </h3>
            <p
              className='text-[#b2c9e4] text-base leading-[26px] max-w-[384px]'
              style={{ fontFamily: inter, fontWeight: 400 }}
            >
              {t("landingPage.footer.tagline")}
            </p>
            <p
              className='text-[#b2c9e4] text-xs leading-[17px] mt-4'
              style={{ fontFamily: inter, fontWeight: 400 }}
            >
              {t("landingPage.footer.copyright")}
            </p>
          </div>

          {/* Services */}
          <div className='flex flex-col gap-3'>
            <p
              className='text-white text-sm tracking-[0.7px] mb-1'
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t("landingPage.footer.servicesHeading")}
            </p>
            {[
              { label: t("landingPage.footer.services"), sectionId: "services" },
              { label: t("landingPage.footer.pricing"), sectionId: "pricing" },
              { label: t("landingPage.footer.fleetServices"), sectionId: "about" },
            ].map(({ label, sectionId }) => (
              <a
                key={label}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
                }}
                className='text-[#b2c9e4] text-base leading-[26px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Legal & Support */}
          <div className='flex flex-col gap-3'>
            <p
              className='text-white text-sm tracking-[0.7px] mb-1'
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t("landingPage.footer.legalHeading")}
            </p>
            {[
              { label: t("landingPage.footer.support"), href: "/support" },
              { label: t("landingPage.footer.privacyPolicy"), href: "/privacy-policy" },
              { label: t("landingPage.footer.termsOfService"), href: "/terms" },
              { label: t("landingPage.footer.contactUs"), href: "/contact" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className='text-[#b2c9e4] text-base leading-[26px] hover:text-white transition-colors'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
