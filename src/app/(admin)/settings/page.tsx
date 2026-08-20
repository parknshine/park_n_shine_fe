"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/features/admin/hooks";
import type { AdminSettings } from "@/features/admin/types";
import { useTranslation } from "@/i18n";
import { useAuthStore } from "@/store/auth-store";

interface SettingsTableProps {
  settings: AdminSettings;
  save: (
    data: Partial<
      Pick<
        AdminSettings,
        | "whatsappNumber"
        | "avgCleaningMinutes"
        | "paymentExpiryMinutes"
        | "crewTimeExtensionMinutes"
        | "loyaltyEnabled"
        | "loyaltyOtpChannel"
        | "signupDiscountPercent"
        | "loyaltyWashThreshold"
        | "loyaltyRewardDiscountPercent"
        | "washPrice"
      >
    >,
  ) => Promise<unknown>;
  isSaving: boolean;
}

function SettingsTable({
  settings,
  save,
  isSaving,
}: Readonly<SettingsTableProps>) {
  const { t } = useTranslation("admin");
  const role = useAuthStore((s) => s.role);
  const [avgCleaning, setAvgCleaning] = useState(settings.avgCleaningMinutes);
  const [paymentExpiry, setPaymentExpiry] = useState(
    settings.paymentExpiryMinutes,
  );
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber);
  const [crewTimeExtension, setCrewTimeExtension] = useState(
    settings.crewTimeExtensionMinutes,
  );
  const [washPrice, setWashPrice] = useState(settings.washPrice);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(settings.loyaltyEnabled);
  const [signupDiscountPercent, setSignupDiscountPercent] = useState(
    settings.signupDiscountPercent,
  );
  const [loyaltyWashThreshold, setLoyaltyWashThreshold] = useState(
    settings.loyaltyWashThreshold,
  );
  const [loyaltyRewardDiscountPercent, setLoyaltyRewardDiscountPercent] =
    useState(settings.loyaltyRewardDiscountPercent);

  async function handleSave(
    payload: Parameters<typeof save>[0],
    successKey: string,
    errorKey: string,
  ) {
    try {
      await save(payload);
      toast.success(t(successKey));
    } catch {
      toast.error(t(errorKey));
    }
  }

  return (
    <div className='rounded-lg border border-border overflow-hidden'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/40'>
            <th className='px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-2/5'>
              {t("settings.table.setting")}
            </th>
            <th className='px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground'>
              {t("settings.table.value")}
            </th>
            <th className='px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-32'>
              {t("settings.table.action")}
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {/* Crew Time Extension */}
          <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>
                {t("settings.crewTimeExtension.title")}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t("settings.crewTimeExtension.description")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='crew-time-extension-input'
                  type='text'
                  inputMode='numeric'
                  value={crewTimeExtension}
                  onChange={(e) => setCrewTimeExtension(Number(e.target.value))}
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>
                  {t("settings.crewTimeExtension.unit")}
                </span>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {t("settings.crewTimeExtension.hint")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex flex-col gap-1.5'>
                <Button
                  size='sm'
                  disabled={isSaving}
                  onClick={() =>
                    handleSave(
                      { crewTimeExtensionMinutes: crewTimeExtension },
                      "settings.crewTimeExtension.success",
                      "settings.crewTimeExtension.error",
                    )
                  }
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setCrewTimeExtension(10)}
                  className='text-xs text-muted-foreground underline hover:text-foreground text-left'
                >
                  {t("settings.crewTimeExtension.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Avg Cleaning Duration */}
          <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>
                {t("settings.avgCleaning.title")}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t("settings.avgCleaning.description")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='avg-cleaning-input'
                  type='text'
                  inputMode='numeric'
                  value={avgCleaning}
                  onChange={(e) => setAvgCleaning(Number(e.target.value))}
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>
                  {t("settings.avgCleaning.unit")}
                </span>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {t("settings.avgCleaning.hint")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex flex-col gap-1.5'>
                <Button
                  size='sm'
                  disabled={isSaving}
                  onClick={() =>
                    handleSave(
                      { avgCleaningMinutes: avgCleaning },
                      "settings.avgCleaning.success",
                      "settings.avgCleaning.error",
                    )
                  }
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setAvgCleaning(30)}
                  className='text-xs text-muted-foreground underline hover:text-foreground text-left'
                >
                  {t("settings.avgCleaning.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {/* Payment Expiry */}
          <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>
                {t("settings.paymentExpiry.title")}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t("settings.paymentExpiry.description")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='payment-expiry-input'
                  type='text'
                  inputMode='numeric'
                  value={paymentExpiry}
                  onChange={(e) => setPaymentExpiry(Number(e.target.value))}
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>
                  {t("settings.paymentExpiry.unit")}
                </span>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {t("settings.paymentExpiry.hint")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex flex-col gap-1.5'>
                <Button
                  size='sm'
                  disabled={isSaving}
                  onClick={() =>
                    handleSave(
                      { paymentExpiryMinutes: paymentExpiry },
                      "settings.paymentExpiry.success",
                      "settings.paymentExpiry.error",
                    )
                  }
                >
                  {t("settings.table.save")}
                </Button>
                <button
                  onClick={() => setPaymentExpiry(15)}
                  className='text-xs text-muted-foreground underline hover:text-foreground text-left'
                >
                  {t("settings.paymentExpiry.resetLabel")}
                </button>
              </div>
            </td>
          </tr>

          {role === "super_admin" && (
            <tr className='align-top'>
              <td className='px-4 py-3'>
                <p className='font-medium text-foreground'>
                  {t("settings.washPrice.title")}
                </p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {t("settings.washPrice.description")}
                </p>
              </td>
              <td className='px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>Rp</span>
                  <Input
                    id='wash-price-input'
                    type='text'
                    inputMode='numeric'
                    value={washPrice}
                    onChange={(e) => setWashPrice(Number(e.target.value))}
                    className='w-28 h-8 text-sm'
                  />
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {t("settings.washPrice.hint")}
                </p>
              </td>
              <td className='px-4 py-3'>
                <div className='flex flex-col gap-1.5'>
                  <Button
                    size='sm'
                    disabled={isSaving}
                    onClick={() =>
                      handleSave(
                        { washPrice },
                        "settings.washPrice.success",
                        "settings.washPrice.error",
                      )
                    }
                  >
                    {t("settings.table.save")}
                  </Button>
                  <button
                    onClick={() => setWashPrice(50000)}
                    className='text-xs text-muted-foreground underline hover:text-foreground text-left'
                  >
                    {t("settings.washPrice.resetLabel")}
                  </button>
                </div>
              </td>
            </tr>
          )}

          {/* Loyalty Program */}
          {/* <tr className='align-top'>
            <td className='px-4 py-3' colSpan={3}>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                Program Loyalti (IN PROGRESS)
              </p>
            </td>
          </tr> */}

          {/* Loyalty Enabled */}
          {/* <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>
                Tampilkan program loyalti ke customer
              </p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-3'>
                <Switch
                  id='loyalty-enabled-input'
                  checked={loyaltyEnabled}
                  onCheckedChange={setLoyaltyEnabled}
                  className='h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30'
                />
                <label
                  htmlFor='loyalty-enabled-input'
                  className={cn(
                    "text-sm font-medium cursor-pointer select-none",
                    loyaltyEnabled ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {loyaltyEnabled ? "Aktif" : "Nonaktif"}
                </label>
              </div>
            </td>
            <td className='px-4 py-3'>
              <Button
                size='sm'
                disabled={isSaving}
                onClick={() =>
                  handleSave(
                    { loyaltyEnabled },
                    "settings.loyaltyEnabled.success",
                    "settings.loyaltyEnabled.error",
                  )
                }
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr> */}

          {/* Signup Discount */}
          {/* <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>Diskon signup (%)</p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='signup-discount-input'
                  type='text'
                  inputMode='numeric'
                  value={signupDiscountPercent}
                  onChange={(e) =>
                    setSignupDiscountPercent(Number(e.target.value))
                  }
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>%</span>
              </div>
            </td>
            <td className='px-4 py-3'>
              <Button
                size='sm'
                disabled={isSaving}
                onClick={() =>
                  handleSave(
                    { signupDiscountPercent },
                    "settings.signupDiscount.success",
                    "settings.signupDiscount.error",
                  )
                }
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr> */}

          {/* Loyalty Wash Threshold */}
          {/* <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>Jumlah stempel</p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='loyalty-wash-threshold-input'
                  type='text'
                  inputMode='numeric'
                  value={loyaltyWashThreshold}
                  onChange={(e) =>
                    setLoyaltyWashThreshold(Number(e.target.value))
                  }
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>cuci</span>
              </div>
            </td>
            <td className='px-4 py-3'>
              <Button
                size='sm'
                disabled={isSaving}
                onClick={() =>
                  handleSave(
                    { loyaltyWashThreshold },
                    "settings.loyaltyThreshold.success",
                    "settings.loyaltyThreshold.error",
                  )
                }
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr> */}

          {/* Loyalty Reward Discount */}
          {/* <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>Diskon reward (%)</p>
            </td>
            <td className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Input
                  id='loyalty-reward-discount-input'
                  type='text'
                  inputMode='numeric'
                  value={loyaltyRewardDiscountPercent}
                  onChange={(e) =>
                    setLoyaltyRewardDiscountPercent(Number(e.target.value))
                  }
                  className='w-20 h-8 text-sm'
                />
                <span className='text-xs text-muted-foreground'>%</span>
              </div>
            </td>
            <td className='px-4 py-3'>
              <Button
                size='sm'
                disabled={isSaving}
                onClick={() =>
                  handleSave(
                    { loyaltyRewardDiscountPercent },
                    "settings.loyaltyReward.success",
                    "settings.loyaltyReward.error",
                  )
                }
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr> */}

          {/* WhatsApp Number */}
          <tr className='align-top'>
            <td className='px-4 py-3'>
              <p className='font-medium text-foreground'>
                {t("settingsWhatsapp.supportTitle")}
              </p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t("settingsWhatsapp.supportDesc")}
              </p>
            </td>
            <td className='px-4 py-3'>
              <Input
                id='wa-number-input'
                type='tel'
                placeholder='628123456789'
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className='w-44 h-8 text-sm'
              />
            </td>
            <td className='px-4 py-3'>
              <Button
                size='sm'
                disabled={isSaving}
                onClick={() =>
                  handleSave(
                    { whatsappNumber: waNumber },
                    "settingsWhatsapp.toast.saveSuccess",
                    "settingsWhatsapp.toast.saveFailed",
                  )
                }
              >
                {t("settings.table.save")}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const MAX_PROMO_BANNERS = 3;

function PromoBannerSlot({
  slotNumber,
  banner,
  isUploadingPromoBanner,
  isDeletingPromoBanner,
  onUpload,
  onRemove,
}: Readonly<{
  slotNumber: number;
  banner: { key: string; url: string } | null;
  isUploadingPromoBanner: boolean;
  isDeletingPromoBanner: boolean;
  onUpload: (file: File) => void;
  onRemove: (key: string) => void;
}>) {
  const { t } = useTranslation("admin");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onUpload(file);
  }

  if (banner) {
    return (
      <div className='group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm'>
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic storage URL, not in next/image remotePatterns */}
        <img
          src={banner.url}
          alt={t("settings.promoBanner.slotAlt", { n: slotNumber })}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
        <span className='absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[11px] font-bold text-primary shadow-sm'>
          {slotNumber}
        </span>
        <button
          type='button'
          disabled={isDeletingPromoBanner}
          onClick={() => onRemove(banner.key)}
          className='absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm transition-all hover:bg-destructive hover:text-white disabled:opacity-50 group-hover:opacity-100'
          aria-label={t("settings.promoBanner.removeLabel")}
        >
          <X className='h-3.5 w-3.5' />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant='ghost'
      disabled={isUploadingPromoBanner}
      asChild
      className='aspect-4/3 h-auto w-full flex-col gap-1.5 rounded-xl border-2 border-dashed border-border bg-(--surface-low)/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-(--surface-low) hover:text-primary'
    >
      <label className='cursor-pointer'>
        <ImagePlus className='h-5 w-5' />
        <span className='text-xs font-medium'>
          {isUploadingPromoBanner
            ? t("settings.promoBanner.uploading")
            : t("settings.promoBanner.uploadLabel")}
        </span>
        <input
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
      </label>
    </Button>
  );
}

function PromoBannerSection({
  promoBannerKeys,
  promoBannerUrls,
  uploadPromoBanner,
  isUploadingPromoBanner,
  deletePromoBanner,
  isDeletingPromoBanner,
}: Readonly<{
  promoBannerKeys: string[];
  promoBannerUrls: string[];
  uploadPromoBanner: (file: File) => Promise<unknown>;
  isUploadingPromoBanner: boolean;
  deletePromoBanner: (key: string) => Promise<unknown>;
  isDeletingPromoBanner: boolean;
}>) {
  const { t } = useTranslation("admin");
  const banners = promoBannerKeys.map((key, i) => ({ key, url: promoBannerUrls[i] ?? "" }));
  const emptySlots = MAX_PROMO_BANNERS - banners.length;

  async function handleUpload(file: File) {
    try {
      await uploadPromoBanner(file);
      toast.success(t("settings.promoBanner.uploadSuccess"));
    } catch {
      toast.error(t("settings.promoBanner.uploadError"));
    }
  }

  async function handleRemove(key: string) {
    try {
      await deletePromoBanner(key);
      toast.success(t("settings.promoBanner.removeSuccess"));
    } catch {
      toast.error(t("settings.promoBanner.removeError"));
    }
  }

  return (
    <div className='rounded-lg border border-border p-4 space-y-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='font-medium text-foreground'>
            {t("settings.promoBanner.title")}
          </p>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-md'>
            {t("settings.promoBanner.description")}
          </p>
        </div>
        <span className='shrink-0 rounded-full bg-(--surface-low) px-2.5 py-1 text-xs font-semibold text-primary'>
          {banners.length}/{MAX_PROMO_BANNERS}
        </span>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        {banners.map((banner, i) => (
          <PromoBannerSlot
            key={banner.key}
            slotNumber={i + 1}
            banner={banner}
            isUploadingPromoBanner={isUploadingPromoBanner}
            isDeletingPromoBanner={isDeletingPromoBanner}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <PromoBannerSlot
            key={`empty-${i}`}
            slotNumber={banners.length + i + 1}
            banner={null}
            isUploadingPromoBanner={isUploadingPromoBanner}
            isDeletingPromoBanner={isDeletingPromoBanner}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>{t("settings.promoBanner.hint")}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation("admin");
  const {
    settings,
    isLoading,
    save,
    isSaving,
    uploadPromoBanner,
    isUploadingPromoBanner,
    deletePromoBanner,
    isDeletingPromoBanner,
  } = useAdminSettings();

  return (
    <div className='max-w-3xl space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>
          {t("settings.title")}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {t("settings.subtitle")}
        </p>
      </div>

      {isLoading || !settings ? (
        <p className='text-sm text-muted-foreground'>{t("settings.loading")}</p>
      ) : (
        <>
          <SettingsTable
            key={`${settings.avgCleaningMinutes}-${settings.paymentExpiryMinutes}-${settings.whatsappNumber}-${String(settings.loyaltyEnabled)}-${settings.signupDiscountPercent}-${settings.loyaltyWashThreshold}-${settings.loyaltyRewardDiscountPercent}-${settings.washPrice}`}
            settings={settings}
            save={save}
            isSaving={isSaving}
          />
          <PromoBannerSection
            promoBannerKeys={settings.promoBannerKeys}
            promoBannerUrls={settings.promoBannerUrls}
            uploadPromoBanner={uploadPromoBanner}
            isUploadingPromoBanner={isUploadingPromoBanner}
            deletePromoBanner={deletePromoBanner}
            isDeletingPromoBanner={isDeletingPromoBanner}
          />
        </>
      )}
    </div>
  );
}
