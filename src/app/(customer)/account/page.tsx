"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Camera,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Save,
  User,
} from "lucide-react";
import { useCustomerAuthStore } from "@/store/customer-auth-store";
import { useCustomerAuth } from "@/features/customer/hooks";
import customerApi from "@/lib/axios-customer";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setMarketingBackOrigin } from "@/lib/marketing-back-origin";
import type { Customer } from "@/types";
import { isValidPhone, normalizePhone } from "@/features/customer/utils/phone";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Unauthenticated gate ──────────────────────────────────────────────────────

export default function AccountPage() {
  const { t } = useTranslation("customer");
  const router = useRouter();
  const hasHydrated = useCustomerAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);

  if (!hasHydrated) {
    return <div className='min-h-[60vh]' />;
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className='mx-auto max-w-md flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center'>
        <User className='h-12 w-12 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          {t("account.authPrompt")}
        </p>
        <Button className='rounded-full' onClick={() => router.push("/login")}>
          {t("account.loginCta")}
        </Button>
      </div>
    );
  }

  // key={customer.id} ensures AccountView remounts (and useState re-initialises)
  // after Zustand hydrates from localStorage with the real customer data.
  return <AccountView key={customer.id} customer={customer} />;
}

// ── Authenticated view ────────────────────────────────────────────────────────

function AccountView({ customer }: Readonly<{ customer: Customer }>) {
  const router = useRouter();
  const { t } = useTranslation("customer");
  const updateCustomer = useCustomerAuthStore((s) => s.updateCustomer);
  const { logout } = useCustomerAuth();

  const [name, setName] = useState(customer.name ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const enteredPhone = phone.trim();
  const phoneForValidation = enteredPhone.startsWith("+")
    ? enteredPhone
    : enteredPhone.startsWith("62")
      ? `+${enteredPhone}`
      : `+62${enteredPhone.replace(/^0/, "")}`;
  const isPhoneValid =
    !enteredPhone || isValidPhone(phoneForValidation);

  useEffect(() => {
    customerApi
      .get<Customer>("/v1/me")
      .then(({ data }) => {
        if (data) {
          updateCustomer(data);
          setName(data.name ?? "");
          setPhone(data.phone ?? "");
        }
      })
      .catch(() => {});
  }, [updateCustomer]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();

    if (!isPhoneValid) {
      toast.error(t("account.phoneInvalid"));
      return;
    }

    setIsSaving(true);
    try {
      const payload: { name?: string; phone?: string } = {};
      if (name.trim() && name.trim() !== customer.name)
        payload.name = name.trim();
      if (enteredPhone !== (customer.phone ?? ""))
        payload.phone = enteredPhone ? normalizePhone(phone) : "";
      if (Object.keys(payload).length === 0) return;

      const { data } = await customerApi.patch<Customer>("/v1/me", payload);
      if (data) updateCustomer(data);
      toast.success(t("account.saveSuccess"));
    } catch {
      toast.error(t("account.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPhotoUrl(previewUrl);
    setIsUploadingPhoto(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await customerApi.post<Customer>("/v1/me/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data) updateCustomer(data);
      URL.revokeObjectURL(previewUrl);
      setLocalPhotoUrl(null);
      toast.success(t("account.photoSuccess"));
    } catch {
      URL.revokeObjectURL(previewUrl);
      setLocalPhotoUrl(null);
      toast.error(t("account.photoError"));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  }

  const displayPhotoUrl = localPhotoUrl ?? customer.photoUrl ?? null;
  const initials = getInitials(customer.name ?? null);


  const prefRows = [
    {
      label: t("account.support"),
      tint: "bg-[#f1f0fb]",
      color: "text-[#514eb6]",
      icon: <MessageCircle className='h-4.75 w-4.75' />,
      onClick: () => {
        setMarketingBackOrigin("/home");
        router.push("/support");
      },
    },
  ];

  return (
    <div className='min-h-screen bg-[#eff8fe]'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(120%_90%_at_0%_0%,#cdeafd_0%,transparent_55%),radial-gradient(120%_80%_at_100%_0%,#fdf2cf_0%,transparent_42%)]' />

      <div className='relative mx-auto max-w-md space-y-4 px-4 py-4'>
        <h1 className='text-[25px] font-extrabold tracking-tight text-[#273034]'>
          {t("account.title")}
        </h1>

        {/* ── Profile Hero Card ─────────────────────────────────────── */}
        <div className='relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#005a7e] via-[#0a8abf] to-[#1db1f1] px-5 py-6 shadow-[0_20px_48px_rgba(0,98,137,0.28)]'>
          <div className='pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/[0.07]' />
          <div className='pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/[0.05]' />

          <div className='relative flex items-center gap-4'>
            {/* Avatar — tap to open photo options */}
            <button
              type='button'
              onClick={() => setPhotoDialogOpen(true)}
              disabled={isUploadingPhoto}
              className='relative shrink-0 cursor-pointer'
              aria-label={t("account.changePhoto")}
            >
              {displayPhotoUrl && failedPhotoUrl !== displayPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhotoUrl}
                  alt={customer.name ?? ""}
                  onError={() => setFailedPhotoUrl(displayPhotoUrl)}
                  className={cn(
                    "h-15.5 w-15.5 rounded-[20px] object-cover border-[2.5px] border-white/40 shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition-opacity",
                    isUploadingPhoto && "opacity-60",
                  )}
                />
              ) : (
                <div
                  className={cn(
                    "flex h-15.5 w-15.5 items-center justify-center rounded-[20px] border-[2.5px] border-white/30 bg-white/16 text-[22px] font-extrabold tracking-tight text-white shadow-[0_10px_22px_rgba(0,0,0,0.18)] transition-opacity",
                    isUploadingPhoto && "opacity-60",
                  )}
                >
                  {initials}
                </div>
              )}
              <div className='absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-white bg-[#fdd34d] text-[#5c4900] shadow-sm'>
                {isUploadingPhoto ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <Camera className='h-3 w-3' />
                )}
              </div>
            </button>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={handlePhotoChange}
            />

            {/* Name & email */}
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[18px] font-extrabold leading-tight tracking-tight text-white'>
                {customer.name ?? "—"}
              </p>
              <p className='mt-0.5 truncate text-[13px] text-white/70'>
                {customer.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Personal Info Form ────────────────────────────────────── */}
        <form onSubmit={handleSave} className='space-y-4'>
          <div className='rounded-[22px] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(0,98,137,0.08)]'>
            <div className='mb-4 flex items-center gap-2'>
              <div className='flex h-5.5 w-5.5 items-center justify-center rounded-[7px] bg-[#e8f2f9]'>
                <User className='h-3 w-3 text-[#006289]' />
              </div>
              <span className='text-[13px] font-extrabold tracking-[0.02em] text-[#273034]'>
                {t("account.personalInfoTitle")}
              </span>
            </div>

            <label className='mb-1.5 block text-[12px] font-bold uppercase tracking-[0.04em] text-[#9aa6ad]'>
              {t("account.nameLabel")}
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete='name'
              className='mb-4 h-12.5 w-full rounded-[14px] border border-[rgba(111,120,125,0.18)] bg-[#f4f9fc] px-4 font-sans text-[15px] font-semibold text-[#273034] outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
            />

            <label className='mb-1.5 block text-[12px] font-bold uppercase tracking-[0.04em] text-[#9aa6ad]'>
              {t("account.emailLabel")}
            </label>
            <div className='relative mb-1.5'>
              <input
                type='email'
                value={customer.email ?? ""}
                readOnly
                tabIndex={-1}
                className='h-12.5 w-full cursor-not-allowed rounded-[14px] border border-[rgba(111,120,125,0.12)] bg-[#eef1f3] px-4 pr-12 font-sans text-[15px] font-semibold text-[#9aa6ad] outline-none'
              />
              <div className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c2ccd1]'>
                <Lock className='h-4 w-4' />
              </div>
            </div>
            <p className='mb-4 flex items-center gap-1 text-[12px] text-[#b3bcc1]'>
              <Info className='h-3 w-3 shrink-0' />
              {t("account.emailNote")}
            </p>

            <label className='mb-1.5 block text-[12px] font-bold uppercase tracking-[0.04em] text-[#9aa6ad]'>
              {t("account.phoneLabel")}
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex w-14.5 items-center justify-center border-r border-[rgba(111,120,125,0.15)] text-[15px] font-semibold text-[#5a666d]'>
                +62
              </div>
              <input
                type='tel'
                inputMode='numeric'
                placeholder='81234567890'
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                autoComplete='tel'
                className='h-12.5 w-full rounded-[14px] border border-[rgba(111,120,125,0.18)] bg-[#f4f9fc] pl-17.5 pr-4 font-sans text-[15px] font-semibold text-[#273034] outline-none transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
              />
            </div>
            {!isPhoneValid && (
              <p className='mt-1.5 text-[12px] text-red-500'>
                {t("account.phoneInvalid")}
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isSaving || !isPhoneValid}
            className='flex h-13.5 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#006289] to-[#1db1f1] text-[16px] font-bold text-white shadow-[0_16px_32px_rgba(0,98,137,0.30)] disabled:opacity-70'
          >
            {isSaving ? (
              <>
                <Loader2 className='h-4.5 w-4.5 animate-spin' />
                {t("account.saving")}
              </>
            ) : (
              <>
                <Save className='h-4.5 w-4.5' />
                {t("account.saveChangesBtn")}
              </>
            )}
          </button>
        </form>

        {/* ── Preferences ──────────────────────────────────────────── */}
        <div className='overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_rgba(0,98,137,0.08)]'>
          {prefRows.map((row, i) => (
            <button
              key={row.label}
              type='button'
              onClick={row.onClick}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f4f9fc] active:bg-[#eef4f8]",
                i < prefRows.length - 1 &&
                  "border-b border-[rgba(111,120,125,0.10)]",
              )}
            >
              <div
                className={cn(
                  "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[11px]",
                  row.tint,
                  row.color,
                )}
              >
                {row.icon}
              </div>
              <span className='flex-1 text-[14px] font-bold text-[#273034]'>
                {row.label}
              </span>
              <ChevronRight className='h-4 w-4 text-[#c2ccd1]' />
            </button>
          ))}
        </div>

        {/* ── Logout ───────────────────────────────────────────────── */}
        <button
          type='button'
          onClick={logout}
          className='flex h-12.5 w-full items-center justify-center gap-2 rounded-full border border-red-200/60 bg-red-50/70 text-[15px] font-bold text-red-500'
        >
          <LogOut className='h-4.25 w-4.25' />
          {t("account.logoutBtn")}
        </button>

        <p className='pb-2 text-center text-[12px] text-[#b3bcc1]'>
          {t("account.appVersion")}
        </p>
      </div>

      {/* ── Photo Options Dialog ──────────────────────────────────── */}
      {photoDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-end justify-center px-4 pb-6'>
          <button
            type='button'
            className='absolute inset-0 bg-black/40'
            aria-label={t("account.close")}
            onClick={() => setPhotoDialogOpen(false)}
          />
          <dialog
            open
            className='relative w-full max-w-md rounded-3xl bg-white p-5 space-y-4 m-0'
          >
            <h3 className='text-[15px] font-extrabold text-[#273034]'>
              {t("account.changePhoto")}
            </h3>

            {/* Upload file */}
            <button
              type='button'
              onClick={() => {
                setPhotoDialogOpen(false);
                fileInputRef.current?.click();
              }}
              className='flex h-11 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#006289] to-[#1db1f1] text-[14px] font-bold text-white'
            >
              <Camera className='h-4 w-4' />
              {t("account.uploadFromGallery")}
            </button>

            <button
              type='button'
              onClick={() => setPhotoDialogOpen(false)}
              className='w-full py-2 text-[13px] text-[#9aa6ad]'
            >
              {t("account.cancel")}
            </button>
          </dialog>
        </div>
      )}
    </div>
  );
}

function StarIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='#fdd34d'>
      <path d='M12 2l2 6.5L20.5 10 14 12l-2 6.5L10 12 3.5 10 10 8.5 12 2z' />
    </svg>
  );
}
