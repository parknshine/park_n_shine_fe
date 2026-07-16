"use client";

import { useTranslation } from "@/i18n";
import { MarketingHeader, MarketingFooter, ContentAccordion } from "@/components/shared";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, FACEBOOK_NAME, FACEBOOK_URL } from "@/lib/contact-info";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const ID = {
  s1: (
    <p>Saat Anda menggunakan layanan PT Park And Shine, Kami dapat mengumpulkan informasi yang diperlukan untuk menyediakan, mengoperasikan, meningkatkan, dan mengembangkan layanan Kami. Informasi tersebut dapat mencakup nama, nomor telepon, alamat email, riwayat pemesanan dan penggunaan layanan, serta informasi teknis tertentu yang diperlukan untuk menjalankan aplikasi, seperti preferensi bahasa dan informasi sesi login. Kami juga dapat mengumpulkan informasi yang dihasilkan dari penggunaan layanan, termasuk status pemesanan, riwayat transaksi, dan interaksi pengguna dengan platform Kami.</p>
  ),
  s2: (
    <p>Data pribadi yang Anda berikan sepenuhnya digunakan untuk memproses dan mengelola pemesanan layanan, memberikan informasi terkait status layanan, menugaskan petugas yang akan menangani kendaraan Anda, menyediakan dukungan pelanggan, meningkatkan kualitas layanan dan pengalaman pengguna, serta mengembangkan fitur dan layanan baru. Dengan persetujuan Anda, Kami juga dapat mengirimkan informasi promosi, penawaran khusus, atau pembaruan layanan. Selain itu, Kami dapat menggunakan data pribadi untuk mencegah penyalahgunaan layanan, menangani sengketa, melakukan investigasi atas dugaan pelanggaran, klaim asuransi serta memenuhi kewajiban hukum yang berlaku.</p>
  ),
  s3: (
    <>
      <p>PT Park And Shine tidak menjual data pribadi Anda kepada pihak mana pun. Dalam menjalankan layanan, Kami dapat membagikan informasi yang diperlukan kepada petugas operasional yang menangani kendaraan Anda serta kepada penyedia layanan pihak ketiga yang membantu operasional platform Kami, seperti penyedia cloud hosting, layanan notifikasi, dan penyedia layanan pembayaran dan pihak asuransi. Kami berupaya memastikan bahwa pihak-pihak tersebut menerapkan langkah perlindungan yang sesuai terhadap data pribadi yang mereka akses.</p>
      <p>Dalam hal terjadi merger, akuisisi, restrukturisasi, pengalihan aset, atau transaksi bisnis lainnya, data pribadi dapat dialihkan sebagai bagian dari aset bisnis sesuai dengan ketentuan peraturan perundang-undangan yang berlaku. Apabila diwajibkan oleh hukum, Kami akan memberikan pemberitahuan kepada pengguna mengenai pengalihan tersebut.</p>
    </>
  ),
  s4: (
    <p>Kami menyimpan data pribadi selama diperlukan untuk menyediakan layanan, memenuhi kewajiban hukum yang berlaku, menyelesaikan sengketa, mencegah penyalahgunaan layanan, atau melindungi kepentingan yang sah. Apabila Anda ingin menghapus data pribadi yang tersimpan dalam sistem Kami, Anda dapat menghubungi Kami melalui <a href="mailto:info@parknshine.net" className="text-[#024ad8] underline">info@parknshine.net</a> dan Kami akan memproses permintaan tersebut sesuai dengan ketentuan peraturan perundang-undangan yang berlaku di Indonesia.</p>
  ),
  s5: (
    <>
      <p>Kami menerapkan langkah-langkah keamanan yang sesuai dengan standar industri untuk melindungi data pribadi dari akses, penggunaan, perubahan, kehilangan, atau pengungkapan yang tidak sah. Langkah-langkah tersebut mencakup penggunaan koneksi terenkripsi, kontrol akses, autentikasi pengguna, serta mekanisme keamanan lainnya yang relevan dengan operasional layanan Kami.</p>
      <p>Apabila terjadi insiden keamanan yang mengakibatkan terungkapnya data pribadi secara tidak sah dan Kami diwajibkan oleh peraturan perundang-undangan untuk memberikan pemberitahuan, Kami akan menginformasikan pengguna sesuai dengan ketentuan hukum yang berlaku.</p>
    </>
  ),
  s6: (
    <p>Aplikasi dan situs web PT Park And Shine dapat menggunakan cookies, local storage, atau teknologi serupa untuk menjaga sesi login, mengingat preferensi pengguna, meningkatkan pengalaman penggunaan layanan, serta membantu Kami memahami penggunaan platform secara umum. Teknologi tersebut tidak digunakan untuk menjual atau memperdagangkan data pribadi pengguna.</p>
  ),
  s7: (
    <>
      <p>Sesuai dengan ketentuan peraturan perundang-undangan yang berlaku, Anda berhak untuk mengakses, memperbarui, memperbaiki, membatasi pemrosesan, menarik persetujuan, atau meminta penghapusan data pribadi yang Kami kelola. Anda juga berhak untuk mengajukan pertanyaan, masukan, atau keluhan terkait pemrosesan data pribadi.</p>
      <p>Apabila Anda sebelumnya telah memberikan persetujuan untuk menerima informasi promosi atau komunikasi pemasaran, Anda dapat menarik persetujuan tersebut kapan saja melalui media komunikasi yang tersedia atau dengan menghubungi Kami. Penarikan persetujuan tertentu dapat memengaruhi kemampuan Kami untuk menyediakan sebagian atau seluruh layanan kepada Anda.</p>
    </>
  ),
  s8: (
    <p>Dalam kondisi tertentu, Kami dapat menggunakan data yang telah dianonimkan atau tidak lagi dapat dikaitkan secara langsung dengan identitas pengguna untuk tujuan analisis, pengembangan, penelitian, pelaporan internal, dan peningkatan layanan.</p>
  ),
  s9: (
    <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan perkembangan layanan maupun ketentuan hukum yang berlaku. Apabila terdapat perubahan yang bersifat material, Kami akan memberitahukannya melalui email, aplikasi, situs web, atau sarana komunikasi lain yang Kami anggap sesuai. Penggunaan layanan setelah perubahan tersebut berlaku merupakan bentuk pengakuan bahwa Anda telah membaca dan memahami versi terbaru Kebijakan Privasi ini.</p>
  ),
  s10: (
    <>
      <p>Apabila Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau cara PT Park And Shine mengelola data pribadi, silakan menghubungi Kami melalui:</p>
      <ul className="list-none pl-0 flex flex-col gap-1">
        <li>Email: <a href="mailto:info@parknshine.net" className="text-[#024ad8] underline">info@parknshine.net</a></li>
        <li>Instagram: <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-[#024ad8] underline">{INSTAGRAM_HANDLE}</a></li>
        <li>Facebook: <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="text-[#024ad8] underline">{FACEBOOK_NAME}</a></li>
      </ul>
    </>
  ),
};

const EN = {
  s1: (
    <p>When you use PT Park And Shine&apos;s services, We may collect information necessary to provide, operate, improve, and develop Our services. This information may include your name, phone number, email address, booking history, service usage history, and certain technical information required to operate the application, such as language preferences and login session information. We may also collect information generated through your use of Our services, including booking status, transaction history, and interactions with Our platform.</p>
  ),
  s2: (
    <p>The personal data you provide is used solely for processing and managing service bookings, providing updates regarding service status, assigning crew members responsible for handling your vehicle, providing customer support, improving service quality and user experience, and developing new features and services. With your consent, We may also send promotional information, special offers, or service updates. In addition, We may use personal data to prevent misuse of Our services, resolve disputes, investigate suspected violations, process insurance claims, and comply with applicable legal obligations.</p>
  ),
  s3: (
    <>
      <p>PT Park And Shine does not sell your personal data to any third party. In operating Our services, We may share necessary information with operational personnel responsible for handling your vehicle, as well as third-party service providers that support Our platform operations, including cloud hosting providers, notification service providers, payment service providers, and insurance providers. We take reasonable steps to ensure that these parties implement appropriate safeguards to protect any personal data they access.</p>
      <p>In the event of a merger, acquisition, restructuring, transfer of assets, or other business transaction, personal data may be transferred as part of the business assets in accordance with applicable laws and regulations. Where required by law, We will notify users of such transfers.</p>
    </>
  ),
  s4: (
    <p>We retain personal data for as long as necessary to provide Our services, comply with legal obligations, resolve disputes, prevent misuse of services, or protect legitimate interests. If you wish to request the deletion of your personal data stored in Our systems, you may contact Us at <a href="mailto:info@parknshine.net" className="text-[#024ad8] underline">info@parknshine.net</a>, and We will process your request in accordance with applicable laws and regulations in Indonesia.</p>
  ),
  s5: (
    <>
      <p>We implement security measures that are consistent with industry standards to protect personal data against unauthorized access, use, modification, loss, or disclosure. These measures include encrypted connections, access controls, user authentication, and other security mechanisms relevant to the operation of Our services.</p>
      <p>If a security incident results in the unauthorized disclosure of personal data and We are required by applicable law to provide notification, We will inform affected users in accordance with legal requirements.</p>
    </>
  ),
  s6: (
    <p>PT Park And Shine&apos;s applications and websites may use cookies, local storage, or similar technologies to maintain login sessions, remember user preferences, enhance the user experience, and help Us better understand how Our platform is used. These technologies are not used for the purpose of selling or trading users&apos; personal data.</p>
  ),
  s7: (
    <>
      <p>Subject to applicable laws and regulations, you have the right to access, update, correct, restrict the processing of, withdraw consent for, or request the deletion of your personal data that We manage. You also have the right to submit questions, feedback, or complaints regarding the processing of your personal data.</p>
      <p>If you have previously consented to receive promotional information or marketing communications, you may withdraw that consent at any time through the available communication channels or by contacting Us directly. The withdrawal of certain consents may affect Our ability to provide some or all of Our services to you.</p>
    </>
  ),
  s8: (
    <p>In certain circumstances, We may use data that has been anonymized or can no longer be directly associated with an identifiable individual for analytics, development, research, internal reporting, and service improvement purposes.</p>
  ),
  s9: (
    <p>We may update this Privacy Policy from time to time to reflect changes in Our services or applicable legal requirements. If any material changes are made, We will notify users through email, the application, the website, or other communication channels that We consider appropriate. Your continued use of Our services after such changes become effective constitutes acknowledgment that you have read and understood the updated Privacy Policy.</p>
  ),
  s10: (
    <>
      <p>If you have any questions regarding this Privacy Policy or how PT Park And Shine manages personal data, please contact Us at:</p>
      <ul className="list-none pl-0 flex flex-col gap-1">
        <li>Email: <a href="mailto:info@parknshine.net" className="text-[#024ad8] underline">info@parknshine.net</a></li>
        <li>Instagram: <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-[#024ad8] underline">{INSTAGRAM_HANDLE}</a></li>
        <li>Facebook: <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="text-[#024ad8] underline">{FACEBOOK_NAME}</a></li>
      </ul>
    </>
  ),
};

function buildItems(isId: boolean) {
  const c = isId ? ID : EN;
  return [
    { id: "section-1",  title: isId ? "1. Data yang Kami Kumpulkan"     : "1. Information We Collect",          content: c.s1  },
    { id: "section-2",  title: isId ? "2. Tujuan Penggunaan Data"         : "2. Purpose of Data Processing",      content: c.s2  },
    { id: "section-3",  title: isId ? "3. Pembagian Data"                 : "3. Data Sharing",                    content: c.s3  },
    { id: "section-4",  title: isId ? "4. Penyimpanan Data"               : "4. Data Retention",                  content: c.s4  },
    { id: "section-5",  title: isId ? "5. Keamanan Data"                  : "5. Data Security",                   content: c.s5  },
    { id: "section-6",  title: isId ? "6. Cookies dan Teknologi Serupa"   : "6. Cookies and Similar Technologies", content: c.s6 },
    { id: "section-7",  title: isId ? "7. Hak Anda"                       : "7. Your Rights",                     content: c.s7  },
    { id: "section-8",  title: isId ? "8. Penggunaan Data Anonim"         : "8. Use of Anonymized Data",          content: c.s8  },
    { id: "section-9",  title: isId ? "9. Perubahan Kebijakan Privasi"    : "9. Changes to This Privacy Policy",  content: c.s9  },
    { id: "section-10", title: isId ? "10. Hubungi Kami"                  : "10. Contact Us",                     content: c.s10 },
  ];
}

interface PrivacyContentProps {
  whatsappNumber: string;
}

export function PrivacyContent({ whatsappNumber }: PrivacyContentProps) {
  const { t, i18n } = useTranslation("common");

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MarketingHeader showLanguageSwitcher backLabel={t("action.back")} />

      <section className="bg-[#f7f7f7] border-b border-[#e8e8e8] py-10 md:py-14">
        <div className="max-w-200 mx-auto px-4 md:px-12">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-[#1a1a1a]"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            {t("privacyPolicy.title")}
          </h1>
          <p className="text-[#636363] text-sm mt-2" style={{ fontFamily: inter }}>
            {t("privacyPolicy.lastUpdated")}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-200 mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        <ContentAccordion items={buildItems(i18n.language === "id")} />
      </main>

      <MarketingFooter activePage="privacy-policy" whatsappNumber={whatsappNumber} />
    </div>
  );
}
