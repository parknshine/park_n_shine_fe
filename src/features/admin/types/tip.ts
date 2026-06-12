export interface CrewTipSummary {
  crewId: string;
  crewName: string;
  crewPhone: string | null;
  tipCount: number;
  totalPaid: number;
  totalDisbursed: number;
  pendingDisbursement: number;
}

export interface CrewSummaryResponse {
  period: string;
  crews: CrewTipSummary[];
  summary: {
    totalPaid: number;
    totalDisbursed: number;
    crewCount: number;
  };
}

export interface DisbursementEvent {
  id: string;
  period: string;
  totalAmount: number;
  notes: string | null;
  exportedAt: string | null;
  createdAt: string;
}

export interface AdminTipRow {
  id: string;
  bookingId: string;
  crewName: string | null;
  siteName: string | null;
  amount: number;
  paymentMethod: string | null;
  status: "PAID" | "DISBURSED";
  paidAt: string | null;
}

export interface TipListResponse {
  period: string;
  tips: AdminTipRow[];
  total: number;
  page: number;
  limit: number;
}
