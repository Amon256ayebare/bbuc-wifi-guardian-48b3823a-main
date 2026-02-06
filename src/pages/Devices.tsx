import { useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Plus, Search, MoreHorizontal, Edit, Trash2, Ban, Check, Wifi } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDevices, useAddDevice, useUpdateDevice, useDeleteDevice, useZones, useNetworkUsers } from '@/hooks/useNetworkData';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Devices() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [formData, setFormData] = useState({
    mac_address: '',
    ip_address: '',
    device_name: '',
    device_type: 'laptop',
    network_user_id: '',
    zone_id: '',
    status: 'offline' as const,
  });

  const { data: devices, isLoading } = useDevices();
  const { data: zones } = useZones();
  const { data: users } = useNetworkUsers();
  const addDevice = useAddDevice();
  const updateDevice = useUpdateDevice();
  const deleteDevice = useDeleteDevice();

  const filteredDevices = devices?.filter((device: any) => 
    device.mac_address.toLowerCase().includes(search.toLowerCase()) ||
    device.device_name?.toLowerCase().includes(search.toLowerCase()) ||
    device.ip_address?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        network_user_id: formData.network_user_id || null,
        zone_id: formData.zone_id || null,
      };
      
      if (editingDevice) {
        await updateDevice.mutateAsync({ id: editingDevice.id, ...data });
        toast.success('Device updated successfully');
      } else {
        await addDevice.mutateAsync(data);
        toast.success('Device added successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (device: any) => {
    setEditingDevice(device);
    setFormData({
      mac_address: device.mac_address,
      ip_address: device.ip_address || '',
      device_name: device.device_name || '',
      device_type: device.device_type || 'laptop',
      network_user_id: device.network_user_id || '',
      zone_id: device.zone_id || '',
      status: device.status || 'offline',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice.mutateAsync(id);
        toast.success('Device deleted successfully');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleBlock = async (device: any) => {
    try {
      await updateDevice.mutateAsync({ 
        id: device.id, 
        status: device.status === 'blocked' ? 'offline' : 'blocked' 
      });
      toast.success(device.status === 'blocked' ? 'Device unblocked' : 'Device blocked');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingDevice(null);
    setFormData({
      mac_address: '',
      ip_address: '',
      device_name: '',
      device_type: 'laptop',
      network_user_id: '',
      zone_id: '',
      status: 'offline',
    });
  };

  const deviceTypeIcons: Record<string, string> = {
    laptop: '💻',
    phone: '📱',
    tablet: '📱',
    desktop: '🖥️',
    iot: '📡',
    unknown: '❓',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <Laptop className="w-8 h-8 text-primary" />
              Devices
            </h1>
            <p className="text-muted-foreground">Track and manage connected devices</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDevice ? 'Edit Device' : 'Add New Device'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>MAC Address *</Label>
                  <Input
                    value={formData.mac_address}
                    onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                    placeholder="AA:BB:CC:DD:EE:FF"
                    className="input-dark"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device Name</Label>
                  <Input
                    value={formData.device_name}
                    onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                    placeholder="John's MacBook"
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select value={formData.device_type} onValueChange={(v) => setFormData({ ...formData, device_type: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="iot">IoT Device</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned User</Label>
                  <Select value={formData.network_user_id} onValueChange={(v) => setFormData({ ...formData, network_user_id: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Select user (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <Select value={formData.zone_id} onValueChange={(v) => setFormData({ ...formData, zone_id: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Select zone (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {zones?.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary" disabled={addDevice.isPending || updateDevice.isPending}>
                    {editingDevice ? 'Update' : 'Add Device'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by MAC, name, or IP..."
            className="pl-10 input-dark"
          />
        </div>

        {/* Devices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Device</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">MAC Address</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Zone</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Last Seen</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Laptop className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No devices found</p>
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device: any) => (
                    <tr key={device.id} className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                            {deviceTypeIcons[device.device_type] || '❓'}
                          </div>
                          <div>
                            <p className="font-medium">{device.device_name || 'Unknown Device'}</p>
                            <p className="text-sm text-muted-foreground capitalize">{device.device_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm">{device.mac_address}</td>
                      <td className="py-4 px-4 font-mono text-sm">{device.ip_address || '-'}</td>
                      <td className="py-4 px-4 text-muted-foreground">{device.zones?.name || '-'}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={device.status || 'offline'} />
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {device.last_seen ? format(new Date(device.last_seen), 'MMM d, HH:mm') : 'Never'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(device)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlock(device)}>
                              {device.status === 'blocked' ? (
                                <><Check className="w-4 h-4 mr-2" /> Unblock</>
                              ) : (
                                <><Ban className="w-4 h-4 mr-2" /> Block</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(device.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
