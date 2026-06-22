"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
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

const searchCenterIcon = L.divIcon({
  className: "",
  html: '<div class="search-pin" aria-hidden="true"><span class="search-pin__pulse"></span></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
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

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const timer = window.setTimeout(fix, 150);
    window.addEventListener("resize", fix);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

function SearchCenterFlyTo({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();
  const prev = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (
      prev.current &&
      Math.abs(prev.current.lat - lat) < 0.00001 &&
      Math.abs(prev.current.lng - lng) < 0.00001
    ) {
      return;
    }
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.45 });
    prev.current = { lat, lng };
  }, [lat, lng, map]);

  return null;
}

function MapClickSelect({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
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

function coordsDiffer(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): boolean {
  return Math.abs(a.lat - b.lat) > 0.00015 || Math.abs(a.lng - b.lng) > 0.00015;
}

interface PlaceMapProps {
  searchCenter: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  onSearchCenterChange: (lat: number, lng: number) => void;
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
  searchCenter,
  userLocation,
  onSearchCenterChange,
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

  const showUserMarker =
    userLocation != null && coordsDiffer(userLocation, searchCenter);

  const placeIcons = useMemo(() => {
    const icons = new Map<string, L.DivIcon>();
    for (const p of places) {
      icons.set(p.id, createPlaceIcon(p.id === selectedPlaceId));
    }
    return icons;
  }, [places, selectedPlaceId]);

  return (
    <MapContainer
      center={[searchCenter.lat, searchCenter.lng]}
      zoom={15}
      scrollWheelZoom
      className="place-map h-full w-full cursor-crosshair"
    >
      <ThemeTileLayer />
      <MapResizeFix />
      <MapClickSelect onSelect={onSearchCenterChange} />
      <SearchCenterFlyTo lat={searchCenter.lat} lng={searchCenter.lng} />
      <FlyToSelected place={selectedPlace} />

      <Marker
        position={[searchCenter.lat, searchCenter.lng]}
        icon={searchCenterIcon}
        zIndexOffset={900}
      >
        <Popup className="place-popup">
          <span className="font-medium">{t("map.searchCenter")}</span>
        </Popup>
      </Marker>

      {showUserMarker && userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
          zIndexOffset={800}
        >
          <Popup className="place-popup">
            <span className="font-medium">{t("map.here")}</span>
          </Popup>
        </Marker>
      )}

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
