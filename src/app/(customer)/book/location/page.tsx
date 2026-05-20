"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { AppShell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useLocationPicker } from "@/features/customer/hooks/use-location-picker";

// Leaflet requires browser APIs — must be imported without SSR
const LocationMap = dynamic(
  () =>
    import("@/features/customer/components/location-map").then(
      (m) => m.LocationMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" />
    ),
  }
);

// Default center: Sudirman, Jakarta — shown before geolocation resolves
const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

export default function WalkInLocationPage() {
  const router = useRouter();

  const {
    lat,
    lng,
    locationName,
    isLocating,
    isGeocoding,
    error,
    hasLocation,
    requestCurrentLocation,
    setPosition,
  } = useLocationPicker();

  const hasRequestedRef = useRef(false);

  // Request geolocation once on mount
  useEffect(() => {
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      void requestCurrentLocation();
    }
  }, [requestCurrentLocation]);

  const handleNext = useCallback(() => {
    if (lat === null || lng === null) return;
    const params = new URLSearchParams({
      lat: lat.toFixed(7),
      lng: lng.toFixed(7),
      loc: locationName,
    });
    router.push(`/book/capture?${params.toString()}`);
  }, [lat, lng, locationName, router]);

  const displayLat = lat ?? DEFAULT_LAT;
  const displayLng = lng ?? DEFAULT_LNG;

  return (
    <AppShell surface="customer">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Langkah 1 dari 3
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            Lokasi Kendaraan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tandai posisi kendaraanmu di peta. Geser penanda untuk menyesuaikan.
          </p>
        </div>

        <LocationMap
          lat={displayLat}
          lng={displayLng}
          onPositionChange={setPosition}
        />

        <Button
          variant="outline"
          className="w-full"
          disabled={isLocating}
          onClick={() => void requestCurrentLocation()}
        >
          {isLocating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mencari lokasi...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Gunakan Lokasi Saat Ini
            </>
          )}
        </Button>

        {isGeocoding && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mencari alamat...</span>
          </div>
        )}

        {hasLocation && !isGeocoding && locationName && (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">{locationName}</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {error === "geolocation_not_supported"
              ? "Browser tidak mendukung geolokasi."
              : error === "geolocation_denied"
                ? "Tidak dapat mengambil lokasi. Izinkan akses lokasi dan coba lagi."
                : error}
          </p>
        )}

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!hasLocation}
          onClick={handleNext}
        >
          Gunakan Lokasi Ini
        </Button>
      </div>
    </AppShell>
  );
}
