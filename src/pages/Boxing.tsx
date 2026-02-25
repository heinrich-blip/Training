import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Activity, Pause, Play, Settings2, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Punch detection configuration
interface PunchConfig {
  threshold: number;      // Acceleration threshold to register a punch (m/s²)
  cooldownMs: number;     // Minimum time between punches (prevents double counting)
  minDuration: number;    // Minimum duration of acceleration spike (ms)
}

const DEFAULT_CONFIG: PunchConfig = {
  threshold: 15,          // 15 m/s² - typical punch generates 20-50 m/s²
  cooldownMs: 150,        // 150ms between punches
  minDuration: 50,        // 50ms minimum spike duration
};

const Boxing = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [punches, setPunches] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hasMotionPermission, setHasMotionPermission] = useState<boolean | null>(null);
  const [currentAcceleration, setCurrentAcceleration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<PunchConfig>(DEFAULT_CONFIG);
  const [peakIntensity, setPeakIntensity] = useState(0);
  const [recentPunches, setRecentPunches] = useState<number[]>([]); // timestamps of recent punches

  // Refs for punch detection
  const lastPunchTimeRef = useRef<number>(0);
  const accelerationStartRef = useRef<number>(0);
  const isAboveThresholdRef = useRef<boolean>(false);
  const punchCountRef = useRef<number>(0);

  // Request motion permission (required on iOS 13+)
  const requestMotionPermission = async () => {
    // Check if DeviceMotionEvent exists and has requestPermission (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        setHasMotionPermission(permission === 'granted');
        return permission === 'granted';
      } catch (error) {
        console.error('Motion permission error:', error);
        setHasMotionPermission(false);
        return false;
      }
    } else {
      // Non-iOS devices or older iOS - motion events are available without permission
      setHasMotionPermission(true);
      return true;
    }
  };

  // Handle device motion for punch detection
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isTracking) return;

    const { accelerationIncludingGravity } = event;
    if (!accelerationIncludingGravity) return;

    const { x, y, z } = accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // Calculate total acceleration magnitude (removing gravity baseline of ~9.8)
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
    // Subtract gravity to get movement acceleration
    const movementAcceleration = Math.abs(totalAcceleration - 9.8);
    
    setCurrentAcceleration(movementAcceleration);

    // Update intensity based on recent acceleration (smoothed)
    const newIntensity = Math.min(100, (movementAcceleration / config.threshold) * 50);
    setIntensity(prev => prev * 0.8 + newIntensity * 0.2); // Smoothing

    // Punch detection logic
    const now = Date.now();
    
    if (movementAcceleration >= config.threshold) {
      if (!isAboveThresholdRef.current) {
        // Started a potential punch
        isAboveThresholdRef.current = true;
        accelerationStartRef.current = now;
      }
    } else {
      if (isAboveThresholdRef.current) {
        // Ended the acceleration spike
        const duration = now - accelerationStartRef.current;
        const timeSinceLastPunch = now - lastPunchTimeRef.current;

        // Check if this qualifies as a punch
        if (duration >= config.minDuration && timeSinceLastPunch >= config.cooldownMs) {
          // Register punch!
          punchCountRef.current += 1;
          setPunches(punchCountRef.current);
          lastPunchTimeRef.current = now;
          
          // Track for punches per minute calculation
          setRecentPunches(prev => [...prev.filter(t => now - t < 60000), now]);
          
          // Update peak intensity
          if (newIntensity > peakIntensity) {
            setPeakIntensity(newIntensity);
          }

          // Add calories (roughly 0.1-0.2 calories per punch)
          setCalories(prev => prev + 0.15);
        }
        
        isAboveThresholdRef.current = false;
      }
    }
  }, [isTracking, config, peakIntensity]);

  // Set up motion listener
  useEffect(() => {
    if (isTracking && hasMotionPermission) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [isTracking, hasMotionPermission, handleDeviceMotion]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        // Clean up old punch timestamps
        setRecentPunches(prev => prev.filter(t => Date.now() - t < 60000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Start/stop tracking
  const toggleTracking = async () => {
    if (!isTracking) {
      // Starting
      if (hasMotionPermission === null) {
        const granted = await requestMotionPermission();
        if (!granted) return;
      } else if (!hasMotionPermission) {
        return;
      }
      punchCountRef.current = punches;
      setIsTracking(true);
    } else {
      // Stopping
      setIsTracking(false);
    }
  };

  const resetSession = () => {
    setPunches(0);
    setDuration(0);
    setCalories(0);
    setIntensity(0);
    setPeakIntensity(0);
    setRecentPunches([]);
    punchCountRef.current = 0;
    lastPunchTimeRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Punches per minute based on recent punches
  const punchesPerMinute = recentPunches.length;
  const avgIntensity = duration > 0 ? Math.min(100, (punches / duration) * 10) : 0;

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
          <Link to="/">
            <Button variant="default" size="sm" className="bg-card hover:bg-card/80 text-foreground border-2 border-border hover:border-destructive transition-all duration-300 shadow-sm h-10 px-3 sm:px-4">
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent flex-1 text-center">
            <span className="hidden sm:inline">Boxing Tracker</span>
            <span className="sm:hidden">Boxing</span>
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="h-10 w-10"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="p-4 sm:p-6 mb-4 bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Punch Detection Settings
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm">Sensitivity Threshold</label>
                  <span className="text-sm font-mono">{config.threshold} m/s²</span>
                </div>
                <Slider
                  value={[config.threshold]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, threshold: value }))}
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower = more sensitive (may count false punches), Higher = less sensitive
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm">Cooldown Time</label>
                  <span className="text-sm font-mono">{config.cooldownMs}ms</span>
                </div>
                <Slider
                  value={[config.cooldownMs]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, cooldownMs: value }))}
                  min={50}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Prevents double-counting punches. Lower for faster combos.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfig(DEFAULT_CONFIG)}
              >
                Reset to Defaults
              </Button>
            </div>
          </Card>
        )}

        {/* Motion Permission Warning */}
        {hasMotionPermission === false && (
          <Card className="p-4 mb-4 bg-destructive/10 border-destructive/50">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-destructive" />
              <div>
                <p className="font-semibold">Motion Access Required</p>
                <p className="text-sm text-muted-foreground">
                  Please enable motion sensors in your device settings to detect punches.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="p-4 sm:p-8 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50 glow-effect-sm">
            <div className="text-center mb-4 sm:mb-8">
              <div className={`text-5xl sm:text-7xl font-extrabold text-destructive mb-1 sm:mb-2 transition-all duration-300 ${isTracking ? 'pulse-slow drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]' : ''}`}>
                {punches}
              </div>
              <div className="text-muted-foreground text-base sm:text-lg">Total Punches</div>
              
              {/* Live acceleration indicator */}
              {isTracking && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Current: {currentAcceleration.toFixed(1)} m/s² 
                  {currentAcceleration >= config.threshold && (
                    <span className="text-destructive ml-2 font-bold animate-pulse">PUNCH!</span>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Intensity</span>
                <span className="text-xs sm:text-sm font-bold">{intensity.toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-background/50 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-destructive to-primary transition-all duration-200 relative"
                  style={{ width: `${Math.min(100, intensity)}%` }}
                >
                  {isTracking && intensity > 70 && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold">{formatTime(duration)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold text-destructive">{punchesPerMinute}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">P/min</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-background/50 rounded-xl backdrop-blur-sm hover:bg-background/70 transition-all duration-300 card-lift">
                <div className="text-lg sm:text-2xl font-bold text-energy-glow">{calories.toFixed(0)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">kcal</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleTracking}
                className="flex-1 h-14 sm:h-16 text-base sm:text-lg font-bold active:scale-95 sm:hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                variant={isTracking ? "secondary" : "default"}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Pause Session</span>
                    <span className="xs:hidden">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Start Session</span>
                    <span className="xs:hidden">Start</span>
                  </>
                )}
              </Button>
              {!isTracking && duration > 0 && (
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="h-14 sm:h-16 px-4"
                >
                  Reset
                </Button>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-destructive/50 transition-all duration-300 card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Peak Intensity</div>
                  <div className="text-xl font-bold">{peakIntensity.toFixed(0)}%</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Avg Intensity</div>
                  <div className="text-xl font-bold">{avgIntensity.toFixed(0)}%</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-info/50 transition-all duration-300 card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-info" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Sensor</div>
                  <div className="text-xl font-bold">
                    {hasMotionPermission === null ? 'Ready' : hasMotionPermission ? 'Active' : 'Denied'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border border-border/50">
            <h3 className="font-bold mb-2">How to Use</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Hold your phone in your punching hand or strap it to your wrist</li>
              <li>• Press Start and throw punches - the accelerometer detects motion</li>
              <li>• Adjust sensitivity in settings if needed (tap ⚙️)</li>
              <li>• Lower threshold = more sensitive, higher = less false positives</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Boxing;