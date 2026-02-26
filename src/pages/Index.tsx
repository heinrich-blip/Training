import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Bike, Box, Calendar, Dumbbell, LogOut, LucideIcon, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

const WorkoutCard = ({ 
  to, 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  to: string; 
  icon: LucideIcon; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <Link to={to}>
    <Card className={`group relative overflow-hidden border-2 border-border/50 bg-card hover:border-primary transition-all duration-500 cursor-pointer card-lift`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative p-5 sm:p-8 space-y-3 sm:space-y-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 group-hover:rotate-3">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,87,34,0.6)] transition-all duration-300" />
        </div>
        <div>
          <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
          <p className="text-xs sm:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const Index = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-6xl">
        <header className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="flex justify-end mb-3 sm:mb-4">
            <Button variant="ghost" size="sm" onClick={signOut} className="hover:bg-primary/10 transition-all duration-300 h-10 sm:h-9">
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-energy-glow to-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,87,34,0.3)]">
              FitTrack
            </span>
          </h1>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 animate-[fade-in_0.8s_ease-out_0.3s_both]">
            Track your workouts in real-time. Push your limits. Achieve your goals.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <WorkoutCard
            to="/cycling"
            icon={Bike}
            title="Cycling"
            description="GPS tracking, speed metrics & routes"
            gradient="bg-gradient-to-br from-primary/5 to-transparent"
          />
          <WorkoutCard
            to="/boxing"
            icon={Box}
            title="Boxing"
            description="Punch counter & session analytics"
            gradient="bg-gradient-to-br from-destructive/5 to-transparent"
          />
          <WorkoutCard
            to="/bodyweight"
            icon={Users}
            title="Bodyweight"
            description="Calisthenics & bodyweight exercises"
            gradient="bg-gradient-to-br from-info/5 to-transparent"
          />
          <WorkoutCard
            to="/gym"
            icon={Dumbbell}
            title="Gym"
            description="Equipment training & progress"
            gradient="bg-gradient-to-br from-success/5 to-transparent"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link to="/analytics">
            <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary transition-all cursor-pointer group card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-primary group-hover:scale-125 transition-transform duration-300 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-base font-semibold group-hover:text-primary transition-colors duration-300">Analytics</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Progress charts</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/history">
            <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary transition-all cursor-pointer group card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-primary group-hover:scale-125 transition-transform duration-300 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-base font-semibold group-hover:text-primary transition-colors duration-300">History</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Past workouts</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/goals">
            <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary transition-all cursor-pointer group card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-5 h-5 sm:w-8 sm:h-8 text-primary group-hover:scale-125 transition-transform duration-300 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-base font-semibold group-hover:text-primary transition-colors duration-300">Goals</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Set targets</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/achievements">
            <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary transition-all cursor-pointer group card-lift active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3">
                <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-primary group-hover:scale-125 transition-transform duration-300 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-base font-semibold group-hover:text-primary transition-colors duration-300">Achievements</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Unlock badges</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;