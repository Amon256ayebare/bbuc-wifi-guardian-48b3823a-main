import { motion } from 'framer-motion';
import { 
  Users, 
  Laptop, 
  MapPin, 
  ShieldAlert, 
  Activity,
  Wifi,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useDashboardStats, useDevices, useIntrusionAlerts } from '@/hooks/useNetworkData';
import { useActiveSessions, useUserUsageStats, formatBytes, formatDuration } from '@/hooks/useWifiSessions';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: devices } = useDevices();
  const { data: alerts } = useIntrusionAlerts();
  const { data: activeSessions } = useActiveSessions();
  const { data: usageStats } = useUserUsageStats();

  const recentDevices = devices?.slice(0, 5) || [];
  const recentAlerts = alerts?.filter(a => !a.resolved).slice(0, 5) || [];
  
  // Calculate total usage from all users
  const totalTimeMinutes = usageStats?.reduce((acc, s) => acc + s.total_time_minutes, 0) || 0;
  const totalDownloaded = usageStats?.reduce((acc, s) => acc + s.total_bytes_downloaded, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Bishop Barham University College - WiFi Network Management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle="Registered users"
            icon={<Users className="w-6 h-6 text-white" />}
            accentColor="primary"
          />
          <Link to="/dashboard/sessions">
            <StatCard
              title="Active Sessions"
              value={activeSessions?.length || 0}
              subtitle="Users online now"
              icon={<Wifi className="w-6 h-6 text-white" />}
              accentColor="success"
            />
          </Link>
          <StatCard
            title="Online Devices"
            value={stats?.onlineDevices || 0}
            subtitle={`of ${stats?.totalDevices || 0} total`}
            icon={<Laptop className="w-6 h-6 text-white" />}
            accentColor="info"
          />
          <StatCard
            title="Active Zones"
            value={stats?.totalZones || 0}
            subtitle="Access points"
            icon={<MapPin className="w-6 h-6 text-white" />}
            accentColor="info"
          />
          <StatCard
            title="Active Alerts"
            value={stats?.unresolvedAlerts || 0}
            subtitle="Needs attention"
            icon={<ShieldAlert className="w-6 h-6 text-white" />}
            accentColor={stats?.unresolvedAlerts ? 'destructive' : 'success'}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Devices
              </h2>
            </div>
            
            {recentDevices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Laptop className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No devices registered yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDevices.map((device: any) => (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{device.device_name || device.mac_address}</p>
                        <p className="text-sm text-muted-foreground">{device.ip_address || 'No IP'}</p>
                      </div>
                    </div>
                    <StatusBadge status={device.status || 'offline'} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                Security Alerts
              </h2>
            </div>
            
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts</p>
                <p className="text-sm text-success">Network is secure</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAlerts.map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium">{alert.alert_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.devices?.mac_address || 'Unknown device'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.created_at), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Network Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <div className="text-3xl font-bold text-status-online mb-1">{activeSessions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <div className="text-3xl font-bold text-primary mb-1">{formatDuration(totalTimeMinutes)}</div>
              <div className="text-sm text-muted-foreground">Total Time Used</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <div className="text-3xl font-bold text-accent-foreground mb-1">{formatBytes(totalDownloaded)}</div>
              <div className="text-sm text-muted-foreground">Data Downloaded</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <div className="text-3xl font-bold text-secondary-foreground mb-1">{stats?.totalZones || 0}</div>
              <div className="text-sm text-muted-foreground">Active Zones</div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
