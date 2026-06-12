export type TipPaymentMethod = "qris" | "gopay" | "shopeepay";

export const TIP_PRESETS = [5_000, 10_000] as const;

export interface TipQrisInstructions {
  type: "QRIS";
  qrString: string;
  expiryTime: string;
}

export interface TipEwalletInstructions {
  type: "EWALLET";
  provider: "gopay" | "shopeepay";
  deepLinkUrl: string;
  expiryTime: string;
}

export type TipInstructions = TipQrisInstructions | TipEwalletInstructions;

export interface TipPaymentResponse {
  tipId: string;
  instructions: TipInstructions;
}
