"use client";

import { MarketingHeader, MarketingFooter, ContentAccordion } from "@/components/shared";

const manrope = "var(--font-manrope), sans-serif";
const inter = "var(--font-inter), sans-serif";

const ITEMS = [
  {
    id: "section-1",
    title: "1. Istilah Umum",
    content: (
      <>
        <p>Kecuali ditentukan lain dalam Ketentuan Penggunaan ini, istilah-istilah berikut memiliki arti sebagai berikut:</p>
        <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
          <li><strong>&ldquo;Park and Shine&rdquo;</strong> adalah penyedia layanan pencucian kendaraan tanpa air (waterless car wash) yang dilakukan pada kendaraan pelanggan di area parkir yang telah ditentukan.</li>
          <li><strong>&ldquo;Pelanggan&rdquo;</strong> adalah setiap orang yang melakukan pemesanan dan pembayaran layanan Park and Shine.</li>
          <li><strong>&ldquo;Kendaraan&rdquo;</strong> adalah kendaraan yang didaftarkan dan merupakan kendaraan yang sah menurut hukum oleh Pelanggan untuk menerima layanan Park and Shine.</li>
          <li><strong>&ldquo;Layanan&rdquo;</strong> adalah layanan yang diberikan mencakup pembersihan dan perawatan bagian eksterior kendaraan yang disediakan oleh Park and Shine.</li>
          <li><strong>&ldquo;Booking&rdquo;</strong> adalah pemesanan layanan yang dilakukan oleh Pelanggan melalui sistem yang disediakan oleh Park and Shine.</li>
          <li><strong>&ldquo;Area Parkir&rdquo;</strong> adalah lokasi parkir tempat Kendaraan Pelanggan berada saat Layanan dilaksanakan.</li>
        </ol>
      </>
    ),
  },
  {
    id: "section-2",
    title: "2. Ketentuan Layanan",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Pelanggan wajib memberikan informasi yang lengkap, benar, dan akurat saat melakukan pemesanan layanan.</li>
        <li>Pelanggan wajib memastikan nomor kendaraan, lokasi parkir, dan informasi kontak yang diberikan sesuai dengan kondisi sebenarnya.</li>
        <li>Layanan Park and Shine hanya mencakup pembersihan dan perawatan bagian eksterior kendaraan.</li>
        <li>Kendaraan wajib berada pada lokasi parkir yang diinformasikan saat melakukan pemesanan.</li>
        <li>Kendaraan wajib dalam keadaan terkunci selama proses layanan berlangsung.</li>
        <li>Park and Shine tidak meminta, menerima, menyimpan, ataupun menggunakan kunci kendaraan Pelanggan dalam bentuk apa pun.</li>
        <li>Park and Shine tidak memindahkan, mengoperasikan, mengendarai, atau menggunakan kendaraan Pelanggan selama pelaksanaan Layanan.</li>
        <li>Pembayaran harus diselesaikan sebelum Layanan dimulai.</li>
        <li>Layanan dianggap selesai setelah petugas melakukan konfirmasi pada sistem bahwa pekerjaan telah selesai atau Park and Shine mengirimkan notifikasi penyelesaian kepada Pelanggan melalui sistem yang tersedia.</li>
        <li>Park and Shine berhak menolak atau membatalkan pesanan apabila informasi yang diberikan tidak lengkap, kendaraan tidak dapat ditemukan, lokasi kendaraan tidak sesuai, atau terdapat keadaan lain yang menghambat pelaksanaan Layanan.</li>
      </ol>
    ),
  },
  {
    id: "section-3",
    title: "3. Kondisi Kendaraan & Dokumentasi",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Pelanggan memahami bahwa hasil layanan dapat berbeda-beda tergantung pada kondisi Kendaraan sebelum Layanan dilakukan.</li>
        <li>Layanan waterless car wash ditujukan untuk membersihkan debu, kotoran ringan, dan kontaminan pada permukaan kendaraan.</li>
        <li>Layanan tidak dimaksudkan untuk memperbaiki atau menghilangkan kerusakan cat, goresan, penyok, karat, oksidasi, noda permanen, maupun kerusakan lain yang telah ada sebelumnya.</li>
        <li>Park and Shine berhak mendokumentasikan kondisi Kendaraan sebelum dan sesudah layanan dalam bentuk foto dan/atau video untuk keperluan kontrol kualitas, verifikasi layanan, dokumentasi operasional, penyelesaian keluhan, serta kegiatan promosi.</li>
        <li>Dengan menggunakan layanan Park and Shine, Pelanggan secara tidak langsung memberikan persetujuan atas dokumentasi sebagaimana dimaksud pada huruf (d) sepanjang digunakan untuk kepentingan yang sah dan wajar oleh Park and Shine.</li>
        <li>Park and Shine tidak bertanggung jawab atas kerusakan, baret, cacat, kehilangan, atau perubahan kondisi Kendaraan yang telah ada sebelum layanan dilakukan maupun yang terjadi setelah layanan selesai. Tanggung jawab Park and Shine hanya berlaku apabila sepanjang dapat dibuktikan bahwa kerusakan, baret, cacat, kehilangan, atau perubahan kondisi tersebut secara langsung disebabkan oleh tindakan atau kelalaian Park and Shine dalam pelaksanaan layanan.</li>
      </ol>
    ),
  },
  {
    id: "section-4",
    title: "4. Pernyataan & Jaminan Pelanggan",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Pelanggan menyatakan bahwa Kendaraan yang didaftarkan merupakan miliknya atau berada dalam penguasaan yang sah menurut ketentuan hukum yang berlaku.</li>
        <li>Pelanggan menjamin bahwa seluruh informasi yang diberikan kepada Park and Shine adalah benar, lengkap, akurat, dan dapat dipertanggungjawabkan.</li>
        <li>Pelanggan memahami bahwa Kendaraan tetap berada di area parkir umum yang dimiliki dan/atau dikelola oleh pihak ketiga selama pelaksanaan Layanan.</li>
        <li>Pelanggan memahami bahwa Park and Shine bukan penyedia jasa penitipan kendaraan, valet, maupun pengelola area parkir.</li>
        <li>Park and Shine tidak mengambil alih penguasaan, penitipan, pengelolaan, maupun kendali atas Kendaraan Pelanggan pada saat apa pun selama pelaksanaan Layanan.</li>
        <li>Pelanggan bertanggung jawab untuk memastikan Kendaraan dalam keadaan terkunci dan aman, termasuk barang-barang pribadi yang berada di dalamnya.</li>
        <li>Park and Shine tidak mengakses bagian interior Kendaraan dan tidak menerima penitipan barang apapun yang berada di dalam Kendaraan.</li>
        <li>Park and Shine tidak bertanggung jawab atas kehilangan kendaraan, pencurian, vandalisme, kerusakan akibat pihak ketiga, kecelakaan, maupun kejadian lain yang terjadi di Area Parkir di luar kendali dari Park and Shine.</li>
        <li>Apabila terjadi permasalahan selama pelaksanaan Layanan, Park and Shine dapat melakukan upaya mediasi untuk membantu penyelesaian permasalahan tersebut.</li>
        <li>Keluhan terkait Layanan wajib disampaikan paling lambat 1&nbsp;x&nbsp;24 (satu kali dua puluh empat) jam sejak notifikasi penyelesaian layanan dikirimkan kepada Pelanggan.</li>
      </ol>
    ),
  },
  {
    id: "section-5",
    title: "5. Pembatalan & Pengembalian Dana",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Pelanggan tidak dapat membatalkan Booking setelah layanan dimulai.</li>
        <li>Apabila pembatalan dilakukan sebelum Layanan dimulai, Pelanggan setidak-tidaknya perlu memberikan konfirmasi kepada petugas, layanan pelanggan atau saat petugas belum memulai pekerjaan dan dapat memperoleh pengembalian dana sesuai dengan kebijakan pengembalian dana yang berlaku.</li>
        <li>Pengembalian dana tidak dapat dilakukan apabila Layanan telah dimulai atau telah selesai dilaksanakan kecuali ditentukan lain oleh Park and Shine.</li>
        <li>Park and Shine berhak membatalkan Booking apabila Kendaraan tidak dapat ditemukan, informasi yang diberikan tidak akurat, terdapat kendala operasional, keadaan kendaraan tidak sesuai standar operasional perusahaan atau terjadi keadaan di luar kendali sehingga Layanan tidak dapat dilaksanakan.</li>
        <li>Pengembalian dana yang disetujui akan diproses melalui metode pembayaran yang digunakan saat transaksi, sesuai dengan kebijakan penyedia layanan pembayaran yang digunakan.</li>
      </ol>
    ),
  },
  {
    id: "section-6",
    title: "6. Pembatasan Tanggung Jawab",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Park and Shine tidak bertanggung jawab atas kerugian tidak langsung, kerugian insidental, kerugian khusus, kerugian konsekuensial, kehilangan keuntungan, atau kerugian lain yang timbul sehubungan dengan penggunaan di luar Layanan.</li>
        <li>Dalam hal Park and Shine terbukti bertanggung jawab atas suatu kerugian, besaran ganti rugi yang dapat diberikan kepada Pelanggan terbatas pada nilai kerugian yang secara wajar dan objektif dapat dibuktikan serta ditentukan berdasarkan penilaian pihak yang berwenang termasuk perusahaan asuransi, bengkel resmi, atau pihak independen lain yang memiliki kompetensi untuk melakukan penilaian tersebut.</li>
        <li>Ketentuan ini tidak mengesampingkan tanggung jawab yang menurut hukum tidak dapat dikecualikan atau dibatasi.</li>
      </ol>
    ),
  },
  {
    id: "section-7",
    title: "7. Perubahan Ketentuan Penggunaan",
    content: (
      <p>Park and Shine berhak mengubah, memperbarui, atau menyesuaikan Ketentuan Penggunaan ini dari waktu ke waktu. Perubahan tersebut berlaku sejak dipublikasikan melalui website atau media komunikasi resmi Park and Shine. Penggunaan Layanan setelah perubahan dipublikasikan dianggap sebagai persetujuan atas Ketentuan Penggunaan yang telah diperbarui.</p>
    ),
  },
  {
    id: "section-8",
    title: "8. Hukum yang Berlaku & Penyelesaian Sengketa",
    content: (
      <ol className="list-[lower-alpha] pl-5 flex flex-col gap-2">
        <li>Ketentuan Penggunaan ini diatur dan ditafsirkan berdasarkan hukum Republik Indonesia. Dalam hal pengguna merupakan warga negara asing atau terdapat perbedaan penafsiran antara Bahasa Indonesia dan bahasa lainnya, maka versi Bahasa Indonesia pada ketentuan ini yang akan menjadi acuan yang berlaku dan mengikat.</li>
        <li>Setiap sengketa yang timbul sehubungan dengan Ketentuan Penggunaan ini akan terlebih dahulu diselesaikan secara musyawarah untuk mufakat. Apabila penyelesaian tidak tercapai, sengketa akan diselesaikan melalui pengadilan yang berwenang di wilayah Republik Indonesia menurut kompetensi Pengadilan sesuai dengan ketentuan perundang-undangan yang berlaku.</li>
      </ol>
    ),
  },
  {
    id: "section-9",
    title: "9. Cara Menghubungi Kami",
    content: (
      <>
        <p>Apabila Anda memiliki pertanyaan, keluhan, atau membutuhkan bantuan terkait layanan Park and Shine, Anda dapat menghubungi Kami melalui:</p>
        <ul className="list-none pl-0 flex flex-col gap-1">
          <li>Email: <a href="mailto:info@parknshine.net" className="text-[#024ad8] underline">info@parknshine.net</a></li>
          <li>WhatsApp: Segera Hadir</li>
          <li>Website: Segera Hadir</li>
        </ul>
        <p>Seluruh komunikasi antara Anda dan Park and Shine dapat direkam dan disimpan untuk keperluan dokumentasi, peningkatan kualitas layanan, keperluan operasional, kegiatan promosi, serta penyelesaian sengketa apabila diperlukan.</p>
      </>
    ),
  },
];

export function TermsContent() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <MarketingHeader />

      <section className="bg-[#f7f7f7] border-b border-[#e8e8e8] py-10 md:py-14">
        <div className="max-w-200 mx-auto px-4 md:px-12">
          <h1
            className="text-[32px] md:text-[44px] leading-tight text-[#1a1a1a]"
            style={{ fontFamily: manrope, fontWeight: 500 }}
          >
            Syarat &amp; Ketentuan Penggunaan Layanan
          </h1>
          <p className="text-[#636363] text-sm mt-2" style={{ fontFamily: inter }}>
            Terakhir diperbarui: Mei 2026
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-200 mx-auto w-full px-4 md:px-12 py-12 md:py-16">
        <div className="text-[#3d3d3d] text-base leading-6.5 flex flex-col gap-3 mb-8" style={{ fontFamily: inter }}>
          <p>Kami berterima kasih atas kepercayaan Anda terhadap layanan Park and Shine. Mohon meluangkan waktu untuk membaca seluruh Syarat dan Ketentuan Penggunaan layanan Park and Shine ini.</p>
          <p>Dengan melakukan pemesanan dan pembayaran layanan Park and Shine melalui website, QR Code, atau media lain yang disediakan oleh Park and Shine, Anda dianggap telah membaca, memahami, dan menyetujui Ketentuan Penggunaan ini. Apabila Anda tidak menyetujui sebagian atau seluruh ketentuan yang tercantum di dalamnya, mohon untuk tidak melanjutkan penggunaan layanan Park and Shine.</p>
        </div>
        <ContentAccordion items={ITEMS} />
      </main>

      <MarketingFooter activePage="terms" />
    </div>
  );
}
