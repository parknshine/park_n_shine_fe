"use client";

import Link from "next/link";
import { useState } from "react";
import { usePublicSettings } from "@/features/customer/hooks";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const content = {
  en: {
    title: "Support",
    hero: "How can we help?",
    heroSub: "Find answers to common questions below, or reach out to our team directly.",
    back: "Back to Home",
    faqTitle: "Frequently Asked Questions",
    stillHelp: "Need Further Assistance?",
    hours: "Our support team is available everyday, 09:00–21:00 WIB.",
    emailBtn: "Email Support",
    contactBtn: "Contact Us",
    copyright: "© 2026 Park & Shine. All rights reserved.",
    quickLinks: [
      { label: "Book a Wash", href: "/book/location" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    footerLinks: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
    faqs: [
      {
        question: "How does Park & Shine work?",
        answer: "Book a waterless car wash through our app by selecting your parking location and vehicle. Our crew will find your car, perform the wash, and notify you when it's done — all while you shop or work.",
      },
      {
        question: "Is waterless washing safe for my car?",
        answer: "Yes. Our waterless wash formula is specially designed to lubricate and lift dirt safely without scratching the paint. It is used by professional detailers worldwide and is safe for all car finishes.",
      },
      {
        question: "How long does the wash take?",
        answer: "A standard waterless car wash typically takes 20–40 minutes depending on your vehicle size and level of dirt. You can track the progress in real time through the app.",
      },
      {
        question: "What if I'm not satisfied with the result?",
        answer: "Contact us within 24 hours of service completion. Our team will review your case and arrange a re-wash or refund as appropriate.",
      },
      {
        question: "Can I cancel my booking?",
        answer: "Yes, you can cancel before a crew member is assigned and receive a full refund. Once service has started, cancellations are not available.",
      },
      {
        question: "Which parking locations are supported?",
        answer: "We currently operate at selected malls and commercial parking areas in Jakarta. Check the app for the full list of supported locations — we're expanding regularly.",
      },
      {
        question: "Do I need to be present during the wash?",
        answer: "No. Simply book, park your car, and go about your day. You'll receive a notification when the crew starts and when the wash is complete.",
      },
      {
        question: "How do I track my wash status?",
        answer: "After booking, you can view real-time status updates in the app — from crew assignment through each wash stage to completion.",
      },
    ],
  },
  id: {
    title: "Pusat Bantuan",
    hero: "Ada yang bisa kami bantu?",
    heroSub: "Temukan jawaban atas pertanyaan umum di bawah ini, atau hubungi tim kami langsung.",
    back: "Kembali ke Beranda",
    faqTitle: "Pertanyaan yang Sering Diajukan",
    stillHelp: "Butuh Bantuan Lebih Lanjut?",
    hours: "Tim support tersedia setiap hari dari pukul 09.00–21.00 WIB.",
    emailBtn: "Email Dukungan",
    contactBtn: "Hubungi Kami",
    copyright: "© 2026 Park & Shine. Hak cipta dilindungi.",
    quickLinks: [
      { label: "Pesan Cuci", href: "/book/location" },
      { label: "Hubungi Kami", href: "/contact" },
      { label: "Kebijakan Privasi", href: "/privacy-policy" },
      { label: "Syarat Layanan", href: "/terms" },
    ],
    footerLinks: [
      { label: "Kebijakan Privasi", href: "/privacy-policy" },
      { label: "Syarat", href: "/terms" },
      { label: "Kontak", href: "/contact" },
    ],
    faqs: [
      {
        question: "Bagaimana cara kerja Park & Shine?",
        answer: "Pesan layanan cuci mobil tanpa air melalui aplikasi kami dengan memilih lokasi parkir dan kendaraan Anda. Kru kami akan menemukan mobil Anda, melakukan pencucian, dan memberi notifikasi saat selesai — semua bisa dilakukan sambil Anda berbelanja atau bekerja.",
      },
      {
        question: "Apakah cuci tanpa air aman untuk mobil saya?",
        answer: "Ya. Formula cuci tanpa air kami dirancang khusus untuk melumasi dan mengangkat kotoran dengan aman tanpa menggores cat. Formula ini digunakan oleh detailer profesional di seluruh dunia dan aman untuk semua jenis lapisan cat mobil.",
      },
      {
        question: "Berapa lama proses pencucian?",
        answer: "Cuci mobil tanpa air standar biasanya memakan waktu 20–40 menit tergantung ukuran kendaraan dan tingkat kotoran. Anda dapat memantau progres secara real-time melalui aplikasi.",
      },
      {
        question: "Bagaimana jika saya tidak puas dengan hasilnya?",
        answer: "Hubungi kami dalam 24 jam setelah layanan selesai. Tim kami akan meninjau kasus Anda dan mengatur pencucian ulang atau pengembalian dana sesuai kebutuhan.",
      },
      {
        question: "Apakah saya bisa membatalkan pesanan?",
        answer: "Ya, Anda dapat membatalkan sebelum kru ditugaskan dan mendapatkan pengembalian dana penuh. Setelah layanan dimulai, pembatalan tidak dapat dilakukan.",
      },
      {
        question: "Lokasi parkir mana saja yang didukung?",
        answer: "Kami saat ini beroperasi di mall dan area parkir komersial pilihan di Jakarta. Cek aplikasi untuk daftar lengkap lokasi yang didukung — kami terus berkembang.",
      },
      {
        question: "Apakah saya harus hadir saat pencucian berlangsung?",
        answer: "Tidak. Cukup pesan, parkir mobil Anda, dan lanjutkan aktivitas Anda. Anda akan menerima notifikasi saat kru memulai dan saat pencucian selesai.",
      },
      {
        question: "Bagaimana cara memantau status pencucian saya?",
        answer: "Setelah pemesanan, Anda dapat melihat pembaruan status secara real-time di aplikasi — mulai dari penugasan kru, setiap tahap pencucian, hingga selesai.",
      },
    ],
  },
};

export default function SupportPage() {
  const [lang, setLang] = useState<"en" | "id">("id");
  const t = content[lang];
  const { whatsappNumber } = usePublicSettings();
  const waUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "https://wa.me";

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[#0036a4] text-xl md:text-2xl whitespace-nowrap"
            style={{ fontFamily: manrope, fontWeight: 700 }}
          >
            Park &amp; Shine
          </Link>
          <div className="flex items-center gap-4">
            {/* Language toggle */}
            <div
              className="flex items-center border border-[#e8e8e8] rounded-lg overflow-hidden text-sm"
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              <button
                onClick={() => setLang("id")}
                className={`px-3 py-1.5 transition-colors ${lang === "id" ? "bg-[#0036a4] text-white" : "text-[#5f5e5e] hover:bg-[#f7f7f7]"}`}
              >
                ID
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#0036a4] text-white" : "text-[#5f5e5e] hover:bg-[#f7f7f7]"}`}
              >
                EN
              </button>
            </div>
            <Link
              href="/"
              className="text-[#5f5e5e] text-sm flex items-center gap-2 hover:text-[#0036a4] transition-colors"
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.back}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#f7f7f7] py-12 md:py-16 border-b border-[#e8e8e8]">
        <div className="max-w-[800px] mx-auto px-4 md:px-12 text-center">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-black mb-3"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t.hero}
          </h1>
          <p
            className="text-[#5f5e5e] text-base md:text-lg leading-[27px] max-w-[480px] mx-auto"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            {t.heroSub}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {t.quickLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="border border-[#e8e8e8] rounded-xl px-4 py-3 text-sm text-center text-[#0036a4] hover:bg-[#f0f4ff] hover:border-[#0036a4] transition-colors"
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <h2
          className="text-[24px] text-black mb-6"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          {t.faqTitle}
        </h2>
        <div className="flex flex-col gap-4 mb-12">
          {t.faqs.map(({ question, answer }) => (
            <div
              key={question}
              className="border border-[#e8e8e8] rounded-xl p-6"
              style={{ filter: "drop-shadow(0px 1px 3px rgba(26,26,26,0.05))" }}
            >
              <p
                className="text-[#1a1c1c] text-base mb-2"
                style={{ fontFamily: inter, fontWeight: 600 }}
              >
                {question}
              </p>
              <p
                className="text-[#3d3d3d] text-base leading-[26px]"
                style={{ fontFamily: inter, fontWeight: 400 }}
              >
                {answer}
              </p>
            </div>
          ))}
        </div>

        {/* Still need help CTA */}
        <div className="bg-[#f0f4ff] border border-[#dce1ff] rounded-2xl p-8 text-center">
          <h3
            className="text-[#0036a4] text-[22px] mb-2"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t.stillHelp}
          </h3>
          <p
            className="text-[#3d3d3d] text-base mb-6"
            style={{ fontFamily: inter, fontWeight: 400 }}
          >
            {t.hours}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:info@parknshine.net"
              className="bg-[#0036a4] text-white text-sm tracking-[0.7px] px-8 py-4 rounded text-center"
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t.emailBtn}
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-[#0036a4] text-[#0036a4] text-sm tracking-[0.7px] px-8 py-4 rounded text-center"
              style={{ fontFamily: inter, fontWeight: 600 }}
            >
              {t.contactBtn}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#00164f] border-t border-[#455b72] mt-auto">
        <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[#b2c9e4] text-sm"
            style={{ fontFamily: inter }}
          >
            {t.copyright}
          </span>
          <div className="flex gap-6">
            {t.footerLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-[#b2c9e4] text-sm hover:text-white transition-colors"
                style={{ fontFamily: inter }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
