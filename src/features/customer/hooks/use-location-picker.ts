"use client";

import { useRef, useState } from "react";

interface LocationPickerState {
  lat: number | null;
  lng: number | null;
  locationName: string;
  isLocating: boolean;
  isGeocoding: boolean;
  error: string | null;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const GEOCODE_DEBOUNCE_MS = 600;

async function fetchLocationName(lat: number, lng: number): Promise<string> {
  const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json`;
  const response = await fetch(url, {
    headers: { "User-Agent": "ParkNShine/1.0 (info@parknshine.id)" },
  });
  if (!response.ok) throw new Error("geocode_failed");
  const data = (await response.json()) as { display_name?: string };
  return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function useLocationPicker() {
  const [state, setState] = useState<LocationPickerState>({
    lat: null,
    lng: null,
    locationName: "",
    isLocating: false,
    isGeocoding: false,
    error: null,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function reverseGeocode(lat: number, lng: number) {
    setState((s) => ({ ...s, isGeocoding: true }));
    try {
      const name = await fetchLocationName(lat, lng);
      setState((s) => ({ ...s, locationName: name, isGeocoding: false }));
    } catch {
      setState((s) => ({
        ...s,
        locationName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        isGeocoding: false,
      }));
    }
  }

  function setPosition(lat: number, lng: number) {
    setState((s) => ({ ...s, lat, lng }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void reverseGeocode(lat, lng);
    }, GEOCODE_DEBOUNCE_MS);
  }

  async function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: "geolocation_not_supported",
      }));
      return;
    }

    setState((s) => ({ ...s, isLocating: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10_000,
          })
      );
      const { latitude: lat, longitude: lng } = position.coords;
      setState((s) => ({ ...s, lat, lng, isLocating: false }));
      await reverseGeocode(lat, lng);
    } catch {
      setState((s) => ({
        ...s,
        isLocating: false,
        error: "geolocation_denied",
      }));
    }
  }

  return {
    lat: state.lat,
    lng: state.lng,
    locationName: state.locationName,
    isLocating: state.isLocating,
    isGeocoding: state.isGeocoding,
    error: state.error,
    hasLocation: state.lat !== null && state.lng !== null,
    requestCurrentLocation,
    setPosition,
  };
}
