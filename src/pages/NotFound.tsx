import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="dark">
      <div className="flex min-h-screen items-center justify-center animated-gradient">
        <div className="text-center px-4 space-y-4">
          <div className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-primary to-energy-glow bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,87,34,0.3)]">
            404
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground">Page not found</p>
          <Link to="/">
            <Button className="mt-4 gap-2 hover:scale-105 transition-all duration-300 shadow-lg">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;