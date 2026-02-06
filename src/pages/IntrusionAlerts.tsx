import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Plus, Search, CheckCircle, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIntrusionAlerts, useAddIntrusionAlert, useResolveAlert, useDevices } from '@/hooks/useNetworkData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const alertTypes = [
  'Unauthorized Access Attempt',
  'MAC Spoofing Detected',
  'Bandwidth Abuse',
  'Suspicious Activity',
  'Rogue Access Point',
  'DDoS Attempt',
  'Port Scanning',
];

const severityConfig = {
  low: { color: 'text-info', bg: 'bg-info/10', icon: AlertCircle },
  medium: { color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle },
  critical: { color: 'text-destructive', bg: 'bg-destructive/20', icon: ShieldAlert },
};

export default function IntrusionAlerts() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    device_id: '',
    alert_type: '',
    severity: 'medium',
    description: '',
  });

  const { data: alerts, isLoading } = useIntrusionAlerts();
  const { data: devices } = useDevices();
  const addAlert = useAddIntrusionAlert();
  const resolveAlert = useResolveAlert();

  const filteredAlerts = alerts?.filter((alert: any) => {
    const matchesSearch = 
      alert.alert_type.toLowerCase().includes(search.toLowerCase()) ||
      alert.description?.toLowerCase().includes(search.toLowerCase()) ||
      alert.devices?.mac_address?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && !alert.resolved) ||
      (filter === 'resolved' && alert.resolved);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAlert.mutateAsync({
        device_id: formData.device_id || null,
        alert_type: formData.alert_type,
        severity: formData.severity,
        description: formData.description,
        resolved: false,
      });
      toast.success('Alert created');
      setDialogOpen(false);
      setFormData({ device_id: '', alert_type: '', severity: 'medium', description: '' });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert.mutateAsync(id);
      toast.success('Alert resolved');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const activeCount = alerts?.filter((a: any) => !a.resolved).length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-destructive" />
              Intrusion Alerts
              {activeCount > 0 && (
                <span className="px-2 py-1 text-sm font-medium bg-destructive/20 text-destructive rounded-full">
                  {activeCount} Active
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">Security alerts and threat monitoring</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Security Alert</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Alert Type *</Label>
                  <Select value={formData.alert_type} onValueChange={(v) => setFormData({ ...formData, alert_type: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      {alertTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity *</Label>
                  <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Related Device</Label>
                  <Select value={formData.device_id} onValueChange={(v) => setFormData({ ...formData, device_id: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Select device (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devices?.map((device: any) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.device_name || device.mac_address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the security incident..."
                    className="input-dark min-h-24"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary" disabled={addAlert.isPending || !formData.alert_type}>
                    Create Alert
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="pl-10 input-dark"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-40 input-dark">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="stat-card text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card text-center py-12"
          >
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No alerts found</p>
            {filter === 'all' && (
              <p className="text-sm text-success mt-2">Network is secure</p>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert: any, index) => {
              const severity = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.medium;
              const SeverityIcon = severity.icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "stat-card flex flex-col sm:flex-row sm:items-center gap-4",
                    alert.resolved && "opacity-60"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", severity.bg)}>
                    <SeverityIcon className={cn("w-6 h-6", severity.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.alert_type}</h3>
                      <span className={cn("px-2 py-0.5 text-xs rounded-full capitalize", severity.bg, severity.color)}>
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">
                          Resolved
                        </span>
                      )}
                    </div>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {alert.devices && (
                        <span>Device: {alert.devices.device_name || alert.devices.mac_address}</span>
                      )}
                      <span>{format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  {!alert.resolved && (
                    <Button
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolveAlert.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
