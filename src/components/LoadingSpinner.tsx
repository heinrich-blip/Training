export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center animated-gradient gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
  </div>
);
