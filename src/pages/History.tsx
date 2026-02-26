import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { Bike, Box, Calendar as CalendarIcon, Clock, Dumbbell, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

const getWorkoutIcon = (type: string) => {
  switch (type) {
    case "cycling":
      return Bike;
    case "boxing":
      return Box;
    case "bodyweight":
      return Users;
    case "gym":
      return Dumbbell;
    default:
      return TrendingUp;
  }
};

const getWorkoutColor = (type: string) => {
  switch (type) {
    case "cycling":
      return "bg-primary/10 text-primary border-primary/20";
    case "boxing":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "bodyweight":
      return "bg-info/10 text-info border-info/20";
    case "gym":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted/10 text-foreground border-border";
  }
};

const History = () => {
  const { workouts, loading } = useWorkoutHistory();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const workoutDates = workouts.map(w => new Date(w.created_at).toDateString());
  const selectedWorkouts = workouts.filter(
    w => new Date(w.created_at).toDateString() === selectedDate?.toDateString()
  );

  if (loading) {
    return <LoadingSpinner message="Loading history..." />;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary via-energy-glow to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">
              Workout History
            </span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Calendar */}
          <Card className="p-4 sm:p-6 bg-card/90 backdrop-blur-sm border-border/50 shadow-xl card-lift">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-[0_0_8px_rgba(255,87,34,0.4)]" />
              Calendar
            </h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-border"
              modifiers={{
                workout: (date) => workoutDates.includes(date.toDateString()),
              }}
              modifiersStyles={{
                workout: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.2)",
                  color: "hsl(var(--primary))",
                },
              }}
            />
            <p className="text-sm text-muted-foreground mt-4">
              Dates with workouts are highlighted
            </p>
          </Card>

          {/* Workout Details */}
          <Card className="p-4 sm:p-6 bg-card/90 backdrop-blur-sm border-border/50 shadow-xl card-lift">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h2>

            {selectedWorkouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No workouts on this date
              </div>
            ) : (
              <div className="space-y-4">
                {selectedWorkouts.map((workout) => {
                  const Icon = getWorkoutIcon(workout.workout_type);
                  return (
                    <Card
                      key={workout.id}
                      className={`p-4 border card-lift hover:scale-[1.02] transition-all duration-300 ${getWorkoutColor(workout.workout_type)}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold capitalize">{workout.workout_type}</h3>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(workout.created_at), "h:mm a")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(workout.duration / 60)}m {workout.duration % 60}s</span>
                            </div>
                            {workout.distance && (
                              <div>
                                <span className="text-muted-foreground">Distance: </span>
                                {workout.distance.toFixed(1)} km
                              </div>
                            )}
                            {workout.speed && (
                              <div>
                                <span className="text-muted-foreground">Speed: </span>
                                {workout.speed.toFixed(1)} km/h
                              </div>
                            )}
                            {workout.calories && (
                              <div>
                                <span className="text-muted-foreground">Calories: </span>
                                {workout.calories.toFixed(0)} kcal
                              </div>
                            )}
                            {workout.punches && (
                              <div>
                                <span className="text-muted-foreground">Punches: </span>
                                {workout.punches}
                              </div>
                            )}
                          </div>
                          {workout.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{workout.notes}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default History;