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
