import { MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingLocationCardProps {
  locationName: string;
  phone: string;
}

export function BookingLocationCard({
  locationName,
  phone,
}: BookingLocationCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Lokasi Kendaraan</p>
            <p className="line-clamp-3 text-sm font-semibold text-foreground">
              {locationName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Nomor HP</p>
            <p className="font-semibold text-foreground">{phone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
