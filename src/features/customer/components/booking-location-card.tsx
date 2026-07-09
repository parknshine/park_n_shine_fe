"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";

interface BookingLocationCardProps {
  locationName: string;
  locationAddress?: string;
  phone?: string;
}

// ponytail: hides phone numbers left as just a country code (e.g. "62", "0")
function isDialingCodeOnly(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits === "" || digits === "0" || digits === "62";
}

export function BookingLocationCard({
  locationName,
  locationAddress,
  phone,
}: BookingLocationCardProps) {
  const { t } = useTranslation("customer");
  const showPhone = phone && !isDialingCodeOnly(phone);

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{t("booking.location.title")}</p>
            <p className="text-sm font-semibold text-foreground">
              {locationName}
            </p>
            {locationAddress && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {locationAddress}
              </p>
            )}
          </div>
        </div>

        {showPhone && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t("booking.capture.phoneLabel")}</p>
              <p className="font-semibold text-foreground">{phone}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
