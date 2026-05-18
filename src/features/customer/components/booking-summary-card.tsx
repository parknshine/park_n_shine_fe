import { Banknote, Car, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingSummaryCardProps {
  plate: string;
  slot: string;
  siteName?: string | null;
  priceAmount?: number;
  currency?: "IDR";
  estimatedReadyAt?: string | null;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatLocalTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function BookingSummaryCard({
  plate,
  slot,
  siteName,
  priceAmount,
  currency,
  estimatedReadyAt,
}: BookingSummaryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center gap-3">
          <Car className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Plat Nomor</p>
            <p className="font-mono text-lg font-bold uppercase tracking-widest text-foreground">
              {plate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Slot Parkir</p>
            <p className="font-semibold text-foreground">{slot}</p>
          </div>
        </div>

        {siteName && (
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Lokasi</p>
              <p className="font-semibold text-foreground">{siteName}</p>
            </div>
          </div>
        )}

        {priceAmount !== undefined && (
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Harga</p>
              <p className="font-semibold text-foreground">
                {currency === "IDR" ? formatIDR(priceAmount) : String(priceAmount)}
              </p>
            </div>
          </div>
        )}

        {estimatedReadyAt && (
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Estimasi Selesai</p>
              <p className="font-semibold text-foreground">
                {formatLocalTime(estimatedReadyAt)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
