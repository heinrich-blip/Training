import { CyclingMap } from "@/components/cycling/CyclingMap";
import { ElevationProfile } from "@/components/cycling/ElevationProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCyclingWorkout, type RoutePoint } from "@/hooks/useCyclingWorkout";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Download, MapPin, Pause, Play, Save, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Cycling = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [elevationData, setElevationData] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | undefined>();

  const { position, error } = useGeolocation({ tracking: isTracking });
  const { saveWorkout, saveRoute, saving } = useCyclingWorkout();
  const { toast } = useToast();

  // Update current position whenever GPS provides new data
  useEffect(() => {
    if (position) {
      setCurrentPosition([position.latitude, position.longitude]);
    }
  }, [position]);

  // Track last processed position to avoid duplicates
  const lastProcessedTimestampRef = useRef<number>(0);

  // Update position and route
  useEffect(() => {
    if (!position || !isTracking) return;
    
    // Skip if we've already processed this position update (same timestamp)
    if (position.timestamp <= lastProcessedTimestampRef.current) return;
    lastProcessedTimestampRef.current = position.timestamp;

    const newPoint: RoutePoint = { lat: position.latitude, lng: position.longitude };

    // Use functional updates to avoid stale closure issues
    setRoutePoints((prevPoints) => {
      // Calculate distance from previous point using prev state
      if (prevPoints.length > 0) {
        const lastPoint = prevPoints[prevPoints.length - 1];
        
        // Skip if the point is too close (within 1 meter) to avoid GPS jitter
        const R = 6371000; // Earth's radius in meters
        const dLat = ((newPoint.lat - lastPoint.lat) * Math.PI) / 180;
        const dLon = ((newPoint.lng - lastPoint.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lastPoint.lat * Math.PI) / 180) *
            Math.cos((newPoint.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceMeters = R * c;
        
        // Skip points that are too close (GPS jitter) - minimum 2 meters
        if (distanceMeters < 2) {
          return prevPoints;
        }
        
        // Update distance in km
        setDistance((prev) => prev + distanceMeters / 1000);
      }
      
      return [...prevPoints, newPoint];
    });

    if (position.altitude !== null) {
      setElevationData((prev) => [...prev, position.altitude!]);
    }

    // Update speed (convert m/s to km/h)
    if (position.speed !== null) {
      setSpeed(position.speed * 3.6);
    }
  }, [position, isTracking]);

  useEffect(() => {
    if (error) {
      toast({
        title: "GPS Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Update duration and calories
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
        setCalories((prev) => prev + 0.15); // ~9 cal/min for cycling
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveWorkout = async () => {
    await saveWorkout({
      duration,
      distance,
      speed,
      calories,
      routeData: routePoints,
      elevationData,
    });
  };

  const handleSaveRoute = async () => {
    const routeName = prompt("Enter route name:");
    if (!routeName) return;

    await saveRoute({
      name: routeName,
      distance,
      routeData: routePoints,
      elevationData,
      difficulty: "moderate",
    });
  };

  const avgSpeed = duration > 0 ? (distance / (duration / 3600)) : 0;

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
          <Link to="/">
            <Button variant="default" size="sm" className="bg-card hover:bg-card/80 text-foreground border-2 border-border hover:border-primary transition-all duration-300 shadow-sm h-10 px-3 sm:px-4">
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-energy-glow bg-clip-text text-transparent flex-1 text-center">
            <span className="hidden sm:inline">Cycling Tracker</span>
            <span className="sm:hidden">Cycling</span>
          </h1>
          <div className="w-10 sm:w-40" />
        </header>

        <div className="space-y-6">
          {/* Map Section */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-2 border-border/50 card-lift overflow-hidden">
            <div className="h-[400px] rounded-lg overflow-hidden">
              <CyclingMap
                currentPosition={currentPosition}
                routePoints={routePoints}
                enableTracking={isTracking}
              />
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="p-4 sm:p-8 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50 glow-effect-sm">
            <div className="text-center mb-4 sm:mb-8">
              <div className="text-5xl sm:text-7xl font-extrabold text-primary mb-1 sm:mb-2 drop-shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all duration-500">
                {speed.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-base sm:text-lg">km/h</div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold">{formatTime(duration)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold text-primary">{distance.toFixed(2)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">km</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold text-energy-glow">{calories.toFixed(0)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">kcal</div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => setIsTracking(!isTracking)}
                className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold active:scale-95 sm:hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                variant={isTracking ? "secondary" : "default"}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Pause Ride</span>
                    <span className="xs:hidden">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Start Ride</span>
                    <span className="xs:hidden">Start</span>
                  </>
                )}
              </Button>
              {routePoints.length > 0 && (
                <Button
                  onClick={handleSaveWorkout}
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 sm:h-16 sm:w-16 active:scale-95 sm:hover:scale-110 hover:bg-primary hover:text-white transition-all duration-300"
                  disabled={saving}
                >
                  <Save className="w-6 h-6" />
                </Button>
              )}
            </div>
          </Card>

          {/* Elevation Profile */}
          {elevationData.length > 0 && (
            <div className="animate-[slide-in-up_0.5s_ease-out]">
              <ElevationProfile elevationData={elevationData} distance={distance} />
            </div>
          )}

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-info/50 transition-all duration-300 card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Avg Speed</div>
                  <div className="text-lg sm:text-xl font-bold truncate">{avgSpeed.toFixed(1)} km/h</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Points</div>
                  <div className="text-lg sm:text-xl font-bold">{routePoints.length}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 card-lift active:scale-95 sm:col-span-2 md:col-span-1">
              <Button
                onClick={handleSaveRoute}
                variant="outline"
                className="w-full h-full min-h-[44px] hover:bg-primary hover:text-white transition-all duration-300 active:scale-95"
                disabled={routePoints.length === 0 || saving}
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Save Route</span>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cycling;