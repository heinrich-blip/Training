import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  target_date?: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  completed_at?: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to view goals");
      }

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch goals";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createGoal = async (goalData: {
    goal_type: string;
    title: string;
    description?: string;
    target_value: number;
    target_date?: string;
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create goals");
      }

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        ...goalData,
      });

      if (error) throw error;

      toast({
        title: "Goal created!",
        description: "Your goal has been created successfully.",
      });

      await fetchGoals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create goal";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalId: string, currentValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const completed = currentValue >= goal.target_value;

      const { error } = await supabase
        .from("goals")
        .update({
          current_value: currentValue,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", goalId);

      if (error) throw error;

      await fetchGoals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update goal progress";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      });

      await fetchGoals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete goal";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoalProgress,
    deleteGoal,
  };
};