import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cycling from "./pages/Cycling";
import Boxing from "./pages/Boxing";
import Bodyweight from "./pages/Bodyweight";
import Gym from "./pages/Gym";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cycling" element={<Cycling />} />
            <Route path="/boxing" element={<Boxing />} />
            <Route path="/bodyweight" element={<Bodyweight />} />
            <Route path="/gym" element={<Gym />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/achievements" element={<Achievements />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;