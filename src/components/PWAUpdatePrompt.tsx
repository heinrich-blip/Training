import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every hour
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-card/95 backdrop-blur-lg px-4 py-3 shadow-lg">
      <RefreshCw className="h-5 w-5 text-primary shrink-0" />
      <span className="text-sm text-foreground">New version available</span>
      <Button
        size="sm"
        onClick={() => updateServiceWorker(true)}
        className="bg-primary hover:bg-primary/90 text-white text-xs h-8"
      >
        Update
      </Button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
