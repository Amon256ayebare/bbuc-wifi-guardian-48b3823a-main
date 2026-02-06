import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Wifi, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 animate-pulse-glow">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">BBUC WiFi Management</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-primary mb-8 shadow-glow">
            <Wifi className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">BBUC WiFi Network</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bishop Barham University College Campus Wireless Network Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student/Staff WiFi Portal */}
          <div className="stat-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
              <Wifi className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">WiFi Portal</h2>
            <p className="text-muted-foreground mb-6">
              Students and staff can connect to the campus WiFi network. Login with your university credentials.
            </p>
            <Link to="/wifi-portal">
              <Button size="lg" className="gradient-primary btn-glow w-full">
                <Users className="w-5 h-5 mr-2" />
                Connect to WiFi
              </Button>
            </Link>
          </div>

          {/* Admin Portal */}
          <div className="stat-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-6">
              <ShieldCheck className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Admin Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Network administrators can monitor users, devices, zones, and manage the campus WiFi infrastructure.
            </p>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>© 2026 Bishop Barham University College. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
