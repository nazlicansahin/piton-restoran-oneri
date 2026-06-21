"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
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

interface PlaceMapProps {
  lat: number;
  lng: number;
  places: Place[];
}

export default function PlaceMap({ lat, lng, places }: PlaceMapProps) {
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
      <Marker position={[lat, lng]} icon={userIcon}>
        <Popup>Buradasın</Popup>
      </Marker>
      {places.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
          <Popup>
            <strong>{p.name ?? "İsimsiz mekan"}</strong>
            <br />
            {p.cuisine ?? "Mutfak belirtilmemiş"}
            <br />
            <span className="text-xs">{p.address ?? "Adres yok"}</span>
            <br />
            <span className="text-xs">{p.distanceKm.toFixed(2)} km</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
