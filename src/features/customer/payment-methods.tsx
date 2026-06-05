// ─── CDN base ─────────────────────────────────────────────────────────────────

const CDN = "https://midtrans-website.al-mp-id-p.cdn.gtflabs.io/uploads";

// ─── Payment method registry ──────────────────────────────────────────────────

export interface PaymentMethodDef {
  code: string;
  name: string;
  subtitle: string;
  logoUrl: string;
}

export const PAYMENT_METHOD_MAP: Record<string, PaymentMethodDef> = {
  CREDIT_CARD: {
    code: "CREDIT_CARD",
    name: "Kartu Kredit / Debit",
    subtitle: "Visa · Mastercard · JCB",
    logoUrl: `${CDN}/2021/02/bc8804c570a21f444ff665c5e8882b06_be31feee12a5fd37e039cd951d664959_compressed.png`,
  },
  QRIS: {
    code: "QRIS",
    name: "QRIS",
    subtitle: "Semua dompet digital",
    logoUrl: `${CDN}/2021/03/5db129dbf7357fd4b59fe9fbbf883f74_e82f1494c766508e8bb827c564ccf373_compressed.png`,
  },
  SHOPEEPAY: {
    code: "SHOPEEPAY",
    name: "ShopeePay",
    subtitle: "Bayar dengan ShopeePay",
    logoUrl: `${CDN}/2020/10/f7fb2e0ab8572355142dba33ddc7b8d6_0747205be87147c03d04217ad4eb06c3_compressed.png`,
  },
  GOPAY: {
    code: "GOPAY",
    name: "GoPay",
    subtitle: "Bayar dengan GoPay",
    logoUrl: `${CDN}/2020/09/080278a8b6c1dea174b9109fa539355e_2af5ca82c1d8c4b76219600643ff509a_compressed.png`,
  },
  BCA: {
    code: "BCA",
    name: "Bank BCA",
    subtitle: "Virtual Account BCA",
    logoUrl: `${CDN}/2020/09/fc68a00838f69124fddaf64e30f5e958_ca45aac69ce87ce691c3e6582894b6f0_compressed.png`,
  },
  BNI: {
    code: "BNI",
    name: "Bank BNI",
    subtitle: "Virtual Account BNI",
    logoUrl: `${CDN}/2020/09/f6f57e9126c57179cf729cc9586e47c0_e26ce4cce944fe379072ae509fe72ec1_compressed.png`,
  },
  BRI: {
    code: "BRI",
    name: "Bank BRI",
    subtitle: "Virtual Account BRI",
    logoUrl: `${CDN}/2020/09/7591290494be00b0470598db60efa1ad_d60ae495ef3a7e26168752e1a9fb4104_compressed.png`,
  },
  PERMATA: {
    code: "PERMATA",
    name: "Permata Bank",
    subtitle: "Virtual Account Permata",
    logoUrl: `${CDN}/2024/10/0cc71e14e4de9ea873b0c97a7a4b2055_40a9bde2ab3051ee67944f979a91b65c_compressed.png`,
  },
  CIMB: {
    code: "CIMB",
    name: "CIMB Niaga",
    subtitle: "Virtual Account CIMB",
    logoUrl: `${CDN}/2023/08/edd9f22258760cc127712d1292f8a10a_e4b59ee9f4466d7d808dc89f031da7a6_compressed.png`,
  },
  MANDIRI: {
    code: "MANDIRI",
    name: "Bank Mandiri",
    subtitle: "Mandiri echannel",
    logoUrl: `${CDN}/2020/09/11f8970a182ad8cf6aaf0a0cd22dd9ad_3948cb3bf5c4887c7cca7ca7ee421708_compressed.png`,
  },
  BSI: {
    code: "BSI",
    name: "BSI",
    subtitle: "Virtual Account BSI",
    logoUrl: `${CDN}/2026/01/e532a2a311c008bd57860e0d2421a1b1_9cef30936521d99ed6cfc577a02a98bd_compressed.png`,
  },
  BTN: {
    code: "BTN",
    name: "Bank BTN",
    subtitle: "Virtual Account BTN",
    logoUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23003082'/%3E%3Ctext x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='13' font-weight='800' font-family='sans-serif'%3EBTN%3C/text%3E%3C/svg%3E`,
  },
};

export const PAYMENT_CATEGORIES: { label: string; methods: PaymentMethodDef[] }[] = [
  {
    label: "Kartu Kredit / Debit",
    methods: [PAYMENT_METHOD_MAP.CREDIT_CARD],
  },
  {
    label: "QRIS",
    methods: [PAYMENT_METHOD_MAP.QRIS],
  },
  {
    label: "E-Wallet",
    methods: [
      PAYMENT_METHOD_MAP.SHOPEEPAY,
      PAYMENT_METHOD_MAP.GOPAY,
    ],
  },
  {
    label: "Transfer Bank",
    methods: [
      PAYMENT_METHOD_MAP.BCA,
      PAYMENT_METHOD_MAP.BNI,
      PAYMENT_METHOD_MAP.BRI,
      PAYMENT_METHOD_MAP.PERMATA,
      PAYMENT_METHOD_MAP.CIMB,
      PAYMENT_METHOD_MAP.MANDIRI,
      PAYMENT_METHOD_MAP.BSI,
      PAYMENT_METHOD_MAP.BTN,
    ],
  },
];
