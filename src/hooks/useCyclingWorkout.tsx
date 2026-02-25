import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useState } from "react";

export interface RoutePoint {
  lat: number;
  lng: number;
}

export const useCyclingWorkout = () => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveWorkout = async (workoutData: {
    duration: number;
    distance: number;
    speed: number;
    calories: number;
    routeData: RoutePoint[];
    elevationData: number[];
  }) => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save workouts");
      }

      const { error } = await supabase.from("workouts").insert({
        user_id: user.id,
        workout_type: "cycling",
        duration: workoutData.duration,
        distance: workoutData.distance,
        speed: workoutData.speed,
        calories: workoutData.calories,
        route_data: workoutData.routeData as unknown as Json,
      });

      if (error) throw error;

      toast({
        title: "Workout saved!",
        description: "Your cycling workout has been saved successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save workout";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveRoute = async (routeData: {
    name: string;
    description?: string;
    distance: number;
    routeData: RoutePoint[];
    elevationData: number[];
    difficulty?: string;
  }) => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to save routes");
      }

      const { error } = await supabase.from("cycling_routes").insert({
        user_id: user.id,
        name: routeData.name,
        description: routeData.description,
        distance: routeData.distance,
        route_data: routeData.routeData as unknown as Json,
        elevation_data: routeData.elevationData as unknown as Json,
        difficulty: routeData.difficulty,
      });

      if (error) throw error;

      toast({
        title: "Route saved!",
        description: "Your cycling route has been saved successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save route";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return { saveWorkout, saveRoute, saving };
};