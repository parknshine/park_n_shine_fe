"use client";

import Link from "next/link";
import { useUIStore } from "@/store/ui-store";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const content = {
  id: {
    title: "Syarat dan Ketentuan Penggunaan Layanan Park and Shine",
    intro: [
      "Kami berterima kasih atas kepercayaan Anda terhadap layanan Park and Shine. Mohon meluangkan waktu untuk membaca seluruh Syarat dan Ketentuan Penggunaan layanan Park and Shine ini.",
      "Dengan melakukan pemesanan dan pembayaran layanan Park and Shine melalui website, QR Code, atau media lain yang disediakan oleh Park and Shine, Anda dianggap telah membaca, memahami, dan menyetujui Ketentuan Penggunaan ini. Apabila Anda tidak menyetujui sebagian atau seluruh ketentuan yang tercantum di dalamnya, mohon untuk tidak melanjutkan penggunaan layanan Park and Shine.",
    ],
    sections: [
      {
        title: "1. ISTILAH UMUM",
        preamble: "Kecuali ditentukan lain dalam Ketentuan Penggunaan ini, istilah-istilah berikut memiliki arti sebagai berikut:",
        items: [
          '"Park and Shine" adalah penyedia layanan pencucian kendaraan tanpa air (waterless car wash) yang dilakukan pada kendaraan pelanggan di area parkir yang telah ditentukan.',
          '"Pelanggan" adalah setiap orang yang melakukan pemesanan dan pembayaran layanan Park and Shine.',
          '"Kendaraan" adalah kendaraan yang didaftarkan dan merupakan kendaraan yang sah menurut hukum oleh Pelanggan untuk menerima layanan Park and Shine.',
          '"Layanan" adalah layanan yang diberikan mencakup pembersihan dan perawatan bagian eksterior kendaraan yang disediakan oleh Park and Shine.',
          '"Booking" adalah pemesanan layanan yang dilakukan oleh Pelanggan melalui sistem yang disediakan oleh Park and Shine.',
          '"Area Parkir" adalah lokasi parkir tempat Kendaraan Pelanggan berada saat Layanan dilaksanakan.',
        ],
      },
      {
        title: "2. KETENTUAN LAYANAN",
        items: [
          "Pelanggan wajib memberikan informasi yang lengkap, benar, dan akurat saat melakukan pemesanan layanan.",
          "Pelanggan wajib memastikan nomor kendaraan, lokasi parkir, dan informasi kontak yang diberikan sesuai dengan kondisi sebenarnya.",
          "Layanan Park and Shine hanya mencakup pembersihan dan perawatan bagian eksterior kendaraan.",
          "Kendaraan wajib berada pada lokasi parkir yang diinformasikan saat melakukan pemesanan.",
          "Kendaraan wajib dalam keadaan terkunci selama proses layanan berlangsung.",
          "Park and Shine tidak meminta, menerima, menyimpan, ataupun menggunakan kunci kendaraan Pelanggan dalam bentuk apa pun.",
          "Park and Shine tidak memindahkan, mengoperasikan, mengendarai, atau menggunakan kendaraan Pelanggan selama pelaksanaan Layanan.",
          "Pembayaran harus diselesaikan sebelum Layanan dimulai.",
          "Layanan dianggap selesai setelah petugas melakukan konfirmasi pada sistem bahwa pekerjaan telah selesai atau Park and Shine mengirimkan notifikasi penyelesaian kepada Pelanggan melalui sistem yang tersedia.",
          "Park and Shine berhak menolak atau membatalkan pesanan apabila informasi yang diberikan tidak lengkap, kendaraan tidak dapat ditemukan, lokasi kendaraan tidak sesuai, atau terdapat keadaan lain yang menghambat pelaksanaan Layanan.",
        ],
      },
      {
        title: "3. KONDISI KENDARAAN DAN DOKUMENTASI",
        items: [
          "Pelanggan memahami bahwa hasil layanan dapat berbeda-beda tergantung pada kondisi Kendaraan sebelum Layanan dilakukan.",
          "Layanan waterless car wash ditujukan untuk membersihkan debu, kotoran ringan, dan kontaminan pada permukaan kendaraan.",
          "Layanan tidak dimaksudkan untuk memperbaiki atau menghilangkan kerusakan cat, goresan, penyok, karat, oksidasi, noda permanen, maupun kerusakan lain yang telah ada sebelumnya.",
          "Park and Shine berhak mendokumentasikan kondisi Kendaraan sebelum dan sesudah layanan dalam bentuk foto dan/atau video untuk keperluan kontrol kualitas, verifikasi layanan, dokumentasi operasional, penyelesaian keluhan, serta kegiatan promosi.",
          "Dengan menggunakan layanan Park and Shine, Pelanggan secara tidak langsung memberikan persetujuan atas dokumentasi sebagaimana dimaksud pada huruf (d) sepanjang digunakan untuk kepentingan yang sah dan wajar oleh Park and Shine.",
          "Park and Shine tidak bertanggung jawab atas kerusakan, baret, cacat, kehilangan, atau perubahan kondisi Kendaraan yang telah ada sebelum layanan dilakukan maupun yang terjadi setelah layanan selesai. Tanggung jawab Park and Shine hanya berlaku apabila sepanjang dapat dibuktikan bahwa kerusakan, baret, cacat, kehilangan, atau perubahan kondisi tersebut secara langsung disebabkan oleh tindakan atau kelalaian Park and Shine dalam pelaksanaan layanan.",
        ],
      },
      {
        title: "4. PERNYATAAN DAN JAMINAN PELANGGAN",
        items: [
          "Pelanggan menyatakan bahwa Kendaraan yang didaftarkan merupakan miliknya atau berada dalam penguasaan yang sah menurut ketentuan hukum yang berlaku.",
          "Pelanggan menjamin bahwa seluruh informasi yang diberikan kepada Park and Shine adalah benar, lengkap, akurat, dan dapat dipertanggungjawabkan.",
          "Pelanggan memahami bahwa Kendaraan tetap berada di area parkir umum yang dimiliki dan/atau dikelola oleh pihak ketiga selama pelaksanaan Layanan.",
          "Pelanggan memahami bahwa Park and Shine bukan penyedia jasa penitipan kendaraan, valet, maupun pengelola area parkir.",
          "Park and Shine tidak mengambil alih penguasaan, penitipan, pengelolaan, maupun kendali atas Kendaraan Pelanggan pada saat apa pun selama pelaksanaan Layanan.",
          "Pelanggan bertanggung jawab untuk memastikan Kendaraan dalam keadaan terkunci dan aman, termasuk barang-barang pribadi yang berada di dalamnya.",
          "Park and Shine tidak mengakses bagian interior Kendaraan dan tidak menerima penitipan barang apapun yang berada di dalam Kendaraan.",
          "Park and Shine tidak bertanggung jawab atas kehilangan kendaraan, pencurian, vandalisme, kerusakan akibat pihak ketiga, kecelakaan, maupun kejadian lain yang terjadi di Area Parkir di luar kendali dari Park and Shine.",
          "Apabila terjadi permasalahan selama pelaksanaan Layanan, Park and Shine dapat melakukan upaya mediasi untuk membantu penyelesaian permasalahan tersebut.",
          "Keluhan terkait Layanan wajib disampaikan paling lambat 1 x 24 (satu kali dua puluh empat) jam sejak notifikasi penyelesaian layanan dikirimkan kepada Pelanggan.",
        ],
      },
      {
        title: "5. PEMBATALAN DAN PENGEMBALIAN DANA",
        items: [
          "Pelanggan tidak dapat membatalkan Booking setelah layanan dimulai.",
          "Apabila pembatalan dilakukan sebelum Layanan dimulai, Pelanggan setidak-tidaknya perlu memberikan konfirmasi kepada petugas, layanan pelanggan atau saat petugas belum memulai pekerjaan dan dapat memperoleh pengembalian dana sesuai dengan kebijakan pengembalian dana yang berlaku.",
          "Pengembalian dana tidak dapat dilakukan apabila Layanan telah dimulai atau telah selesai dilaksanakan kecuali ditentukan lain oleh Park and Shine.",
          "Park and Shine berhak membatalkan Booking apabila Kendaraan tidak dapat ditemukan, informasi yang diberikan tidak akurat, terdapat kendala operasional, keadaan kendaraan tidak sesuai standar operasional perusahaan atau terjadi keadaan di luar kendali sehingga Layanan tidak dapat dilaksanakan.",
          "Pengembalian dana yang disetujui akan diproses melalui metode pembayaran yang digunakan saat transaksi, sesuai dengan kebijakan penyedia layanan pembayaran yang digunakan.",
        ],
      },
      {
        title: "6. PEMBATASAN TANGGUNG JAWAB",
        items: [
          "Park and Shine tidak bertanggung jawab atas kerugian tidak langsung, kerugian insidental, kerugian khusus, kerugian konsekuensial, kehilangan keuntungan, atau kerugian lain yang timbul sehubungan dengan penggunaan diluar Layanan.",
          "Dalam hal Park and Shine terbukti bertanggung jawab atas suatu kerugian, besaran ganti rugi yang dapat diberikan kepada Pelanggan terbatas pada nilai kerugian yang secara wajar dan objektif dapat dibuktikan serta ditentukan berdasarkan penilaian pihak yang berwenang termasuk perusahaan asuransi, bengkel resmi, atau pihak independen lain yang memiliki kompetensi untuk melakukan penilaian tersebut.",
          "Ketentuan ini tidak mengesampingkan tanggung jawab yang menurut hukum tidak dapat dikecualikan atau dibatasi.",
        ],
      },
      {
        title: "7. PERUBAHAN KETENTUAN PENGGUNAAN",
        paragraph:
          "Park and Shine berhak mengubah, memperbarui, atau menyesuaikan Ketentuan Penggunaan ini dari waktu ke waktu. Perubahan tersebut berlaku sejak dipublikasikan melalui website atau media komunikasi resmi Park and Shine. Penggunaan Layanan setelah perubahan dipublikasikan dianggap sebagai persetujuan atas Ketentuan Penggunaan yang telah diperbarui.",
      },
      {
        title: "8. HUKUM YANG BERLAKU DAN PENYELESAIAN SENGKETA",
        items: [
          "Ketentuan Penggunaan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia, dalam hal Pengguna merupakan warga negara asing atau terdapat perbedaan penafsiran antara Bahasa Indonesia dan bahasa lainnya, maka versi Bahasa Indonesia pada ketentuan ini yang akan menjadi acuan yang berlaku dan mengikat.",
          "Setiap sengketa yang timbul sehubungan dengan Ketentuan Penggunaan ini akan terlebih dahulu diselesaikan secara musyawarah untuk mufakat. Apabila penyelesaian tidak tercapai, sengketa akan diselesaikan melalui pengadilan yang berwenang di wilayah Republik Indonesia menurut kompetensi Pengadilan sesuai dengan ketentuan perundang-undangan yang berlaku.",
        ],
      },
      {
        title: "9. CARA MENGHUBUNGI KAMI",
        contactPreamble:
          "Apabila Anda memiliki pertanyaan, keluhan, atau membutuhkan bantuan terkait layanan Park and Shine, Anda dapat menghubungi Kami melalui:",
        contactPostscript:
          "Seluruh komunikasi antara Anda dan Park and Shine dapat direkam dan disimpan untuk keperluan dokumentasi, peningkatan kualitas layanan, keperluan operasional, kegiatan promosi, serta penyelesaian sengketa apabila diperlukan.",
      },
    ],
    back: "Kembali ke Beranda",
  },
  en: {
    title: "Terms and Conditions of Use – Park and Shine Service",
    intro: [
      "Thank you for trusting Park and Shine with your vehicle care. Please take a moment to read these Terms and Conditions of Use carefully.",
      "By placing an order and making payment for Park and Shine services through the website, QR Code, or any other media provided by Park and Shine, you are deemed to have read, understood, and agreed to these Terms and Conditions. If you do not agree with any part or all of the terms stated herein, please do not continue using Park and Shine services.",
    ],
    sections: [
      {
        title: "1. GENERAL DEFINITIONS",
        preamble: "Unless otherwise specified in these Terms and Conditions, the following terms shall have the meanings set out below:",
        items: [
          '"Park and Shine" refers to the provider of waterless car wash services performed on customers\' vehicles at designated parking areas.',
          '"Customer" refers to any person who places an order and makes payment for Park and Shine services.',
          '"Vehicle" refers to the vehicle registered by the Customer as a legally owned vehicle to receive Park and Shine services.',
          '"Service" refers to the services provided, including cleaning and care of the exterior of the vehicle by Park and Shine.',
          '"Booking" refers to a service reservation made by the Customer through the system provided by Park and Shine.',
          '"Parking Area" refers to the parking location where the Customer\'s Vehicle is located during the Service.',
        ],
      },
      {
        title: "2. SERVICE TERMS",
        items: [
          "Customers must provide complete, correct, and accurate information when placing a service order.",
          "Customers must ensure that the vehicle number, parking location, and contact information provided are accurate and up to date.",
          "Park and Shine services cover only the cleaning and care of the exterior of the vehicle.",
          "The vehicle must be present at the parking location specified at the time of booking.",
          "The vehicle must remain locked throughout the service process.",
          "Park and Shine does not request, receive, store, or use Customer vehicle keys in any form.",
          "Park and Shine does not move, operate, drive, or use the Customer's vehicle during the Service.",
          "Payment must be completed before the Service begins.",
          "The Service is considered complete once the crew member confirms completion in the system, or Park and Shine sends a completion notification to the Customer via the available system.",
          "Park and Shine reserves the right to refuse or cancel an order if the information provided is incomplete, the vehicle cannot be found, the vehicle location does not match, or there are other circumstances that prevent the Service from being carried out.",
        ],
      },
      {
        title: "3. VEHICLE CONDITION AND DOCUMENTATION",
        items: [
          "The Customer understands that service results may vary depending on the condition of the Vehicle prior to the Service.",
          "Waterless car wash services are intended to remove dust, light dirt, and surface contaminants from the vehicle.",
          "The Service is not intended to repair or remove paint damage, scratches, dents, rust, oxidation, permanent stains, or any other pre-existing damage.",
          "Park and Shine reserves the right to document the condition of the Vehicle before and after the service in the form of photos and/or videos for quality control, service verification, operational documentation, complaint resolution, and promotional activities.",
          "By using Park and Shine services, the Customer implicitly consents to the documentation referred to in clause (d), provided it is used for legitimate and reasonable purposes by Park and Shine.",
          "Park and Shine is not responsible for any damage, scratches, defects, loss, or changes in the condition of the Vehicle that existed prior to the service or that occur after the service is completed. Park and Shine's liability only applies if it can be proven that such damage, scratches, defects, loss, or changes in condition were directly caused by the actions or negligence of Park and Shine in carrying out the service.",
        ],
      },
      {
        title: "4. CUSTOMER REPRESENTATIONS AND WARRANTIES",
        items: [
          "The Customer represents that the registered Vehicle is their own or is under their lawful possession in accordance with applicable law.",
          "The Customer warrants that all information provided to Park and Shine is truthful, complete, accurate, and accountable.",
          "The Customer understands that the Vehicle remains in a public parking area owned and/or managed by a third party during the Service.",
          "The Customer understands that Park and Shine is not a vehicle storage provider, valet service, or parking area manager.",
          "Park and Shine does not take over possession, custody, management, or control of the Customer's Vehicle at any time during the Service.",
          "The Customer is responsible for ensuring the Vehicle is locked and secure, including any personal belongings inside.",
          "Park and Shine does not access the interior of the Vehicle and does not accept custody of any items inside the Vehicle.",
          "Park and Shine is not responsible for vehicle loss, theft, vandalism, damage caused by third parties, accidents, or any other events that occur in the Parking Area beyond Park and Shine's control.",
          "In the event of any issues during the Service, Park and Shine may undertake mediation efforts to assist in resolving the matter.",
          "Complaints regarding the Service must be submitted no later than 1 × 24 (one times twenty-four) hours from the time the service completion notification is sent to the Customer.",
        ],
      },
      {
        title: "5. CANCELLATIONS AND REFUNDS",
        items: [
          "Customers may not cancel a Booking after the service has begun.",
          "If cancellation is made before the Service begins, the Customer must at minimum provide confirmation to the crew, customer service, or before the crew has started work, and may receive a refund in accordance with the applicable refund policy.",
          "Refunds cannot be made if the Service has already begun or has been completed, unless otherwise determined by Park and Shine.",
          "Park and Shine reserves the right to cancel a Booking if the Vehicle cannot be found, the information provided is inaccurate, there are operational constraints, the vehicle condition does not meet company operational standards, or circumstances beyond our control arise that prevent the Service from being carried out.",
          "Approved refunds will be processed through the payment method used at the time of the transaction, in accordance with the policies of the payment service provider used.",
        ],
      },
      {
        title: "6. LIMITATION OF LIABILITY",
        items: [
          "Park and Shine is not liable for indirect losses, incidental damages, special damages, consequential damages, loss of profits, or any other losses arising in connection with the use of services beyond the Service scope.",
          "In the event Park and Shine is found liable for a loss, the amount of compensation payable to the Customer is limited to the value of the loss that can be reasonably and objectively proven and determined based on the assessment of a competent authority, including insurance companies, authorized workshops, or other independent parties with the competence to make such assessments.",
          "This provision does not exclude liability that cannot be excluded or limited under applicable law.",
        ],
      },
      {
        title: "7. AMENDMENTS TO TERMS AND CONDITIONS",
        paragraph:
          "Park and Shine reserves the right to amend, update, or adjust these Terms and Conditions from time to time. Such changes take effect from the date they are published on the Park and Shine website or through official communication channels. Continued use of the Service after changes are published constitutes acceptance of the updated Terms and Conditions.",
      },
      {
        title: "8. GOVERNING LAW AND DISPUTE RESOLUTION",
        items: [
          "These Terms and Conditions are governed by and interpreted in accordance with the laws of the Republic of Indonesia. In the event the User is a foreign national or there is a discrepancy in interpretation between the Indonesian version and any other language version, the Indonesian version of these Terms and Conditions shall serve as the binding and authoritative reference.",
          "Any disputes arising in connection with these Terms and Conditions shall first be resolved through deliberation to reach consensus. If resolution is not achieved, the dispute shall be settled through the competent court within the territory of the Republic of Indonesia in accordance with the jurisdiction of the Court as stipulated by applicable laws and regulations.",
        ],
      },
      {
        title: "9. HOW TO CONTACT US",
        contactPreamble:
          "If you have any questions, complaints, or require assistance regarding Park and Shine services, you may contact us through:",
        contactPostscript:
          "All communications between you and Park and Shine may be recorded and stored for documentation, service quality improvement, operational purposes, promotional activities, and dispute resolution if necessary.",
      },
    ],
    back: "Back to Home",
  },
} as const;

export default function TermsPage() {
  const locale = useUIStore((s) => s.locale);
  const c = content[locale];

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
          <Link
            href="/"
            className="text-[#5f5e5e] text-sm flex items-center gap-2 hover:text-[#0036a4] transition-colors"
            style={{ fontFamily: inter, fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {c.back}
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 md:px-12 py-12 md:py-20">
        <h1
          className="text-[32px] md:text-[44px] leading-tight text-black mb-4"
          style={{ fontFamily: manrope, fontWeight: 500 }}
        >
          {c.title}
        </h1>
        {c.intro.map((p, i) => (
          <p key={i} className="text-[#3d3d3d] text-base leading-[26px] mb-3" style={{ fontFamily: inter }}>
            {p}
          </p>
        ))}

        <div className="flex flex-col gap-10 mt-10" style={{ fontFamily: inter }}>
          {c.sections.map((section) => (
            <Section key={section.title} title={section.title}>
              {"preamble" in section && section.preamble && (
                <p className="mb-3">{section.preamble}</p>
              )}
              {"paragraph" in section && section.paragraph && (
                <p>{section.paragraph}</p>
              )}
              {"contactPreamble" in section && (
                <>
                  <p className="mb-3">{section.contactPreamble}</p>
                  <ul className="flex flex-col gap-1 mb-4">
                    <li>Email: <a href="mailto:info@parknshine.net" className="text-[#0036a4] underline">info@parknshine.net</a></li>
                    <li>WhatsApp: [TBA]</li>
                    <li>Website: [TBA]</li>
                  </ul>
                  <p>{section.contactPostscript}</p>
                </>
              )}
              {"items" in section && section.items && (
                <ol className="flex flex-col gap-2" style={{ listStyleType: "lower-alpha", paddingLeft: "1.25rem" }}>
                  {section.items.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
              )}
            </Section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-[20px] text-black mb-3"
        style={{ fontFamily: manrope, fontWeight: 500 }}
      >
        {title}
      </h2>
      <div className="text-[#3d3d3d] text-base leading-[26px]">{children}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#00164f] border-t border-[#455b72] mt-auto">
      <div className="max-w-[1366px] mx-auto px-4 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[#b2c9e4] text-sm" style={{ fontFamily: inter }}>
          © 2026 Park & Shine. All rights reserved.
        </span>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: inter }}>Privacy Policy</Link>
          <Link href="/terms" className="text-white text-sm hover:text-[#b2c9e4] transition-colors" style={{ fontFamily: inter }}>Terms</Link>
          <Link href="/contact" className="text-[#b2c9e4] text-sm hover:text-white transition-colors" style={{ fontFamily: inter }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
