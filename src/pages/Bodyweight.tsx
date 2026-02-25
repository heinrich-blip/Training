import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const exercises = [
  { id: 1, name: "Push-ups", sets: "3 sets", reps: "15-20 reps", category: "Upper Body" },
  { id: 2, name: "Pull-ups", sets: "3 sets", reps: "8-12 reps", category: "Upper Body" },
  { id: 3, name: "Squats", sets: "4 sets", reps: "20 reps", category: "Lower Body" },
  { id: 4, name: "Lunges", sets: "3 sets", reps: "12 reps each leg", category: "Lower Body" },
  { id: 5, name: "Plank", sets: "3 sets", reps: "60 seconds", category: "Core" },
  { id: 6, name: "Mountain Climbers", sets: "3 sets", reps: "30 reps", category: "Core" },
  { id: 7, name: "Dips", sets: "3 sets", reps: "12-15 reps", category: "Upper Body" },
  { id: 8, name: "Burpees", sets: "3 sets", reps: "10-15 reps", category: "Full Body" },
];

const Bodyweight = () => {
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Upper Body": return "bg-primary/20 text-primary";
      case "Lower Body": return "bg-info/20 text-info";
      case "Core": return "bg-success/20 text-success";
      case "Full Body": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-4 sm:mb-8 gap-2">
          <Link to="/">
            <Button variant="default" size="sm" className="bg-card hover:bg-card/80 text-foreground border-2 border-border hover:border-success transition-all duration-300 shadow-sm h-10 px-3 sm:px-4">
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent flex-1 text-center">
            <span className="hidden sm:inline">Bodyweight Workout</span>
            <span className="sm:hidden">Bodyweight</span>
          </h1>
          <div className="w-10 sm:w-40" />
        </header>

        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm border-2 border-border/50 glow-effect-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgba(14,165,233,0.4)]">{completed.length}/{exercises.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Exercises Completed</div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-info drop-shadow-[0_0_10px_rgba(14,165,233,0.4)]">{Math.round((completed.length / exercises.length) * 100)}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </Card>

        <div className="space-y-3 sm:space-y-4">
          {exercises.map((exercise) => {
            const isCompleted = completed.includes(exercise.id);
            return (
              <Card 
                key={exercise.id}
                className={`p-4 sm:p-6 transition-all duration-500 cursor-pointer border-2 card-lift active:scale-95 ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/50 glow-effect-sm' 
                    : 'bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30'
                }`}
                onClick={() => toggleComplete(exercise.id)}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-primary scale-110 rotate-12' : 'bg-muted hover:scale-105'
                  }`}>
                    <CheckCircle2 className={`w-6 h-6 transition-all duration-300 ${isCompleted ? 'text-white animate-[fade-in_0.3s_ease-out]' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <h3 className="text-base sm:text-xl font-bold">{exercise.name}</h3>
                      <span className={`text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap ${getCategoryColor(exercise.category)}`}>
                        {exercise.category}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{exercise.sets}</span>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Bodyweight;