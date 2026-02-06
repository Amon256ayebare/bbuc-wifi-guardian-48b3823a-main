import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Search, Clock, Download, Upload, User, TrendingUp, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useUserUsageStats, useUserSessions, formatBytes, formatDuration } from '@/hooks/useWifiSessions';
import { format } from 'date-fns';

export default function UsageTracking() {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: usageStats, isLoading } = useUserUsageStats();
  const { data: userSessions } = useUserSessions(selectedUserId);

  const filteredStats = usageStats?.filter((stat) =>
    stat.full_name.toLowerCase().includes(search.toLowerCase()) ||
    stat.username.toLowerCase().includes(search.toLowerCase()) ||
    stat.department?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Find max values for progress bars
  const maxTime = Math.max(...(usageStats?.map(s => s.total_time_minutes) || [1]));
  const maxDownload = Math.max(...(usageStats?.map(s => s.total_bytes_downloaded) || [1]));

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailsOpen(true);
  };

  const selectedUserStats = usageStats?.find(s => s.network_user_id === selectedUserId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Usage Tracking
            </h1>
            <p className="text-muted-foreground">Monitor WiFi usage per user - time spent and bandwidth consumed</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usageStats?.length || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-online/20">
                <TrendingUp className="w-5 h-5 text-status-online" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold">{usageStats?.filter(s => s.active_sessions > 0).length || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {formatDuration(usageStats?.reduce((acc, s) => acc + s.total_time_minutes, 0) || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Download className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Downloaded</p>
                <p className="text-2xl font-bold">
                  {formatBytes(usageStats?.reduce((acc, s) => acc + s.total_bytes_downloaded, 0) || 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or department..."
            className="pl-10 input-dark"
          />
        </div>

        {/* Usage Table */}
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
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Sessions</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground min-w-[200px]">Time Spent</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground min-w-[200px]">Data Usage</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No usage data found</p>
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat.network_user_id} className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            stat.active_sessions > 0 ? 'bg-status-online/20' : 'bg-secondary'
                          }`}>
                            <span className={`font-medium ${
                              stat.active_sessions > 0 ? 'text-status-online' : 'text-secondary-foreground'
                            }`}>
                              {stat.full_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{stat.full_name}</p>
                            <p className="text-sm text-muted-foreground">{stat.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{stat.department || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono">{stat.total_sessions}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(stat.total_time_minutes)}
                            </span>
                          </div>
                          <Progress 
                            value={(stat.total_time_minutes / maxTime) * 100} 
                            className="h-2"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3 text-primary" />
                              {formatBytes(stat.total_bytes_downloaded)}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Upload className="w-3 h-3" />
                              {formatBytes(stat.total_bytes_uploaded)}
                            </span>
                          </div>
                          <Progress 
                            value={(stat.total_bytes_downloaded / maxDownload) * 100} 
                            className="h-2"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {stat.active_sessions > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-status-online/20 text-status-online text-xs font-medium">
                            <div className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
                            {stat.active_sessions} active
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {stat.last_connected 
                              ? `Last: ${format(new Date(stat.last_connected), 'MMM d, HH:mm')}`
                              : 'Never connected'
                            }
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(stat.network_user_id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Usage Details</DialogTitle>
            </DialogHeader>
            {selectedUserStats && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-medium text-primary text-lg">
                      {selectedUserStats.full_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-lg">{selectedUserStats.full_name}</p>
                    <p className="text-muted-foreground">{selectedUserStats.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedUserStats.total_sessions}</p>
                    <p className="text-xs text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatDuration(selectedUserStats.total_time_minutes)}</p>
                    <p className="text-xs text-muted-foreground">Total Time</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatBytes(selectedUserStats.total_bytes_downloaded)}</p>
                    <p className="text-xs text-muted-foreground">Downloaded</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatBytes(selectedUserStats.total_bytes_uploaded)}</p>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Recent Sessions</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userSessions?.slice(0, 10).map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            session.is_active ? 'bg-status-online animate-pulse' : 'bg-muted-foreground'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{session.zones?.name || 'Unknown Zone'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.connected_at), 'MMM d, HH:mm')}
                              {session.disconnected_at && ` - ${format(new Date(session.disconnected_at), 'HH:mm')}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-mono">
                            {session.duration_minutes 
                              ? formatDuration(session.duration_minutes)
                              : session.is_active 
                                ? 'Active'
                                : '-'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes((session.bytes_downloaded || 0) + (session.bytes_uploaded || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!userSessions || userSessions.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No sessions found</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
