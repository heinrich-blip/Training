import { Bike, Box, Calendar, Dumbbell, Home, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/cycling", icon: Bike, label: "Ride" },
  { to: "/gym", icon: Dumbbell, label: "Gym" },
  { to: "/history", icon: Calendar, label: "History" },
  { to: "/analytics", icon: TrendingUp, label: "Stats" },
];

const moreItems = [
  { to: "/boxing", icon: Box, label: "Boxing" },
  { to: "/bodyweight", icon: Users, label: "Bodyweight" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/achievements", icon: Trophy, label: "Trophies" },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-1 h-16">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-all duration-200 min-w-[52px] ${
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_rgba(255,87,34,0.5)]" : ""}`} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSideNav = () => {
  const location = useLocation();
  const allItems = [...navItems, ...moreItems];

  return (
    <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-16 lg:w-56 flex-col bg-card/95 backdrop-blur-lg border-r border-border/50">
      <div className="p-3 lg:p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="hidden lg:block text-lg font-extrabold bg-gradient-to-r from-primary to-energy-glow bg-clip-text text-transparent">
            FitTrack
          </span>
        </Link>
      </div>
      <div className="flex-1 py-2 space-y-1 overflow-y-auto">
        {allItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "drop-shadow-[0_0_6px_rgba(255,87,34,0.5)]" : ""}`} />
              <span className="hidden lg:block text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
