"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { Heart } from "lucide-react";
import { useTheme } from "next-themes";
import { useT } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

const TILE = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
} as const;

function createPlaceIcon(selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="place-pin${selected ? " place-pin--selected" : ""}" aria-hidden="true"></div>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: '<div class="user-pin" aria-hidden="true"><span class="user-pin__pulse"></span></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ThemeTileLayer() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const tile = dark ? TILE.dark : TILE.light;

  return (
    <TileLayer
      key={dark ? "dark" : "light"}
      attribution={tile.attribution}
      url={tile.url}
    />
  );
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function FlyToSelected({ place }: { place: Place | undefined }) {
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
  isFavorite: (placeId: string) => boolean;
  onToggleFavorite: (place: Place) => void;
}

function PlacePopup({
  place,
  isFavorite,
  onToggleFavorite,
}: {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: (place: Place) => void;
}) {
  const t = useT();

  return (
    <div className="place-popup-content min-w-[180px]">
      <p className="font-semibold leading-tight">
        {place.name ?? t("place.unnamed")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {place.cuisine ?? t("place.noCuisine")} · {place.distanceKm.toFixed(2)} km
      </p>
      {place.address && (
        <p className="mt-1 text-xs text-muted-foreground">{place.address}</p>
      )}
      <Button
        type="button"
        variant={isFavorite ? "secondary" : "outline"}
        size="sm"
        className="mt-2 h-8 w-full gap-1.5 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(place);
        }}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5",
            isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground",
          )}
        />
        {isFavorite ? t("place.removeFavorite") : t("place.addFavorite")}
      </Button>
    </div>
  );
}

export default function PlaceMap({
  lat,
  lng,
  places,
  selectedPlaceId,
  isFavorite,
  onToggleFavorite,
}: PlaceMapProps) {
  const t = useT();
  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId),
    [places, selectedPlaceId],
  );

  const placeIcons = useMemo(() => {
    const icons = new Map<string, L.DivIcon>();
    for (const p of places) {
      icons.set(p.id, createPlaceIcon(p.id === selectedPlaceId));
    }
    return icons;
  }, [places, selectedPlaceId]);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom
      className="place-map h-full w-full"
    >
      <ThemeTileLayer />
      <Recenter lat={lat} lng={lng} />
      <FlyToSelected place={selectedPlace} />
      <Marker position={[lat, lng]} icon={userIcon} zIndexOffset={1000}>
        <Popup className="place-popup">
          <span className="font-medium">{t("map.here")}</span>
        </Popup>
      </Marker>
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={placeIcons.get(p.id) ?? createPlaceIcon(false)}
          zIndexOffset={p.id === selectedPlaceId ? 500 : 0}
        >
          <Popup className="place-popup">
            <PlacePopup
              place={p}
              isFavorite={isFavorite(p.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
