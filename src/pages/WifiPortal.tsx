import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Wifi, User, Laptop, Smartphone, Monitor, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDuration } from '@/hooks/useWifiSessions';
import { useZones } from '@/hooks/useNetworkData';

interface ConnectedSession {
  id: string;
  network_user: {
    id: string;
    username: string;
    full_name: string;
  };
  zone: { name: string } | null;
  device: { device_name: string | null; device_type: string | null } | null;
  connected_at: string;
  bytes_downloaded: number;
  bytes_uploaded: number;
}

export default function WifiPortal() {
  const [username, setUsername] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('laptop');
  const [selectedZone, setSelectedZone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedSession, setConnectedSession] = useState<ConnectedSession | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: zones } = useZones();

  // Update current time every second for session duration display
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for existing session in localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('wifi_session');
    if (savedSession) {
      try {
        setConnectedSession(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem('wifi_session');
      }
    }
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }

    setIsLoading(true);
    try {
      // 1) Lookup user (public lookup is allowed)
      const { data: user, error: userError } = await supabase
        .from('network_users')
        .select('id, username, full_name, status')
        .eq('username', username.trim())
        .single();

      if (userError || !user) {
        toast.error('User not found. Please contact IT support.');
        return;
      }

      if (user.status === 'blocked') {
        toast.error('Your account has been blocked. Please contact IT support.');
        return;
      }

      // 2) Register device (public insert is allowed)
      const macAddress = `${Math.random().toString(16).substr(2, 2)}:${Math.random()
        .toString(16)
        .substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}:${Math.random()
        .toString(16)
        .substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}:${Math.random()
        .toString(16)
        .substr(2, 2)}`.toUpperCase();

      const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .insert({
          mac_address: macAddress,
          device_name: deviceName || `${user.full_name}'s ${deviceType}`,
          device_type: deviceType,
          network_user_id: user.id,
          zone_id: selectedZone || null,
          status: 'online',
          ip_address: ipAddress,
        })
        .select('id, device_name, device_type, ip_address')
        .single();

      if (deviceError || !device) {
        throw deviceError;
      }

      // 3) Create session (public insert is allowed)
      // IMPORTANT: We do NOT update devices/network_users here because those updates are admin-only.
      const { data: session, error: sessionError } = await supabase
        .from('wifi_sessions')
        .insert({
          network_user_id: user.id,
          device_id: device.id,
          zone_id: selectedZone || null,
          ip_address: device.ip_address,
          is_active: true,
        })
        .select('id, connected_at')
        .single();

      if (sessionError || !session) {
        throw sessionError;
      }

      const zoneData = zones?.find((z) => z.id === selectedZone);

      const sessionData: ConnectedSession = {
        id: session.id,
        network_user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
        },
        zone: zoneData ? { name: zoneData.name } : null,
        device: { device_name: device.device_name, device_type: device.device_type },
        connected_at: session.connected_at,
        bytes_downloaded: 0,
        bytes_uploaded: 0,
      };

      setConnectedSession(sessionData);
      localStorage.setItem('wifi_session', JSON.stringify(sessionData));
      toast.success(`Welcome, ${user.full_name}! You are now connected to WiFi.`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedSession) return;

    setIsLoading(true);
    try {
      // Simulate some bandwidth usage
      const bytesDownloaded = Math.floor(Math.random() * 500000000); // Up to 500MB
      const bytesUploaded = Math.floor(Math.random() * 100000000); // Up to 100MB

      // Public UPDATE on wifi_sessions is allowed for the portal.
      // IMPORTANT: We do NOT update the device to offline here because device updates are admin-only.
      const { error } = await supabase
        .from('wifi_sessions')
        .update({
          disconnected_at: new Date().toISOString(),
          is_active: false,
          bytes_downloaded: bytesDownloaded,
          bytes_uploaded: bytesUploaded,
        })
        .eq('id', connectedSession.id);

      if (error) throw error;

      setConnectedSession(null);
      localStorage.removeItem('wifi_session');
      toast.success('Disconnected from WiFi');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionDuration = () => {
    if (!connectedSession) return '0 min';
    const connectedAt = new Date(connectedSession.connected_at);
    const minutes = (currentTime.getTime() - connectedAt.getTime()) / 60000;
    return formatDuration(minutes);
  };

  const deviceTypeIcons: Record<string, React.ReactNode> = {
    laptop: <Laptop className="w-5 h-5" />,
    phone: <Smartphone className="w-5 h-5" />,
    tablet: <Smartphone className="w-5 h-5" />,
    desktop: <Monitor className="w-5 h-5" />,
  };

  // Connected view
  if (connectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card/90 backdrop-blur-lg border-border shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-status-online/20 flex items-center justify-center mb-4">
                <Wifi className="w-8 h-8 text-status-online animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Connected to WiFi</CardTitle>
              <CardDescription>BBUC Campus Network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-medium">{connectedSession.network_user.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="font-medium">{connectedSession.zone?.name || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-medium flex items-center gap-2">
                    {deviceTypeIcons[connectedSession.device?.device_type || 'laptop']}
                    {connectedSession.device?.device_name || 'Unknown Device'}
                  </span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Session Duration</span>
                    <span className="font-mono text-lg text-primary">{getSessionDuration()}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="w-full"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoading ? 'Disconnecting...' : 'Disconnect from WiFi'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Login view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/90 backdrop-blur-lg border-border shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Wifi className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">BBUC WiFi Portal</CardTitle>
            <CardDescription>Connect to the campus wireless network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your student/staff ID"
                    className="pl-10 input-dark"
                    required
                  />
                </div>
              </div>

              {zones && zones.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="zone">Select Zone</Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Choose access point zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Device Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['laptop', 'phone', 'tablet', 'desktop'].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={deviceType === type ? 'default' : 'outline'}
                      className={`flex flex-col items-center gap-1 h-auto py-3 ${
                        deviceType === type ? 'gradient-primary' : ''
                      }`}
                      onClick={() => setDeviceType(type)}
                    >
                      {deviceTypeIcons[type]}
                      <span className="text-xs capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name (Optional)</Label>
                <Input
                  id="deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., My MacBook Pro"
                  className="input-dark"
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary btn-glow"
                disabled={isLoading}
              >
                <Wifi className="w-4 h-4 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect to WiFi'}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              By connecting, you agree to BBUC's acceptable use policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
