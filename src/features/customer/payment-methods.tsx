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
};

export const PAYMENT_CATEGORIES: { label: string; methods: PaymentMethodDef[] }[] = [
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
];

// ─── Admin-controlled filtering ────────────────────────────────────────────────

export function filterEnabledPaymentCategories(
  categories: { label: string; methods: PaymentMethodDef[] }[],
  enabledCodes: string[],
): { label: string; methods: PaymentMethodDef[] }[] {
  return categories
    .map((category) => ({
      ...category,
      methods: category.methods.filter((method) =>
        enabledCodes.includes(method.code),
      ),
    }))
    .filter((category) => category.methods.length > 0);
}
