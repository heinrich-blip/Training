import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAchievements } from "@/hooks/useAchievements";
import { format } from "date-fns";
import { Lock, Trophy } from "lucide-react";

const Achievements = () => {
  const { achievements, loading, isUnlocked, userAchievements } = useAchievements();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-muted-foreground">Loading achievements...</div>
      </div>
    );
  }

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = ((unlockedCount / totalCount) * 100).toFixed(0);

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <NavLink to="/" />
          <h1 className="text-4xl font-bold float">
            <span className="bg-gradient-to-r from-primary via-energy-glow to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,87,34,0.3)]">
              Achievements
            </span>
          </h1>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-card/90 backdrop-blur-sm border-primary/20 shadow-xl glow-effect-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-muted-foreground">
                {unlockedCount} of {totalCount} achievements unlocked
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-primary drop-shadow-[0_0_20px_rgba(255,87,34,0.5)] pulse-slow">{completionPercentage}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </Card>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const userAchievement = userAchievements.find(
              (ua) => ua.achievement_id === achievement.id
            );

            return (
                <Card
                  key={achievement.id}
                  className={`p-6 transition-all duration-500 card-lift ${
                    unlocked
                      ? "bg-gradient-to-br from-primary/10 to-card/90 backdrop-blur-sm border-primary/30 shadow-[0_0_20px_rgba(255,87,34,0.2)] hover:shadow-[0_0_30px_rgba(255,87,34,0.3)]"
                      : "bg-card/50 backdrop-blur-sm border-border/50 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div
                      className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
                        unlocked
                          ? "bg-primary/20 border-2 border-primary scale-110 animate-[fade-in_0.5s_ease-out]"
                          : "bg-muted/20 border-2 border-border"
                      }`}
                    >
                      {unlocked ? achievement.icon : <Lock className="w-8 h-8" />}
                    </div>                  <div>
                    <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>

                    {unlocked ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-border/50">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Badge>
                    )}

                    {userAchievement && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(userAchievement.unlocked_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>

                  {!unlocked && (
                    <div className="text-xs text-muted-foreground">
                      Goal: {achievement.criteria_value}{" "}
                      {achievement.criteria_type.replace("_", " ")}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;