import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Mountain } from "lucide-react";

interface ElevationProfileProps {
  elevationData: number[];
  distance: number;
}

export const ElevationProfile = ({
  elevationData,
  distance,
}: ElevationProfileProps) => {
  const maxElevation = Math.max(...elevationData, 0);
  const minElevation = Math.min(...elevationData, 0);
  const totalGain = elevationData.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    const diff = curr - elevationData[i - 1];
    return diff > 0 ? acc + diff : acc;
  }, 0);
  const totalLoss = elevationData.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    const diff = curr - elevationData[i - 1];
    return diff < 0 ? acc + Math.abs(diff) : acc;
  }, 0);

  return (
    <Card className="p-6 bg-card/50 border border-border/50">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Mountain className="w-5 h-5 text-primary" />
        Elevation Profile
      </h3>

      <div className="relative h-32 mb-6 bg-background/50 rounded-lg overflow-hidden">
        <svg
          viewBox={`0 0 ${elevationData.length || 100} ${maxElevation - minElevation + 20 || 100}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(14, 100%, 57%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(14, 100%, 57%)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {elevationData.length > 0 && (
            <>
              <polyline
                points={elevationData
                  .map(
                    (elev, i) =>
                      `${i},${maxElevation - elev + minElevation + 10}`
                  )
                  .join(" ")}
                fill="url(#elevationGradient)"
                stroke="hsl(14, 100%, 57%)"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-lg font-bold">{totalGain.toFixed(0)}m</span>
          </div>
          <div className="text-xs text-muted-foreground">Gain</div>
        </div>
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-lg font-bold">{totalLoss.toFixed(0)}m</span>
          </div>
          <div className="text-xs text-muted-foreground">Loss</div>
        </div>
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Mountain className="w-4 h-4 text-info" />
            <span className="text-lg font-bold">{maxElevation.toFixed(0)}m</span>
          </div>
          <div className="text-xs text-muted-foreground">Max</div>
        </div>
      </div>
    </Card>
  );
};