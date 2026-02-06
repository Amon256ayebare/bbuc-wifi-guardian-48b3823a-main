import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NetworkUsers from "./pages/NetworkUsers";
import Devices from "./pages/Devices";
import Zones from "./pages/Zones";
import Bandwidth from "./pages/Bandwidth";
import IntrusionAlerts from "./pages/IntrusionAlerts";
import WifiPortal from "./pages/WifiPortal";
import WifiSessions from "./pages/WifiSessions";
import UsageTracking from "./pages/UsageTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/wifi-portal" element={<WifiPortal />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/users" element={<ProtectedRoute><NetworkUsers /></ProtectedRoute>} />
      <Route path="/dashboard/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
      <Route path="/dashboard/zones" element={<ProtectedRoute><Zones /></ProtectedRoute>} />
      <Route path="/dashboard/bandwidth" element={<ProtectedRoute><Bandwidth /></ProtectedRoute>} />
      <Route path="/dashboard/alerts" element={<ProtectedRoute><IntrusionAlerts /></ProtectedRoute>} />
      <Route path="/dashboard/sessions" element={<ProtectedRoute><WifiSessions /></ProtectedRoute>} />
      <Route path="/dashboard/usage" element={<ProtectedRoute><UsageTracking /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
