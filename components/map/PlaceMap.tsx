"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { useT } from "@/components/providers/I18nProvider";
import type { Place } from "@/lib/types";

// Fix default marker icons (Leaflet expects assets at a relative path).
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px #2563eb"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function FlyToSelected({
  place,
}: {
  place: Place | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    if (place) {
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 16), {
        duration: 0.5,
      });
    }
  }, [place, map]);
  return null;
}

interface PlaceMapProps {
  lat: number;
  lng: number;
  places: Place[];
  selectedPlaceId?: string | null;
}

export default function PlaceMap({
  lat,
  lng,
  places,
  selectedPlaceId,
}: PlaceMapProps) {
  const t = useT();
  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId),
    [places, selectedPlaceId],
  );
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={lat} lng={lng} />
      <FlyToSelected place={selectedPlace} />
      <Marker position={[lat, lng]} icon={userIcon}>
        <Popup>{t("map.here")}</Popup>
      </Marker>
      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
          <Popup>
            <strong>{p.name ?? t("place.unnamed")}</strong>
            <br />
            {p.cuisine ?? t("place.noCuisine")}
            <br />
            <span className="text-xs">{p.address ?? t("place.noAddress")}</span>
            <br />
            <span className="text-xs">{p.distanceKm.toFixed(2)} km</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
