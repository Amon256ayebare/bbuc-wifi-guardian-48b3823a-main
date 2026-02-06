import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  LayoutDashboard, 
  Users, 
  Laptop, 
  MapPin, 
  BarChart3, 
  ShieldAlert, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/users', label: 'Network Users', icon: Users },
  { path: '/dashboard/devices', label: 'Devices', icon: Laptop },
  { path: '/dashboard/zones', label: 'Zones / APs', icon: MapPin },
  { path: '/dashboard/sessions', label: 'WiFi Sessions', icon: Activity },
  { path: '/dashboard/usage', label: 'Usage Tracking', icon: Clock },
  { path: '/dashboard/bandwidth', label: 'Bandwidth', icon: BarChart3 },
  { path: '/dashboard/alerts', label: 'Intrusion Alerts', icon: ShieldAlert },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">BBUC WiFi</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">BBUC WiFi</h1>
            <p className="text-xs text-muted-foreground">Network Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn("nav-link", isActive && "active")}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
