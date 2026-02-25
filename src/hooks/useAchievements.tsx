import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const { data: allAchievements, error: achievementsError } = await supabase
        .from("achievements")
        .select("*");

      if (achievementsError) throw achievementsError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userUnlocked, error: userError } = await supabase
          .from("user_achievements")
          .select("*, achievement:achievements(*)")
          .eq("user_id", user.id);

        if (userError) throw userError;

        setUserAchievements(userUnlocked || []);
      }

      setAchievements(allAchievements || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch achievements";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const unlockAchievement = async (achievementId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to unlock achievements");
      }

      // Check if already unlocked
      const alreadyUnlocked = userAchievements.some(
        ua => ua.achievement_id === achievementId
      );

      if (alreadyUnlocked) return;

      const { error } = await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: achievementId,
      });

      if (error) throw error;

      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast({
          title: "Achievement Unlocked! 🎉",
          description: `${achievement.icon} ${achievement.name}`,
        });
      }

      await fetchAchievements();
    } catch (error: unknown) {
      // Silently fail if achievement already unlocked
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("duplicate")) {
        const errorMessage = error instanceof Error ? error.message : "Failed to unlock achievement";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    userAchievements,
    loading,
    fetchAchievements,
    unlockAchievement,
    isUnlocked,
  };
};