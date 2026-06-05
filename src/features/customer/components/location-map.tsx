"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Fix Leaflet's broken default marker icons in bundled environments
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationMapProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
}

/** Smoothly flies to new coordinates when lat/lng props change */
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14));
  }, [lat, lng, map]);
  return null;
}

/** Allows tapping on the map to move the marker */
function TapHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationMap({ lat, lng, onPositionChange }: LocationMapProps) {
  return (
    <div className="h-[300px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={{
            dragend(e) {
              const marker = e.target as L.Marker;
              const pos = marker.getLatLng();
              onPositionChange(pos.lat, pos.lng);
            },
          }}
        />
        <RecenterMap lat={lat} lng={lng} />
        <TapHandler onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  );
}
