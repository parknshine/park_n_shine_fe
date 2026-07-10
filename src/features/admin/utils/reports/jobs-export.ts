import type { ReportBookingRow } from "@/features/admin/types";
import { bookingRevenue } from "@/features/admin/utils/booking-revenue";
import { formatDate } from "./jobs-format";

export type LedgerRow = ReportBookingRow & { _ledgerType?: "PAID" | "REFUND" };

export function expandLedgerRows(rows: ReportBookingRow[]): LedgerRow[] {
  const result: LedgerRow[] = [];
  for (const row of rows) {
    if (row.refundedAmount > 0) {
      result.push({ ...row, _ledgerType: "REFUND" });
      result.push({ ...row, _ledgerType: "PAID" });
    } else {
      result.push(row as LedgerRow);
    }
  }
  return result;
}

function rowsToSheetData(rows: ReportBookingRow[]) {
  return rows.map((r) => ({
    "Booking ID": r.id,
    Date: formatDate(r.createdAt),
    Site: r.siteName ?? "—",
    Slot: r.slot ?? "—",
    Crew: r.crewName ?? "—",
    Status: r.status,
    "Payment Status": r.paymentStatus,
    "Price (IDR)": r.price,
    "Payment Method": r.paymentMethod ?? "—",
    "Paid At": r.paidAt ? formatDate(r.paidAt) : "—",
    "Refunded (IDR)": r.refundedAmount,
    Rating: r.rating ?? "—",
    "Rating Note": r.ratingNote ?? "—",
  }));
}

function computeTotals(rows: ReportBookingRow[]) {
  return {
    totalPrice: rows.reduce((sum, r) => sum + bookingRevenue(r), 0),
    totalRefunded: rows.reduce((sum, r) => sum + r.refundedAmount, 0),
  };
}

export async function downloadExcel(rows: ReportBookingRow[], filename: string) {
  const XLSX = await import("xlsx");
  const data = rowsToSheetData(rows);
  const { totalPrice, totalRefunded } = computeTotals(rows);
  data.push({
    "Booking ID": "TOTAL",
    Date: "",
    Site: "",
    Slot: "",
    Crew: "",
    Status: "",
    "Payment Status": "",
    "Price (IDR)": totalPrice,
    "Payment Method": "",
    "Paid At": "",
    "Refunded (IDR)": totalRefunded,
    Rating: "",
    "Rating Note": "",
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jobs");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function downloadCSV(rows: ReportBookingRow[], filename: string) {
  function csvField(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === "—") return "";
    return `"${String(val).replace(/"/g, '""')}"`;
  }
  const { totalPrice, totalRefunded } = computeTotals(rows);
  const header =
    "Booking ID,Date,Site,Slot,Crew,Status,Payment Status,Price (IDR),Payment Method,Paid At,Refunded (IDR),Rating,Rating Note\n";
  const dataRows = rows
    .map((r) =>
      [
        csvField(r.id),
        csvField(formatDate(r.createdAt)),
        csvField(r.siteName),
        csvField(r.slot),
        csvField(r.crewName),
        csvField(r.status),
        csvField(r.paymentStatus),
        r.price,
        csvField(r.paymentMethod),
        csvField(r.paidAt ? formatDate(r.paidAt) : null),
        r.refundedAmount,
        csvField(r.rating != null ? String(r.rating) : null),
        csvField(r.ratingNote),
      ].join(","),
    )
    .join("\n");
  const totalRow = `"TOTAL",,,,,,,${totalPrice},,,${totalRefunded},,`;
  const csv = header + dataRows + "\n" + totalRow;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
