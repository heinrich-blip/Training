import type { RoutePoint } from "@/hooks/useCyclingWorkout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";

// Fix for default marker icons in build environments
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface CyclingMapProps {
  currentPosition?: [number, number];
  routePoints?: RoutePoint[];
  onRouteUpdate?: (points: RoutePoint[]) => void;
  showControls?: boolean;
  height?: string;
  enableTracking?: boolean;
}

export const CyclingMap = ({
  currentPosition,
  routePoints = [],
  onRouteUpdate,
  showControls = true,
  height = "h-full",
  enableTracking = false,
}: CyclingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  
  // Store initial position to prevent map reinitialization on position updates
  const initialPositionRef = useRef<[number, number] | undefined>(currentPosition);
  // Track if we've set initial position to prevent stale data
  const hasInitialPositionRef = useRef(false);
  
  // Update initial position ref only once when first valid position arrives
  if (currentPosition && !hasInitialPositionRef.current) {
    initialPositionRef.current = currentPosition;
    hasInitialPositionRef.current = true;
  }

  // Store onRouteUpdate in a ref to avoid dependency issues
  const onRouteUpdateRef = useRef(onRouteUpdate);
  useEffect(() => {
    onRouteUpdateRef.current = onRouteUpdate;
  }, [onRouteUpdate]);

  // Calculate total distance of route
  const calculateDistance = useCallback((points: RoutePoint[]) => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const from = L.latLng(points[i].lat, points[i].lng);
      const to = L.latLng(points[i + 1].lat, points[i + 1].lng);
      totalDistance += from.distanceTo(to);
    }
    return totalDistance / 1000; // Convert to kilometers
  }, []);

  // Initialize map - only runs once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Default center: Pretoria, South Africa - use initial position ref to avoid reinit
    const defaultCenter: [number, number] = initialPositionRef.current || [-25.7479, 28.2293];
    const map = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: showControls,
      attributionControl: true,
    });

    mapRef.current = map;

    // Add tile layer
    const tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 3,
        className: 'map-tiles',
      }
    );

    tileLayer.addTo(map);

    // Add scale control
    if (showControls) {
      L.control.scale({ 
        metric: true, 
        imperial: false,
        position: 'bottomleft'
      }).addTo(map);
    }

    // Map ready event
    map.whenReady(() => {
      setIsMapReady(true);
      map.invalidateSize();
    });

    // Click handler for route creation
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (onRouteUpdateRef.current) {
        const newPoint: RoutePoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        // Get current route points from the latest ref
        const currentRoutePoints = routeLayerRef.current 
          ? routeLayerRef.current.getLatLngs().map((ll) => {
              const latLng = ll as L.LatLng;
              return { lat: latLng.lat, lng: latLng.lng } as RoutePoint;
            })
          : [];
        onRouteUpdateRef.current([...currentRoutePoints, newPoint]);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
    // Only depend on showControls - position updates are handled separately
  }, [showControls]);

  // Update current position marker with animated pulse
  useEffect(() => {
    if (!mapRef.current || !currentPosition || !isMapReady) return;

    const customIcon = L.divIcon({
      className: "custom-marker-container",
      html: `
        <div class="relative">
          <div class="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping"></div>
          <div class="relative w-6 h-6 bg-primary rounded-full border-4 border-white shadow-2xl ring-2 ring-primary/50"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(currentPosition);
    } else {
      markerRef.current = L.marker(currentPosition, { 
        icon: customIcon,
        zIndexOffset: 1000 
      })
        .bindPopup("Your Location")
        .addTo(mapRef.current);
    }

    // Auto-center if tracking is enabled
    if (enableTracking) {
      mapRef.current.setView(currentPosition, mapRef.current.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [currentPosition, isMapReady, enableTracking]);

  // Update route polyline with gradient and markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // Remove old route layer
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // Remove old start/end markers
    if (startMarkerRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
    }
    if (endMarkerRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
    }

    if (routePoints.length > 0) {
      // Create animated route line - convert RoutePoint objects to Leaflet format
      const latLngs: [number, number][] = routePoints.map(p => [p.lat, p.lng]);
      routeLayerRef.current = L.polyline(latLngs, {
        color: "hsl(14, 100%, 57%)",
        weight: 5,
        opacity: 0.9,
        lineJoin: "round",
        lineCap: "round",
        className: "route-line",
      }).addTo(mapRef.current);

      // Add start marker (green flag)
      const startIcon = L.divIcon({
        className: "start-marker",
        html: `
          <div class="relative">
            <div class="w-8 h-8 bg-success rounded-full border-3 border-white shadow-xl flex items-center justify-center">
              <span class="text-white font-bold text-xs">S</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      startMarkerRef.current = L.marker([routePoints[0].lat, routePoints[0].lng], { 
        icon: startIcon,
        zIndexOffset: 500 
      })
        .bindPopup("Start")
        .addTo(mapRef.current);

      // Add end marker (red flag) if route has multiple points
      if (routePoints.length > 1) {
        const endIcon = L.divIcon({
          className: "end-marker",
          html: `
            <div class="relative">
              <div class="w-8 h-8 bg-destructive rounded-full border-3 border-white shadow-xl flex items-center justify-center">
                <span class="text-white font-bold text-xs">E</span>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        endMarkerRef.current = L.marker([routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng], { 
          icon: endIcon,
          zIndexOffset: 500 
        })
          .bindPopup("End")
          .addTo(mapRef.current);

        // Fit bounds to show entire route (only if not tracking)
        if (!enableTracking) {
          mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
            padding: [80, 80],
            maxZoom: 16,
            animate: true,
          });
        }
      }

      // Calculate and update distance
      const totalDistance = calculateDistance(routePoints);
      setDistance(totalDistance);
    } else {
      setDistance(0);
    }
  }, [routePoints, isMapReady, calculateDistance, enableTracking]);

  // Recenter to current position
  const recenterMap = useCallback(() => {
    if (mapRef.current && currentPosition) {
      mapRef.current.setView(currentPosition, 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [currentPosition]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (onRouteUpdateRef.current) {
      onRouteUpdateRef.current([]);
    }
  }, []);

  return (
    <div className={`relative w-full ${height}`}>
      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-border/50 shadow-lg">
        <div ref={mapContainer} className="absolute inset-0 bg-muted/20" />
        
        {/* Loading overlay */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground font-medium">Loading map...</p>
            </div>
          </div>
        )}

        {/* Distance badge */}
        {distance > 0 && (
          <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-primary/20 shadow-xl">
            <div className="text-xs text-muted-foreground mb-0.5">Total Distance</div>
            <div className="text-2xl font-bold text-primary">
              {distance.toFixed(2)} <span className="text-sm text-muted-foreground">km</span>
            </div>
          </div>
        )}

        {/* Control buttons */}
        {showControls && isMapReady && (
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {currentPosition && (
              <button
                onClick={recenterMap}
                className="bg-card/95 backdrop-blur-sm hover:bg-primary hover:text-white p-3 rounded-lg border-2 border-border hover:border-primary shadow-lg transition-all duration-300 group"
                title="Recenter to current position"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}

            {routePoints.length > 0 && (
              <button
                onClick={clearRoute}
                className="bg-card/95 backdrop-blur-sm hover:bg-destructive hover:text-white p-3 rounded-lg border-2 border-border hover:border-destructive shadow-lg transition-all duration-300"
                title="Clear route"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Instructions overlay for route creation */}
        {onRouteUpdate && routePoints.length === 0 && isMapReady && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/20 shadow-xl">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Click on the map to create a route
            </p>
          </div>
        )}
      </div>

      {/* Custom styles for animations */}
      <style>{`
        .route-line {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .custom-marker-container,
        .start-marker,
        .end-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 2px solid hsl(var(--border));
          border-radius: 0.75rem;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
        }

        .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 2px solid hsl(var(--border));
          border-top: none;
          border-right: none;
        }

        .map-tiles {
          filter: brightness(0.95) contrast(1.05);
          transition: filter 0.3s ease-in-out;
        }

        .dark .map-tiles {
          filter: brightness(0.7) contrast(1.1) saturate(0.8);
        }
      `}</style>
    </div>
  );
};