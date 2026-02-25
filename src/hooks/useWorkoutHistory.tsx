import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface Workout {
  id: string;
  workout_type: string;
  duration: number;
  distance?: number;
  speed?: number;
  calories?: number;
  punches?: number;
  intensity?: number;
  created_at: string;
  notes?: string;
}

export const useWorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to view workout history");
      }

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setWorkouts(data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch workouts";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const getPersonalRecords = () => {
    if (workouts.length === 0) return null;

    const records = {
      longestDistance: Math.max(...workouts.filter(w => w.distance).map(w => w.distance || 0)),
      fastestSpeed: Math.max(...workouts.filter(w => w.speed).map(w => w.speed || 0)),
      longestDuration: Math.max(...workouts.map(w => w.duration)),
      mostCalories: Math.max(...workouts.filter(w => w.calories).map(w => w.calories || 0)),
      mostPunches: Math.max(...workouts.filter(w => w.punches).map(w => w.punches || 0)),
      totalWorkouts: workouts.length,
      totalDistance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
    };

    return records;
  };

  const getWeeklyData = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekWorkouts = workouts.filter(
      w => new Date(w.created_at) >= sevenDaysAgo
    );

    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayWorkouts = weekWorkouts.filter(
        w => new Date(w.created_at).toDateString() === date.toDateString()
      );

      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: dayWorkouts.length,
        calories: dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        distance: dayWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      };
    });

    return dailyData;
  };

  const getMonthlyData = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthWorkouts = workouts.filter(
      w => new Date(w.created_at) >= thirtyDaysAgo
    );

    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(thirtyDaysAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = monthWorkouts.filter(w => {
        const date = new Date(w.created_at);
        return date >= weekStart && date < weekEnd;
      });

      return {
        week: `Week ${i + 1}`,
        workouts: weekWorkouts.length,
        calories: weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
        distance: weekWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      };
    });

    return weeklyData;
  };

  return {
    workouts,
    loading,
    fetchWorkouts,
    getPersonalRecords,
    getWeeklyData,
    getMonthlyData,
  };
};