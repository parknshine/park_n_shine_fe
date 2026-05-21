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

  return (
    <div className='bg-white relative min-h-screen'>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header
        className='fixed left-0 right-0 top-0 z-50 bg-white'
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className='flex items-center justify-between max-w-[1366px] mx-auto px-12 py-4'>
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
              className='text-[#0036a4] text-2xl whitespace-nowrap'
              style={{ fontFamily: manrope, fontWeight: 700 }}
            >
              Park &amp; Shine
            </span>
          </div>

          {/* Nav links */}
          <nav className='flex items-center gap-6'>
            {navSections.map(({ key, sectionId }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
                }}
                className='text-[#5f5e5e] text-sm tracking-[0.7px] py-1'
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                {t(`landingPage.nav.${key}`)}
              </a>
            ))}
          </nav>

          {/* CTA group */}
          <div className='flex items-center gap-3'>
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
                className='flex items-center gap-1.5 border border-[#c2c2c2] rounded-md h-11 px-4.25 bg-white text-black text-base'
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
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className='pt-[76px]'>
        {/* ── Hero Section ────────────────────────────────────── */}
        <section className='bg-[#f7f7f7] py-20 relative overflow-hidden'>
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

          <div className='flex gap-12 items-center max-w-[1366px] mx-auto px-12'>
            {/* Left: copy */}
            <div className='flex-1 flex flex-col gap-6 min-w-0'>
              <h1
                className='text-[56px] text-black leading-[56px]'
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
                className='text-[#3d3d3d] text-lg leading-[27px] max-w-[512px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {t("landingPage.hero.description")}
              </p>
              <div className='flex gap-4 pt-3'>
                <a
                  href='#'
                  className='bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-[17px] rounded text-center'
                  style={{ fontFamily: inter, fontWeight: 600 }}
                >
                  {t("landingPage.hero.viewServices")}
                </a>
                <a
                  href='#'
                  className='border border-[#c2c2c2] text-black text-sm tracking-[0.7px] px-8 py-[17px] rounded text-center'
                  style={{ fontFamily: inter, fontWeight: 600 }}
                >
                  {t("landingPage.hero.findLocations")}
                </a>
              </div>
            </div>

            {/* Right: hero image */}
            <div className='flex-1 min-w-0'>
              <div
                className='bg-[#eee] rounded-2xl overflow-hidden'
                style={{ boxShadow: "0px 2px 8px 0px rgba(26,26,26,0.08)" }}
              >
                <div className='h-[426px] relative overflow-hidden'>
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
        <section id='services' className='bg-white py-20'>
          <div className='flex flex-col gap-12 max-w-[1366px] mx-auto px-12'>
            <h2
              className='text-[56px] text-black text-center leading-[56px]'
              style={{ fontFamily: manrope, fontWeight: 500 }}
            >
              {t("landingPage.howItWorks.title")}
            </h2>

            <div className='grid grid-cols-4 gap-6'>
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
                    <div
                      className='relative overflow-hidden'
                      style={{ height: "325px" }}
                    >
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
        <section id='pricing' className='bg-white py-20'>
          <div className='flex flex-col gap-8 items-center max-w-[1366px] mx-auto px-12'>
            <div className='text-center'>
              <h2
                className='text-[#0036a4] text-[44px] font-bold uppercase leading-[48px]'
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
              className='bg-white border border-[#e8e8e8] rounded-lg p-[33px] w-full max-w-[576px]'
              style={{ filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))" }}
            >
              <p
                className='text-[#0036a4] text-base leading-6'
                style={{ fontFamily: manrope, fontWeight: 400 }}
              >
                {t("landingPage.pricing.serviceLabel")}
              </p>
              <p
                className='text-[#1a1c1c] text-[44px] leading-[48px] font-bold'
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
        <section className='bg-[#f7f7f7] py-20'>
          <div className='flex flex-col gap-8 max-w-[1366px] mx-auto px-12'>
            {/* Card */}
            <div
              className='bg-white border border-[#e8e8e8] rounded-2xl p-[33px] flex items-center justify-between gap-8'
              style={{ filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))" }}
            >
              {/* Left: copy */}
              <div className='flex-1 min-w-0 flex flex-col gap-4'>
                <h2
                  className='text-[#0036a4] text-[44px] leading-[48px] font-bold'
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
              <div className='flex-1 min-w-0 flex items-center justify-center py-6'>
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
                        className='size-12 rounded-xl flex items-center justify-center'
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
                          className='text-base text-center font-bold'
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
                        className='text-xs text-center leading-[17px]'
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
                className='bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-4 rounded text-center'
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
        <section id='about' className='bg-[#f7f7f7] py-20'>
          <div className='flex flex-col gap-12 max-w-[1366px] mx-auto px-12'>
            <div className='text-center flex flex-col gap-2'>
              <h2
                className='text-[44px] text-black leading-[48px]'
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

            <div className='flex flex-col gap-12'>
              {/* Step 1 */}
              <div
                className='bg-white border border-[#e8e8e8] rounded-2xl p-[25px] flex gap-12 items-center'
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))",
                }}
              >
                <div className='flex-1 min-w-0'>
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
                <div className='flex-1 min-w-0 flex flex-col gap-4'>
                  <div className='bg-[#dce1ff] size-12 rounded-xl flex items-center justify-center shrink-0'>
                    <span
                      className='text-[#0036a4] text-base text-center'
                      style={{ fontFamily: manrope, fontWeight: 400 }}
                    >
                      1
                    </span>
                  </div>
                  <h3
                    className='text-[32px] text-black leading-[38px]'
                    style={{ fontFamily: manrope, fontWeight: 500 }}
                  >
                    {t("landingPage.integration.step1.title")}
                  </h3>
                  <p
                    className='text-[#3d3d3d] text-lg leading-[27px]'
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {t("landingPage.integration.step1.description")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className='bg-white border border-[#e8e8e8] rounded-2xl p-[25px] flex gap-12 items-center'
                style={{
                  filter: "drop-shadow(0px 2px 4px rgba(26,26,26,0.08))",
                }}
              >
                <div className='flex-1 min-w-0 flex flex-col gap-4'>
                  <div className='bg-[#dce1ff] size-12 rounded-xl flex items-center justify-center shrink-0'>
                    <span
                      className='text-[#0036a4] text-base text-center'
                      style={{ fontFamily: manrope, fontWeight: 400 }}
                    >
                      2
                    </span>
                  </div>
                  <h3
                    className='text-[32px] text-black leading-[38px]'
                    style={{ fontFamily: manrope, fontWeight: 500 }}
                  >
                    {t("landingPage.integration.step2.title")}
                  </h3>
                  <p
                    className='text-[#3d3d3d] text-lg leading-[27px]'
                    style={{ fontFamily: inter, fontWeight: 400 }}
                  >
                    {t("landingPage.integration.step2.description")}
                  </p>
                </div>
                <div className='flex-1 min-w-0'>
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
        <div className='max-w-[1366px] mx-auto px-12 py-20 grid grid-cols-5 gap-6'>
          {/* Brand */}
          <div className='col-span-2 flex flex-col gap-4'>
            <h3
              className='text-white text-[32px] leading-[38px]'
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

          {/* Company */}
          <div className='flex flex-col gap-3'>
            <p
              className='text-white text-sm tracking-[0.7px] mb-1'
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t("landingPage.footer.companyHeading")}
            </p>
            {[
              t("landingPage.footer.about"),
              t("landingPage.footer.locations"),
              t("landingPage.footer.careers"),
            ].map((link) => (
              <a
                key={link}
                href='#'
                className='text-[#b2c9e4] text-base leading-[26px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {link}
              </a>
            ))}
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
              t("landingPage.footer.services"),
              t("landingPage.footer.pricing"),
              t("landingPage.footer.fleetServices"),
            ].map((link) => (
              <a
                key={link}
                href='#'
                className='text-[#b2c9e4] text-base leading-[26px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {link}
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
              t("landingPage.footer.support"),
              t("landingPage.footer.privacyPolicy"),
              t("landingPage.footer.termsOfService"),
              t("landingPage.footer.contactUs"),
            ].map((link) => (
              <a
                key={link}
                href='#'
                className='text-[#b2c9e4] text-base leading-[26px]'
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
