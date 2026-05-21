import {
  API_RESPONSE_CODES,
  type ApiErrorResponse,
  type ApiResponseCode,
  type ApiSuccessResponse,
} from "@/lib/api-response";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api-error";

export const API_MESSAGE_LOCALES = {
  EN: "en-US",
  ID: "id-ID",
} as const;

export type ApiMessageLocale =
  (typeof API_MESSAGE_LOCALES)[keyof typeof API_MESSAGE_LOCALES];

export const API_SUCCESS_MESSAGES = {
  [API_RESPONSE_CODES.ACCEPTED]: {
    "id-ID": "Permintaan sedang diproses.",
    "en-US": "The request is being processed.",
  },
  [API_RESPONSE_CODES.ADMIN_QUEUE_FETCHED]: {
    "id-ID": "Antrian admin berhasil dimuat.",
    "en-US": "Admin queue loaded successfully.",
  },
  [API_RESPONSE_CODES.BEFORE_PHOTO_UPLOADED]: {
    "id-ID": "Foto kondisi kendaraan berhasil diunggah.",
    "en-US": "Vehicle condition photo uploaded successfully.",
  },
  [API_RESPONSE_CODES.BOOKING_CONFIRMED]: {
    "id-ID": "Booking berhasil dikonfirmasi.",
    "en-US": "Booking confirmed successfully.",
  },
  [API_RESPONSE_CODES.BOOKING_CREATED]: {
    "id-ID": "Booking berhasil dibuat.",
    "en-US": "Booking created successfully.",
  },
  [API_RESPONSE_CODES.BOOKING_FETCHED]: {
    "id-ID": "Data booking berhasil dimuat.",
    "en-US": "Booking data loaded successfully.",
  },
  [API_RESPONSE_CODES.CHECKLIST_ITEM_COMPLETED]: {
    "id-ID": "Langkah checklist berhasil disimpan.",
    "en-US": "Checklist step saved successfully.",
  },
  [API_RESPONSE_CODES.CREATED]: {
    "id-ID": "Data berhasil dibuat.",
    "en-US": "Data created successfully.",
  },
  [API_RESPONSE_CODES.DELETED]: {
    "id-ID": "Data berhasil dihapus.",
    "en-US": "Data deleted successfully.",
  },
  [API_RESPONSE_CODES.DAILY_REPORT_FETCHED]: {
    "id-ID": "Laporan harian berhasil dimuat.",
    "en-US": "Daily report loaded successfully.",
  },
  [API_RESPONSE_CODES.EMPTY]: {
    "id-ID": "Tidak ada data yang tersedia.",
    "en-US": "No data is available.",
  },
  [API_RESPONSE_CODES.JOB_COMPLETED]: {
    "id-ID": "Job berhasil diselesaikan.",
    "en-US": "Job completed successfully.",
  },
  [API_RESPONSE_CODES.JOB_REASSIGNED]: {
    "id-ID": "Job berhasil dialihkan ke crew lain.",
    "en-US": "Job reassigned successfully.",
  },
  [API_RESPONSE_CODES.MEDIA_UPLOADED]: {
    "id-ID": "Media berhasil diunggah.",
    "en-US": "Media uploaded successfully.",
  },
  [API_RESPONSE_CODES.NEXT_JOB_CLAIMED]: {
    "id-ID": "Job berikutnya berhasil diambil.",
    "en-US": "Next job claimed successfully.",
  },
  [API_RESPONSE_CODES.OK]: {
    "id-ID": "Permintaan berhasil.",
    "en-US": "Request completed successfully.",
  },
  [API_RESPONSE_CODES.PAYMENT_RECONCILED]: {
    "id-ID": "Status pembayaran berhasil diperbarui.",
    "en-US": "Payment status updated successfully.",
  },
  [API_RESPONSE_CODES.PLATE_VERIFIED]: {
    "id-ID": "Plat kendaraan berhasil diverifikasi.",
    "en-US": "Vehicle plate verified successfully.",
  },
  [API_RESPONSE_CODES.QR_RESOLVED]: {
    "id-ID": "QR berhasil dibaca.",
    "en-US": "QR resolved successfully.",
  },
  [API_RESPONSE_CODES.RATING_SUBMITTED]: {
    "id-ID": "Terima kasih, rating berhasil dikirim.",
    "en-US": "Thank you, rating submitted successfully.",
  },
  [API_RESPONSE_CODES.REFUND_CREATED]: {
    "id-ID": "Refund berhasil diproses.",
    "en-US": "Refund processed successfully.",
  },
  [API_RESPONSE_CODES.SESSION_CREATED]: {
    "id-ID": "Sesi berhasil dibuat.",
    "en-US": "Session created successfully.",
  },
  [API_RESPONSE_CODES.STATUS_OVERRIDDEN]: {
    "id-ID": "Status booking berhasil diubah.",
    "en-US": "Booking status updated successfully.",
  },
  [API_RESPONSE_CODES.UPDATED]: {
    "id-ID": "Data berhasil diperbarui.",
    "en-US": "Data updated successfully.",
  },
} satisfies Record<ApiResponseCode, Record<ApiMessageLocale, string>>;

export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.ACTIVE_JOB_RESUME_FAILED]: {
    "id-ID": "Job aktif belum bisa dipulihkan. Coba muat ulang halaman.",
    "en-US": "Active job could not be resumed. Try refreshing the page.",
  },
  [API_ERROR_CODES.ADMIN_AUTH_REQUIRED]: {
    "id-ID": "Akses admin diperlukan untuk membuka halaman ini.",
    "en-US": "Admin access is required to open this page.",
  },
  [API_ERROR_CODES.AUTH_FORBIDDEN]: {
    "id-ID": "Anda tidak memiliki izin untuk melakukan aksi ini.",
    "en-US": "You do not have permission to perform this action.",
  },
  [API_ERROR_CODES.AUTH_UNAUTHORIZED]: {
    "id-ID": "Sesi anda sudah berakhir. Silakan masuk kembali.",
    "en-US": "Your session has expired. Please sign in again.",
  },
  [API_ERROR_CODES.BEFORE_PHOTOS_REQUIRED]: {
    "id-ID": "Lengkapi semua foto kendaraan sebelum lanjut.",
    "en-US": "Complete all vehicle photos before continuing.",
  },
  [API_ERROR_CODES.BOOKING_CANCELLED]: {
    "id-ID": "Booking ini sudah dibatalkan.",
    "en-US": "This booking has been cancelled.",
  },
  [API_ERROR_CODES.BOOKING_CUTOFF_PASSED]: {
    "id-ID": "Booking sudah ditutup untuk hari ini.",
    "en-US": "Bookings are closed for today.",
  },
  [API_ERROR_CODES.BOOKING_EXPIRED]: {
    "id-ID": "Booking sudah kadaluarsa.",
    "en-US": "This booking has expired.",
  },
  [API_ERROR_CODES.BOOKING_NOT_FOUND]: {
    "id-ID": "Booking tidak ditemukan.",
    "en-US": "Booking was not found.",
  },
  [API_ERROR_CODES.BOOKING_TOKEN_INVALID]: {
    "id-ID": "Link booking tidak valid atau sudah tidak berlaku.",
    "en-US": "The booking link is invalid or no longer active.",
  },
  [API_ERROR_CODES.CHECKLIST_OUT_OF_ORDER]: {
    "id-ID": "Checklist harus diselesaikan sesuai urutan.",
    "en-US": "Checklist steps must be completed in order.",
  },
  [API_ERROR_CODES.CHECKLIST_SAVE_FAILED]: {
    "id-ID": "Checklist gagal disimpan. Coba lagi.",
    "en-US": "Checklist could not be saved. Try again.",
  },
  [API_ERROR_CODES.CREW_SESSION_EXPIRED]: {
    "id-ID": "Sesi crew sudah berakhir. Masuk kembali dengan shift code dan PIN.",
    "en-US": "Crew session has expired. Sign in again with shift code and PIN.",
  },
  [API_ERROR_CODES.DOUBLE_SUBMIT_BLOCKED]: {
    "id-ID": "Permintaan sudah dikirim. Mohon tunggu.",
    "en-US": "The request has already been sent. Please wait.",
  },
  [API_ERROR_CODES.IDEMPOTENCY_CONFLICT]: {
    "id-ID": "Permintaan pembayaran ini sudah diproses.",
    "en-US": "This payment request has already been processed.",
  },
  [API_ERROR_CODES.IMAGE_COMPRESSION_FAILED]: {
    "id-ID": "Foto gagal dikompresi. Pilih foto lain dan coba lagi.",
    "en-US": "The photo could not be compressed. Choose another photo and try again.",
  },
  [API_ERROR_CODES.IMAGE_TOO_LARGE]: {
    "id-ID": "Ukuran foto terlalu besar.",
    "en-US": "The photo size is too large.",
  },
  [API_ERROR_CODES.INTAKE_PAUSED]: {
    "id-ID": "Layanan sementara tidak tersedia.",
    "en-US": "Service is temporarily unavailable.",
  },
  [API_ERROR_CODES.INVALID_FILE_TYPE]: {
    "id-ID": "Format file tidak didukung.",
    "en-US": "This file type is not supported.",
  },
  [API_ERROR_CODES.JOB_CLAIM_FAILED]: {
    "id-ID": "Job belum bisa diambil. Coba lagi.",
    "en-US": "The job could not be claimed. Try again.",
  },
  [API_ERROR_CODES.JOB_NEEDS_HELP]: {
    "id-ID": "Job membutuhkan bantuan supervisor.",
    "en-US": "This job needs supervisor help.",
  },
  [API_ERROR_CODES.NETWORK_OFFLINE]: {
    "id-ID": "Koneksi internet terputus. Perubahan akan dicoba lagi saat online.",
    "en-US": "Internet connection is offline. Changes will retry when online.",
  },
  [API_ERROR_CODES.NO_JOB_AVAILABLE]: {
    "id-ID": "Tidak ada job saat ini.",
    "en-US": "There are no jobs right now.",
  },
  [API_ERROR_CODES.OCR_FAILED]: {
    "id-ID": "OCR gagal membaca foto. Masukkan data secara manual.",
    "en-US": "OCR could not read the photo. Enter the data manually.",
  },
  [API_ERROR_CODES.OCR_LOW_CONFIDENCE]: {
    "id-ID": "Hasil OCR kurang yakin. Periksa dan edit jika perlu.",
    "en-US": "OCR confidence is low. Review and edit if needed.",
  },
  [API_ERROR_CODES.PAYMENT_GATEWAY_FAILED]: {
    "id-ID": "Gateway pembayaran sedang bermasalah. Coba lagi.",
    "en-US": "The payment gateway is having issues. Try again.",
  },
  [API_ERROR_CODES.PAYMENT_INTENT_EXISTS]: {
    "id-ID": "Pembayaran untuk booking ini sudah dibuat.",
    "en-US": "Payment for this booking has already been created.",
  },
  [API_ERROR_CODES.PAYMENT_RECONCILIATION_FAILED]: {
    "id-ID": "Status pembayaran belum bisa dikonfirmasi. Hubungi support jika pembayaran sudah berhasil.",
    "en-US": "Payment status could not be confirmed. Contact support if payment succeeded.",
  },
  [API_ERROR_CODES.PAYMENT_STATUS_PENDING]: {
    "id-ID": "Pembayaran masih diproses. Cek kembali sebentar lagi.",
    "en-US": "Payment is still being processed. Check again shortly.",
  },
  [API_ERROR_CODES.PIN_INVALID]: {
    "id-ID": "PIN tidak valid.",
    "en-US": "Invalid PIN.",
  },
  [API_ERROR_CODES.PLATE_MISMATCH]: {
    "id-ID": "Plat kendaraan tidak cocok. Supervisor akan membantu.",
    "en-US": "Vehicle plate does not match. A supervisor will help.",
  },
  [API_ERROR_CODES.PLATE_PHOTO_REQUIRED]: {
    "id-ID": "Foto plat nomor wajib diunggah.",
    "en-US": "Plate photo is required.",
  },
  [API_ERROR_CODES.PUSH_PERMISSION_DENIED]: {
    "id-ID": "Izin notifikasi belum diberikan.",
    "en-US": "Notification permission was not granted.",
  },
  [API_ERROR_CODES.QR_NOT_FOUND]: {
    "id-ID": "QR tidak valid. Silakan scan QR di lokasi parkir.",
    "en-US": "Invalid QR. Please scan the QR at the parking location.",
  },
  [API_ERROR_CODES.QR_ROTATED]: {
    "id-ID": "QR ini sudah tidak berlaku. Silakan scan QR terbaru di lokasi.",
    "en-US": "This QR is no longer active. Please scan the latest QR on site.",
  },
  [API_ERROR_CODES.RATE_LIMITED]: {
    "id-ID": "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
    "en-US": "Too many requests. Try again shortly.",
  },
  [API_ERROR_CODES.RATING_INVALID]: {
    "id-ID": "Rating tidak valid.",
    "en-US": "Invalid rating.",
  },
  [API_ERROR_CODES.REASSIGN_FAILED]: {
    "id-ID": "Job gagal dialihkan. Coba lagi.",
    "en-US": "The job could not be reassigned. Try again.",
  },
  [API_ERROR_CODES.REFUND_FAILED]: {
    "id-ID": "Refund gagal diproses. Coba lagi.",
    "en-US": "Refund could not be processed. Try again.",
  },
  [API_ERROR_CODES.REFUND_REASON_REQUIRED]: {
    "id-ID": "Pilih alasan refund terlebih dahulu.",
    "en-US": "Select a refund reason first.",
  },
  [API_ERROR_CODES.REPORT_FETCH_FAILED]: {
    "id-ID": "Laporan belum bisa dimuat. Coba lagi.",
    "en-US": "Report could not be loaded. Try again.",
  },
  [API_ERROR_CODES.SERVER_ERROR]: {
    "id-ID": "Terjadi gangguan pada server. Coba lagi nanti.",
    "en-US": "A server issue occurred. Try again later.",
  },
  [API_ERROR_CODES.SERVICE_UNAVAILABLE]: {
    "id-ID": "Layanan sedang tidak tersedia. Coba lagi nanti.",
    "en-US": "Service is unavailable. Try again later.",
  },
  [API_ERROR_CODES.SHIFT_CODE_INVALID]: {
    "id-ID": "Shift code tidak valid.",
    "en-US": "Invalid shift code.",
  },
  [API_ERROR_CODES.SLOT_PHOTO_REQUIRED]: {
    "id-ID": "Foto signage slot parkir wajib diunggah.",
    "en-US": "Parking slot signage photo is required.",
  },
  [API_ERROR_CODES.SSO_REQUIRED]: {
    "id-ID": "Masuk dengan akun Google Workspace untuk melanjutkan.",
    "en-US": "Sign in with Google Workspace to continue.",
  },
  [API_ERROR_CODES.STALE_JOB_TIMEOUT]: {
    "id-ID": "Job sudah terlalu lama belum ditangani.",
    "en-US": "This job has been waiting too long.",
  },
  [API_ERROR_CODES.STATUS_OVERRIDE_INVALID]: {
    "id-ID": "Perubahan status tidak valid.",
    "en-US": "Invalid status override.",
  },
  [API_ERROR_CODES.STATUS_OVERRIDE_REASON_REQUIRED]: {
    "id-ID": "Alasan perubahan status wajib diisi.",
    "en-US": "A reason is required to override status.",
  },
  [API_ERROR_CODES.STATUS_POLL_FAILED]: {
    "id-ID": "Status booking belum bisa diperbarui. Coba lagi.",
    "en-US": "Booking status could not be refreshed. Try again.",
  },
  [API_ERROR_CODES.UNKNOWN_ERROR]: {
    "id-ID": "Terjadi kesalahan. Coba lagi.",
    "en-US": "Something went wrong. Try again.",
  },
  [API_ERROR_CODES.UNSUPPORTED_LOCALE]: {
    "id-ID": "Bahasa yang dipilih belum didukung.",
    "en-US": "The selected language is not supported yet.",
  },
  [API_ERROR_CODES.UPLOAD_FAILED]: {
    "id-ID": "Upload gagal. Coba lagi.",
    "en-US": "Upload failed. Try again.",
  },
  [API_ERROR_CODES.VALIDATION_ERROR]: {
    "id-ID": "Periksa kembali data yang diisi.",
    "en-US": "Please review the submitted data.",
  },
  [API_ERROR_CODES.WHATSAPP_LINK_INVALID]: {
    "id-ID": "Link WhatsApp tidak valid.",
    "en-US": "WhatsApp link is invalid.",
  },
} satisfies Record<ApiErrorCode, Record<ApiMessageLocale, string>>;

export function getApiSuccessMessage(
  code: ApiResponseCode,
  locale: ApiMessageLocale = API_MESSAGE_LOCALES.ID
) {
  return API_SUCCESS_MESSAGES[code][locale];
}

export function getApiErrorMessage(
  code: ApiErrorCode,
  locale: ApiMessageLocale = API_MESSAGE_LOCALES.ID
) {
  return API_ERROR_MESSAGES[code][locale];
}

export function getApiMessage(
  code: ApiResponseCode | ApiErrorCode,
  locale: ApiMessageLocale = API_MESSAGE_LOCALES.ID
) {
  if (code in API_SUCCESS_MESSAGES) {
    return API_SUCCESS_MESSAGES[code as ApiResponseCode][locale];
  }

  return API_ERROR_MESSAGES[code as ApiErrorCode]?.[locale] ?? code;
}

export function createApiSuccessMessageResponse<TData>({
  code = API_RESPONSE_CODES.OK,
  data,
  locale = API_MESSAGE_LOCALES.ID,
  message,
  meta,
}: {
  code?: ApiResponseCode;
  data: TData;
  locale?: ApiMessageLocale;
  message?: string;
  meta?: ApiSuccessResponse<TData>["meta"];
}): ApiSuccessResponse<TData> {
  return {
    code,
    data,
    message: message ?? getApiSuccessMessage(code, locale),
    meta,
    success: true,
  };
}

export function createApiErrorMessageResponse({
  code,
  details,
  fieldErrors,
  locale = API_MESSAGE_LOCALES.ID,
  message,
  meta,
}: Omit<ApiErrorResponse, "success" | "message"> & {
  locale?: ApiMessageLocale;
  message?: string;
}): ApiErrorResponse {
  return {
    code,
    details,
    fieldErrors,
    message: message ?? getApiErrorMessage(code, locale),
    meta,
    success: false,
  };
}
