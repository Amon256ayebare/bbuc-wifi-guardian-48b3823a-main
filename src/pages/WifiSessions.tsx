import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Clock, Download, Upload, Wifi, WifiOff, User, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWifiSessions, useActiveSessions, useDisconnectUser, formatBytes, formatDuration } from '@/hooks/useWifiSessions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WifiSessions() {
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: allSessions, isLoading: loadingAll } = useWifiSessions();
  const { data: activeSessions, isLoading: loadingActive } = useActiveSessions();
  const disconnectUser = useDisconnectUser();

  const filterSessions = (sessions: any[]) =>
    sessions?.filter((session: any) =>
      session.network_users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      session.network_users?.username?.toLowerCase().includes(search.toLowerCase()) ||
      session.zones?.name?.toLowerCase().includes(search.toLowerCase()) ||
      session.devices?.mac_address?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const handleDisconnect = async (sessionId: string) => {
    if (!confirm('Are you sure you want to disconnect this user?')) return;
    try {
      await disconnectUser.mutateAsync({ session_id: sessionId });
      toast.success('User disconnected successfully');
      setDetailsOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getSessionDuration = (session: any) => {
    if (session.duration_minutes !== null) {
      return formatDuration(session.duration_minutes);
    }
    const connectedAt = new Date(session.connected_at);
    const now = new Date();
    const minutes = (now.getTime() - connectedAt.getTime()) / 60000;
    return formatDuration(minutes);
  };

  const SessionRow = ({ session }: { session: any }) => (
    <tr
      className="table-row cursor-pointer hover:bg-secondary/50"
      onClick={() => {
        setSelectedSession(session);
        setDetailsOpen(true);
      }}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            session.is_active ? 'bg-status-online/20' : 'bg-muted'
          }`}>
            {session.is_active ? (
              <Wifi className="w-5 h-5 text-status-online" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">{session.network_users?.full_name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{session.network_users?.username}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {session.zones?.name || 'Unknown Zone'}
        </div>
      </td>
      <td className="py-4 px-4 font-mono text-sm">
        {session.devices?.mac_address || '-'}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={session.is_active ? 'online' : 'offline'} />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 font-mono">
          <Clock className="w-4 h-4 text-muted-foreground" />
          {getSessionDuration(session)}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-1 text-blue-400">
            <Download className="w-3 h-3" />
            {formatBytes(session.bytes_downloaded || 0)}
          </span>
          <span className="flex items-center gap-1 text-green-400">
            <Upload className="w-3 h-3" />
            {formatBytes(session.bytes_uploaded || 0)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-muted-foreground">
        {format(new Date(session.connected_at), 'MMM d, HH:mm')}
      </td>
    </tr>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              WiFi Sessions
            </h1>
            <p className="text-muted-foreground">Monitor active and historical WiFi connections</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-online/20">
              <div className="w-3 h-3 rounded-full bg-status-online animate-pulse" />
              <span className="font-medium text-status-online">{activeSessions?.length || 0} Active</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, zone, or MAC address..."
            className="pl-10 input-dark"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Zone</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Device</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Bandwidth</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Connected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingActive ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td>
                      </tr>
                    ) : filterSessions(activeSessions || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No active sessions</p>
                        </td>
                      </tr>
                    ) : (
                      filterSessions(activeSessions || []).map((session: any) => (
                        <SessionRow key={session.id} session={session} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="all">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Zone</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Device</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Bandwidth</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Connected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAll ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td>
                      </tr>
                    ) : filterSessions(allSessions || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No sessions found</p>
                        </td>
                      </tr>
                    ) : (
                      filterSessions(allSessions || []).map((session: any) => (
                        <SessionRow key={session.id} session={session} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Session Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedSession.is_active ? 'bg-status-online/20' : 'bg-muted'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{selectedSession.network_users?.full_name}</p>
                    <p className="text-muted-foreground">{selectedSession.network_users?.username}</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={selectedSession.is_active ? 'online' : 'offline'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Zone</p>
                    <p className="font-medium">{selectedSession.zones?.name || 'Unknown'}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Device</p>
                    <p className="font-medium">{selectedSession.devices?.device_name || 'Unknown'}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">MAC Address</p>
                    <p className="font-mono text-sm">{selectedSession.devices?.mac_address || '-'}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                    <p className="font-mono text-sm">{selectedSession.ip_address || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-mono font-medium">{getSessionDuration(selectedSession)}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Download className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xs text-muted-foreground">Downloaded</p>
                    <p className="font-medium">{formatBytes(selectedSession.bytes_downloaded || 0)}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <Upload className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="font-medium">{formatBytes(selectedSession.bytes_uploaded || 0)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Connected: {format(new Date(selectedSession.connected_at), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                  {selectedSession.disconnected_at && (
                    <p className="text-sm text-muted-foreground">
                      • Disconnected: {format(new Date(selectedSession.disconnected_at), 'HH:mm:ss')}
                    </p>
                  )}
                </div>

                {selectedSession.is_active && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDisconnect(selectedSession.id)}
                    disabled={disconnectUser.isPending}
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    Disconnect User
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
