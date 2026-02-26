import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from './pages/Index';
import Cycling from './pages/Cycling';
import Boxing from './pages/Boxing';
import Bodyweight from './pages/Bodyweight';
import Gym from './pages/Gym';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import NotFound from './pages/NotFound';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <Toaster />
        <Sonner />
        <PWAUpdatePrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/cycling" element={<AppLayout><Cycling /></AppLayout>} />
            <Route path="/boxing" element={<AppLayout><Boxing /></AppLayout>} />
            <Route path="/bodyweight" element={<AppLayout><Bodyweight /></AppLayout>} />
            <Route path="/gym" element={<AppLayout><Gym /></AppLayout>} />
            <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
            <Route path="/history" element={<AppLayout><History /></AppLayout>} />
            <Route path="/goals" element={<AppLayout><Goals /></AppLayout>} />
            <Route path="/achievements" element={<AppLayout><Achievements /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;