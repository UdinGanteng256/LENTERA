'use client';

import { useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lon: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [city, setCity] = useState<string>('Mencari lokasi...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation tidak didukung oleh browser ini');
      setLoading(false);
      return;
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    const handlePosition = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      setLocation({ lat: latitude, lon: longitude, accuracy, heading, speed });

      // Reverse Geocoding (simple mock for vibe, in real app use API)
      setCity('Jakarta Selatan, ID');
      setError(null);
      setLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Izin lokasi ditolak oleh pengguna');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Informasi lokasi tidak tersedia');
          break;
        case err.TIMEOUT:
          setError('Permintaan lokasi timeout');
          break;
        default:
          setError('Terjadi kesalahan pada lokasi');
      }
      setLoading(false);
    };

    let watchId: number | undefined;

    if (watch) {
      watchId = navigator.geolocation.watchPosition(handlePosition, handleError, geoOptions);
    } else {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, geoOptions);
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watch]);

  return { location, city, error, loading };
};
