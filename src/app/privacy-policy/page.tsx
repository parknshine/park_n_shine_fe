"use client";

import Link from "next/link";
import { useState } from "react";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const content = {
  id: {
    title: "Kebijakan Privasi",
    lastUpdated: "Terakhir diperbarui: Juni 2026",
    sections: [
      {
        title: "1. Data yang Kami Kumpulkan",
        body: "Saat Anda menggunakan layanan PT Park And Shine, Kami dapat mengumpulkan informasi yang diperlukan untuk menyediakan, mengoperasikan, meningkatkan, dan mengembangkan layanan Kami. Informasi tersebut dapat mencakup nama, nomor telepon, alamat email, riwayat pemesanan dan penggunaan layanan, serta informasi teknis tertentu yang diperlukan untuk menjalankan aplikasi, seperti preferensi bahasa dan informasi sesi login. Kami juga dapat mengumpulkan informasi yang dihasilkan dari penggunaan layanan, termasuk status pemesanan, riwayat transaksi, dan interaksi pengguna dengan platform Kami.",
      },
      {
        title: "2. Tujuan Penggunaan Data",
        body: "Data pribadi yang Anda berikan sepenuhnya digunakan untuk memproses dan mengelola pemesanan layanan, memberikan informasi terkait status layanan, menugaskan petugas yang akan menangani kendaraan Anda, menyediakan dukungan pelanggan, meningkatkan kualitas layanan dan pengalaman pengguna, serta mengembangkan fitur dan layanan baru. Dengan persetujuan Anda, Kami juga dapat mengirimkan informasi promosi, penawaran khusus, atau pembaruan layanan. Selain itu, Kami dapat menggunakan data pribadi untuk mencegah penyalahgunaan layanan, menangani sengketa, melakukan investigasi atas dugaan pelanggaran, klaim asuransi serta memenuhi kewajiban hukum yang berlaku.",
      },
      {
        title: "3. Pembagian Data",
        body: "PT Park And Shine tidak menjual data pribadi Anda kepada pihak mana pun. Dalam menjalankan layanan, Kami dapat membagikan informasi yang diperlukan kepada petugas operasional yang menangani kendaraan Anda serta kepada penyedia layanan pihak ketiga yang membantu operasional platform Kami, seperti penyedia cloud hosting, layanan notifikasi, dan penyedia layanan pembayaran dan pihak asuransi. Kami berupaya memastikan bahwa pihak-pihak tersebut menerapkan langkah perlindungan yang sesuai terhadap data pribadi yang mereka akses.\n\nDalam hal terjadi merger, akuisisi, restrukturisasi, pengalihan aset, atau transaksi bisnis lainnya, data pribadi dapat dialihkan sebagai bagian dari aset bisnis sesuai dengan ketentuan peraturan perundang-undangan yang berlaku. Apabila diwajibkan oleh hukum, Kami akan memberikan pemberitahuan kepada pengguna mengenai pengalihan tersebut.",
      },
      {
        title: "4. Penyimpanan Data",
        body: "Kami menyimpan data pribadi selama diperlukan untuk menyediakan layanan, memenuhi kewajiban hukum yang berlaku, menyelesaikan sengketa, mencegah penyalahgunaan layanan, atau melindungi kepentingan yang sah. Apabila Anda ingin menghapus data pribadi yang tersimpan dalam sistem Kami, Anda dapat menghubungi Kami melalui info@parknshine.net dan Kami akan memproses permintaan tersebut sesuai dengan ketentuan peraturan perundang-undangan yang berlaku di Indonesia.",
        email: "info@parknshine.net",
      },
      {
        title: "5. Keamanan Data",
        body: "Kami menerapkan langkah-langkah keamanan yang sesuai dengan standar industri untuk melindungi data pribadi dari akses, penggunaan, perubahan, kehilangan, atau pengungkapan yang tidak sah. Langkah-langkah tersebut mencakup penggunaan koneksi terenkripsi, kontrol akses, autentikasi pengguna, serta mekanisme keamanan lainnya yang relevan dengan operasional layanan Kami.\n\nApabila terjadi insiden keamanan yang mengakibatkan terungkapnya data pribadi secara tidak sah dan Kami diwajibkan oleh peraturan perundang-undangan untuk memberikan pemberitahuan, Kami akan menginformasikan pengguna sesuai dengan ketentuan hukum yang berlaku.",
      },
      {
        title: "6. Cookies dan Teknologi Serupa",
        body: "Aplikasi dan situs web PT Park And Shine dapat menggunakan cookies, local storage, atau teknologi serupa untuk menjaga sesi login, mengingat preferensi pengguna, meningkatkan pengalaman penggunaan layanan, serta membantu Kami memahami penggunaan platform secara umum. Teknologi tersebut tidak digunakan untuk menjual atau memperdagangkan data pribadi pengguna.",
      },
      {
        title: "7. Hak Anda",
        body: "Sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, Anda berhak untuk mengakses, memperbarui, memperbaiki, membatasi pemrosesan, menarik persetujuan, atau meminta penghapusan data pribadi yang Kami kelola. Anda juga berhak untuk mengajukan pertanyaan, masukan, atau keluhan terkait pemrosesan data pribadi.\n\nApabila Anda sebelumnya telah memberikan persetujuan untuk menerima informasi promosi atau komunikasi pemasaran, Anda dapat menarik persetujuan tersebut kapan saja melalui media komunikasi yang tersedia atau dengan menghubungi Kami. Penarikan persetujuan tertentu dapat memengaruhi kemampuan Kami untuk menyediakan sebagian atau seluruh layanan kepada Anda.",
      },
      {
        title: "8. Penggunaan Data Anonim",
        body: "Dalam kondisi tertentu, Kami dapat menggunakan data yang telah dianonimkan atau tidak lagi dapat dikaitkan secara langsung dengan identitas pengguna untuk tujuan analisis, pengembangan, penelitian, pelaporan internal, dan peningkatan layanan.",
      },
      {
        title: "9. Perubahan Kebijakan Privasi",
        body: "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan perkembangan layanan maupun ketentuan hukum yang berlaku. Apabila terdapat perubahan yang bersifat material, Kami akan memberitahukannya melalui email, aplikasi, situs web, atau sarana komunikasi lain yang Kami anggap sesuai. Penggunaan layanan setelah perubahan tersebut berlaku merupakan bentuk pengakuan bahwa Anda telah membaca dan memahami versi terbaru Kebijakan Privasi ini.",
      },
      {
        title: "10. Hubungi Kami",
        body: "Apabila Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau cara PT Park And Shine mengelola data pribadi, silakan menghubungi Kami melalui:",
        contact: { label: "Email:", value: "info@parknshine.net" },
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: June 2026",
    sections: [
      {
        title: "1. Information We Collect",
        body: "When you use PT Park And Shine's services, We may collect information necessary to provide, operate, improve, and develop Our services. This information may include your name, phone number, email address, booking history, service usage history, and certain technical information required to operate the application, such as language preferences and login session information. We may also collect information generated through your use of Our services, including booking status, transaction history, and interactions with Our platform.",
      },
      {
        title: "2. Purpose of Data Processing",
        body: "The personal data you provide is used solely for processing and managing service bookings, providing updates regarding service status, assigning crew members responsible for handling your vehicle, providing customer support, improving service quality and user experience, and developing new features and services. With your consent, We may also send promotional information, special offers, or service updates. In addition, We may use personal data to prevent misuse of Our services, resolve disputes, investigate suspected violations, process insurance claims, and comply with applicable legal obligations.",
      },
      {
        title: "3. Data Sharing",
        body: "PT Park And Shine does not sell your personal data to any third party. In operating Our services, We may share necessary information with operational personnel responsible for handling your vehicle, as well as third-party service providers that support Our platform operations, including cloud hosting providers, notification service providers, payment service providers, and insurance providers. We take reasonable steps to ensure that these parties implement appropriate safeguards to protect any personal data they access.\n\nIn the event of a merger, acquisition, restructuring, transfer of assets, or other business transaction, personal data may be transferred as part of the business assets in accordance with applicable laws and regulations. Where required by law, We will notify users of such transfers.",
      },
      {
        title: "4. Data Retention",
        body: "We retain personal data for as long as necessary to provide Our services, comply with legal obligations, resolve disputes, prevent misuse of services, or protect legitimate interests. If you wish to request the deletion of your personal data stored in Our systems, you may contact Us at info@parknshine.net, and We will process your request in accordance with applicable laws and regulations in Indonesia.",
        email: "info@parknshine.net",
      },
      {
        title: "5. Data Security",
        body: "We implement security measures that are consistent with industry standards to protect personal data against unauthorized access, use, modification, loss, or disclosure. These measures include encrypted connections, access controls, user authentication, and other security mechanisms relevant to the operation of Our services.\n\nIf a security incident results in the unauthorized disclosure of personal data and We are required by applicable law to provide notification, We will inform affected users in accordance with legal requirements.",
      },
      {
        title: "6. Cookies and Similar Technologies",
        body: "PT Park And Shine's applications and websites may use cookies, local storage, or similar technologies to maintain login sessions, remember user preferences, enhance the user experience, and help Us better understand how Our platform is used. These technologies are not used for the purpose of selling or trading users' personal data.",
      },
      {
        title: "7. Your Rights",
        body: "Subject to applicable laws and regulations, you have the right to access, update, correct, restrict the processing of, withdraw consent for, or request the deletion of your personal data that We manage. You also have the right to submit questions, feedback, or complaints regarding the processing of your personal data.\n\nIf you have previously consented to receive promotional information or marketing communications, you may withdraw that consent at any time through the available communication channels or by contacting Us directly. The withdrawal of certain consents may affect Our ability to provide some or all of Our services to you.",
      },
      {
        title: "8. Use of Anonymized Data",
        body: "In certain circumstances, We may use data that has been anonymized or can no longer be directly associated with an identifiable individual for analytics, development, research, internal reporting, and service improvement purposes.",
      },
      {
        title: "9. Changes to This Privacy Policy",
        body: "We may update this Privacy Policy from time to time to reflect changes in Our services or applicable legal requirements. If any material changes are made, We will notify users through email, the application, the website, or other communication channels that We consider appropriate. Your continued use of Our services after such changes become effective constitutes acknowledgment that you have read and understood the updated Privacy Policy.",
      },
      {
        title: "10. Contact Us",
        body: "If you have any questions regarding this Privacy Policy or how PT Park And Shine manages personal data, please contact Us at:",
        contact: { label: "Email:", value: "info@parknshine.net" },
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<"id" | "en">("en");
  const c = content[lang];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header
        className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50"
        style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-341.5 mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-[#0036a4] text-xl md:text-2xl whitespace-nowrap"
            style={{ fontFamily: manrope, fontWeight: 700 }}
          >
            Park &amp; Shine
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-[#e8e8e8] overflow-hidden text-sm" style={{ fontFamily: inter }}>
              <button
                onClick={() => setLang("id")}
                className={`px-3 py-1.5 transition-colors ${lang === "id" ? "bg-[#0036a4] text-white" : "text-[#5f5e5e] hover:bg-gray-50"}`}
                style={{ fontWeight: 600 }}
              >
                ID
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#0036a4] text-white" : "text-[#5f5e5e] hover:bg-gray-50"}`}
                style={{ fontWeight: 600 }}
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
              {lang === "id" ? "Kembali" : "Back to Home"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-200 mx-auto w-full px-4 md:px-12 py-12 md:py-20">
        <h1
          className="text-[32px] md:text-[44px] leading-tight text-black mb-2"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          {c.title}
        </h1>
        <p className="text-[#5f5e5e] text-sm mb-10" style={{ fontFamily: inter }}>
          {c.lastUpdated}
        </p>

        <div className="flex flex-col gap-10" style={{ fontFamily: inter }}>
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2
                className="text-[20px] text-black mb-3"
                style={{ fontFamily: manrope, fontWeight: 500 }}
              >
                {s.title}
              </h2>
              <div className="text-[#3d3d3d] text-base leading-[26px] flex flex-col gap-4">
                {s.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {"contact" in s && s.contact && (
                  <p>
                    {s.contact.label}{" "}
                    <a href={`mailto:${s.contact.value}`} className="text-[#0036a4] underline">
                      {s.contact.value}
                    </a>
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

function Footer({ lang }: { lang: "id" | "en" }) {
  return (
    <footer className="bg-[#00164f] border-t border-[#455b72] mt-auto">
      <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="text-[#b2c9e4] text-sm"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          © 2026 Park &amp; Shine. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="text-white text-sm hover:text-[#b2c9e4] transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            {lang === "id" ? "Kebijakan Privasi" : "Privacy Policy"}
          </Link>
          <Link href="/terms" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Terms</Link>
          <Link href="/contact" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
