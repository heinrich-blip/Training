import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGoals } from "@/hooks/useGoals";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { CheckCircle2, Plus, Target, Trash2 } from "lucide-react";
import { useState } from "react";

const Goals = () => {
  const { goals, loading, createGoal, deleteGoal } = useGoals();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: "distance",
    title: "",
    description: "",
    target_value: "",
    target_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal({
      ...formData,
      target_value: parseFloat(formData.target_value),
      target_date: formData.target_date || undefined,
    });
    setFormData({
      goal_type: "distance",
      title: "",
      description: "",
      target_value: "",
      target_date: "",
    });
    setOpen(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading goals..." />;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-primary via-energy-glow to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">
              Goals
            </span>
          </h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={formData.goal_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, goal_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Total Distance</SelectItem>
                      <SelectItem value="workouts">Number of Workouts</SelectItem>
                      <SelectItem value="calories">Calories Burned</SelectItem>
                      <SelectItem value="speed">Average Speed</SelectItem>
                      <SelectItem value="custom">Custom Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Ride 500km this month"
                    required
                  />
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Add more details about your goal..."
                  />
                </div>

                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={formData.target_value}
                    onChange={(e) =>
                      setFormData({ ...formData, target_value: e.target.value })
                    }
                    placeholder="e.g., 500"
                    required
                  />
                </div>

                <div>
                  <Label>Target Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) =>
                      setFormData({ ...formData, target_date: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">
                  Create Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <Card className="p-12 text-center bg-card/90 backdrop-blur-sm border-border/50 shadow-xl card-lift">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground float" />
            <h3 className="text-2xl font-bold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-6">
              Set your first goal to start tracking your progress!
            </p>
            <Button onClick={() => setOpen(true)} className="hover:scale-105 transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              return (
                <Card
                  key={goal.id}
                  className={`p-6 bg-card/90 backdrop-blur-sm border-border/50 shadow-lg card-lift hover:border-primary/30 transition-all duration-300 ${
                    goal.completed ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {goal.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <Target className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {goal.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-semibold">
                              {goal.current_value.toFixed(1)} / {goal.target_value}{" "}
                              ({progress.toFixed(0)}%)
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                        {goal.target_date && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Target: {format(new Date(goal.target_date), "MMMM d, yyyy")}
                          </p>
                        )}
                        {goal.completed_at && (
                          <p className="text-sm text-primary mt-2">
                            ✓ Completed on{" "}
                            {format(new Date(goal.completed_at), "MMMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;