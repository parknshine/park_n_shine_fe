"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
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

export default function SettingsPage() {
  const { t } = useTranslation("admin");
  const { settings, isLoading, save, isSaving } = useAdminSettings();

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
        <SettingsTable
          key={`${settings.avgCleaningMinutes}-${settings.paymentExpiryMinutes}-${settings.whatsappNumber}-${String(settings.loyaltyEnabled)}-${settings.signupDiscountPercent}-${settings.loyaltyWashThreshold}-${settings.loyaltyRewardDiscountPercent}-${settings.washPrice}`}
          settings={settings}
          save={save}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
