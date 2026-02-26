
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Flame, Target, TrendingUp, Trophy, LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
}

const StatCard = ({ icon: Icon, label, value, unit }: StatCardProps) => (
  <Card className="p-4 sm:p-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-border/50 card-lift hover:border-primary/30 transition-all duration-300">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-[0_0_8px_rgba(255,87,34,0.4)]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold">
          {value}
          <span className="text-xs sm:text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>
    </div>
  </Card>
);

const Analytics = () => {
  const { loading, getPersonalRecords, getWeeklyData, getMonthlyData } = useWorkoutHistory();

  const records = getPersonalRecords();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary via-energy-glow to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">
              Analytics
            </span>
          </h1>
        </header>

        {/* Personal Records */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Personal Records
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Target}
              label="Total Workouts"
              value={records?.totalWorkouts || 0}
              unit=""
            />
            <StatCard
              icon={TrendingUp}
              label="Total Distance"
              value={Number((records?.totalDistance || 0).toFixed(1))}
              unit="km"
            />
            <StatCard
              icon={Flame}
              label="Total Calories"
              value={Number((records?.totalCalories || 0).toFixed(0))}
              unit="kcal"
            />
            <StatCard
              icon={Trophy}
              label="Longest Ride"
              value={Number((records?.longestDistance || 0).toFixed(1))}
              unit="km"
            />
          </div>
        </div>

        {/* Charts */}
        <Card className="p-4 sm:p-6 bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 sm:mb-8 bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="weekly" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-6">
              <div>
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Workouts This Week</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Calories Burned</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <div>
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Workouts This Month</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Distance Covered</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="distance"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;