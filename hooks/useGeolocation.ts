"use client";

import { useCallback, useEffect, useState } from "react";

export interface GeoState {
  lat: number | null;
  lng: number | null;
  status: "idle" | "loading" | "granted" | "denied" | "unavailable" | "error";
  error: string | null;
}

const ESKISEHIR_FALLBACK = { lat: 39.7767, lng: 30.5206 };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    status: "idle",
    error: null,
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        ...ESKISEHIR_FALLBACK,
        status: "unavailable",
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          status: "granted",
          error: null,
        });
      },
      (err) => {
        setState({
          ...ESKISEHIR_FALLBACK,
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, request, fallback: ESKISEHIR_FALLBACK };
}
