import { MobileBottomNav, DesktopSideNav } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <ProtectedRoute>
      <div className="dark min-h-screen">
        <DesktopSideNav />
        <main className="md:ml-16 lg:ml-56 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
};
