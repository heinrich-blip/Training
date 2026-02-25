import { useState, useEffect, useRef } from "react";

interface GeolocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface UseGeolocationOptions {
  tracking?: boolean;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = ({
  tracking = false,
  highAccuracy = true,
  timeout = 10000,
  maximumAge = 5000,
}: UseGeolocationOptions = {}) => {
  const [position, setPosition] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState<boolean>(() => "geolocation" in navigator);

  // Keep track of watch ID for cleanup
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Early return if not supported (before any state updates)
    if (!isSupported) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Stop tracking if disabled
    if (!tracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Success handler
    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: pos.timestamp,
      });
      setError(null);
    };

    // Error handler
    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve location";
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Please enable location access.";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable.";
          break;
        case err.TIMEOUT:
          errorMessage = "Location request timed out.";
          break;
      }
      
      setError(errorMessage);
      console.error("[useGeolocation] Error:", err.message);
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge,
        }
      );
    } catch (err) {
      console.error("[useGeolocation] Unexpected error", err);
      setError("Failed to initialize geolocation tracking");
    }

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [tracking, highAccuracy, timeout, maximumAge, isSupported]);

  return {
    position,
    error,
    isSupported,
    isTracking: tracking && isSupported,
  };
};