

"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const LocationMap = dynamic(
  () =>
    import("@/features/customer/components/location-map").then(
      (m) => m.LocationMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-75 w-full animate-pulse rounded-xl bg-muted" />
    ),
  }
);

interface NominatimResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationPickResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerModalProps {
  onClose: () => void;
  onConfirm: (result: LocationPickResult) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
}

const DEFAULT_LAT = -6.2;
const DEFAULT_LNG = 106.8;
const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";
const DEBOUNCE_MS = 400;
const REVERSE_DEBOUNCE_MS = 600;

export function LocationPickerModal({
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddress,
}: LocationPickerModalProps) {
  const [query, setQuery] = useState(initialAddress ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<NominatimResult | null>(
    null
  );
  const [markerLat, setMarkerLat] = useState<number>(initialLat ?? DEFAULT_LAT);
  const [markerLng, setMarkerLng] = useState<number>(initialLng ?? DEFAULT_LNG);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reverseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseAbortRef = useRef<AbortController | null>(null);
  // skip initial search if we already have coordinates (map opens at saved location)
  const skipNextSearchRef = useRef(initialLat != null && initialLng != null);

  async function search(q: string, signal: AbortSignal) {
    setIsSearching(true);
    setSearchError(null);
    try {
      const url = `${NOMINATIM_SEARCH}?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "ParkNShine/1.0 (info@parknshine.id)" },
        signal,
      });
      if (!res.ok) throw new Error("search_failed");
      const data = (await res.json()) as NominatimResult[];
      setResults(data);
      if (data.length === 0) setSearchError("no_results");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setSearchError("search_failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (skipNextSearchRef.current) {
        skipNextSearchRef.current = false;
        return;
      }
      if (query.length < 3) {
        setResults([]);
        setSearchError(null);
        setIsSearching(false);
      } else {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        void search(query, abortRef.current.signal);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  async function reverseGeocode(lat: number, lng: number) {
    setIsSearching(true);
    reverseAbortRef.current?.abort();
    reverseAbortRef.current = new AbortController();
    try {
      const url = `${NOMINATIM_REVERSE}?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "ParkNShine/1.0 (info@parknshine.id)" },
        signal: reverseAbortRef.current.signal,
      });
      if (!res.ok) throw new Error("reverse_failed");
      const data = (await res.json()) as {
        place_id: number;
        display_name: string;
      };
      const result: NominatimResult = {
        place_id: String(data.place_id),
        display_name: data.display_name,
        lat: String(lat),
        lon: String(lng),
      };
      skipNextSearchRef.current = true;
      setSelectedResult(result);
      setQuery(data.display_name);
      setResults([]);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectResult(result: NominatimResult) {
    setSelectedResult(result);
    setMarkerLat(parseFloat(result.lat));
    setMarkerLng(parseFloat(result.lon));
    setResults([]);
    skipNextSearchRef.current = true;
    setQuery(result.display_name);
  }

  function handleConfirm() {
    const displayName =
      selectedResult?.display_name ??
      `${markerLat.toFixed(5)}, ${markerLng.toFixed(5)}`;
    onConfirm({
      name: displayName.split(",")[0].trim(),
      address: displayName,
      lat: markerLat,
      lng: markerLng,
    });
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex flex-col gap-4 p-6">
        <DialogTitle>Pick location from map</DialogTitle>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mall or address…"
              className="pl-9 pr-9"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {results.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md">
              {results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => handleSelectResult(r)}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && searchError === "no_results" && query.length >= 3 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              No results found. Try a different search.
            </p>
          )}
          {!isSearching && searchError === "search_failed" && (
            <p className="mt-1.5 text-xs text-destructive">
              Search failed. Please try again.
            </p>
          )}
        </div>

        <div className="relative z-0">
          <LocationMap
            lat={markerLat}
            lng={markerLng}
            onPositionChange={(lat, lng) => {
              setMarkerLat(lat);
              setMarkerLng(lng);
              if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
              reverseDebounceRef.current = setTimeout(() => {
                void reverseGeocode(lat, lng);
              }, REVERSE_DEBOUNCE_MS);
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            className="flex-1"
          >
            Use this location
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
