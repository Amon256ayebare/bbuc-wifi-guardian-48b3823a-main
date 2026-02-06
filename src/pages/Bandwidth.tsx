import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowUp, ArrowDown, Activity, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBandwidthLogs, useZones, useAddBandwidthLog } from '@/hooks/useNetworkData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Bandwidth() {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  const { data: logs, isLoading, refetch } = useBandwidthLogs();
  const { data: zones } = useZones();
  const addLog = useAddBandwidthLog();

  // Generate sample data if needed
  const generateSampleData = async () => {
    if (!zones || zones.length === 0) {
      toast.error('Please add some zones first');
      return;
    }

    try {
      for (const zone of zones) {
        await addLog.mutateAsync({
          zone_id: zone.id,
          download_mbps: Math.random() * 100 + 50,
          upload_mbps: Math.random() * 50 + 20,
          active_devices: Math.floor(Math.random() * 30) + 5,
        });
      }
      toast.success('Sample data generated');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (selectedZone === 'all') return logs;
    return logs.filter((log: any) => log.zone_id === selectedZone);
  }, [logs, selectedZone]);

  const chartData = useMemo(() => {
    return filteredLogs
      .slice(0, 24)
      .reverse()
      .map((log: any) => ({
        time: format(new Date(log.recorded_at), 'HH:mm'),
        download: Number(log.download_mbps) || 0,
        upload: Number(log.upload_mbps) || 0,
        devices: log.active_devices || 0,
        zone: log.zones?.name || 'Unknown',
      }));
  }, [filteredLogs]);

  const stats = useMemo(() => {
    if (filteredLogs.length === 0) return { avgDownload: 0, avgUpload: 0, peakDownload: 0, totalDevices: 0 };
    
    const downloads = filteredLogs.map((l: any) => Number(l.download_mbps) || 0);
    const uploads = filteredLogs.map((l: any) => Number(l.upload_mbps) || 0);
    const devices = filteredLogs.map((l: any) => l.active_devices || 0);

    return {
      avgDownload: downloads.reduce((a, b) => a + b, 0) / downloads.length,
      avgUpload: uploads.reduce((a, b) => a + b, 0) / uploads.length,
      peakDownload: Math.max(...downloads),
      totalDevices: Math.max(...devices),
    };
  }, [filteredLogs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Bandwidth Analytics
            </h1>
            <p className="text-muted-foreground">Monitor network bandwidth usage and trends</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-48 input-dark">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {zones?.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={generateSampleData} disabled={addLog.isPending}>
              <RefreshCw className={`w-4 h-4 mr-2 ${addLog.isPending ? 'animate-spin' : ''}`} />
              Generate Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2 text-success mb-2">
              <ArrowDown className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Download</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgDownload.toFixed(1)} Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2 text-info mb-2">
              <ArrowUp className="w-5 h-5" />
              <span className="text-sm font-medium">Avg Upload</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgUpload.toFixed(1)} Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2 text-warning mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Peak Download</span>
            </div>
            <p className="text-2xl font-bold">{stats.peakDownload.toFixed(1)} Mbps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Peak Devices</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalDevices}</p>
          </motion.div>
        </div>

        {/* Charts */}
        {isLoading ? (
          <div className="stat-card text-center py-12 text-muted-foreground">Loading...</div>
        ) : chartData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card text-center py-12"
          >
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">No bandwidth data yet</p>
            <Button onClick={generateSampleData} disabled={addLog.isPending}>
              Generate Sample Data
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bandwidth Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="stat-card"
            >
              <h3 className="text-lg font-semibold mb-6">Bandwidth Over Time</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" />
                    <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(217, 33%, 17%)', 
                        border: '1px solid hsl(217, 33%, 25%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="download" 
                      name="Download (Mbps)"
                      stroke="hsl(142, 76%, 45%)" 
                      fillOpacity={1} 
                      fill="url(#colorDownload)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upload" 
                      name="Upload (Mbps)"
                      stroke="hsl(199, 89%, 48%)" 
                      fillOpacity={1} 
                      fill="url(#colorUpload)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Active Devices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="stat-card"
            >
              <h3 className="text-lg font-semibold mb-6">Active Devices</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 25%)" />
                    <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(217, 33%, 17%)', 
                        border: '1px solid hsl(217, 33%, 25%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="devices" 
                      name="Active Devices"
                      fill="hsl(217, 91%, 60%)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
