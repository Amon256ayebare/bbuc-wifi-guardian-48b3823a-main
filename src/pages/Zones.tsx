import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Search, MoreHorizontal, Edit, Trash2, Wifi, Settings } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useZones, useAddZone, useUpdateZone, useDeleteZone } from '@/hooks/useNetworkData';
import { toast } from 'sonner';

export default function Zones() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ap_count: 1,
    status: 'active' as const,
    max_capacity: 100,
  });

  const { data: zones, isLoading } = useZones();
  const addZone = useAddZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const filteredZones = zones?.filter(zone => 
    zone.name.toLowerCase().includes(search.toLowerCase()) ||
    zone.location.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateZone.mutateAsync({ id: editingZone.id, ...formData });
        toast.success('Zone updated successfully');
      } else {
        await addZone.mutateAsync(formData);
        toast.success('Zone added successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (zone: any) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      location: zone.location,
      ap_count: zone.ap_count || 1,
      status: zone.status || 'active',
      max_capacity: zone.max_capacity || 100,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      try {
        await deleteZone.mutateAsync(id);
        toast.success('Zone deleted successfully');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleStatusChange = async (zone: any, status: string) => {
    try {
      await updateZone.mutateAsync({ id: zone.id, status: status as any });
      toast.success('Zone status updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      location: '',
      ap_count: 1,
      status: 'active',
      max_capacity: 100,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-primary" />
              Zones & Access Points
            </h1>
            <p className="text-muted-foreground">Monitor and manage network coverage areas</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{editingZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Zone Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Library WiFi"
                    className="input-dark"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Main Building, Floor 2"
                    className="input-dark"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Access Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.ap_count}
                    onChange={(e) => setFormData({ ...formData, ap_count: parseInt(e.target.value) || 1 })}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 100 })}
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary" disabled={addZone.isPending || updateZone.isPending}>
                    {editingZone ? 'Update' : 'Add Zone'}
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
            placeholder="Search zones..."
            className="pl-10 input-dark"
          />
        </div>

        {/* Zones Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredZones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card text-center py-12"
          >
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No zones found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredZones.map((zone, index) => {
              const usage = zone.max_capacity ? ((zone.current_devices || 0) / zone.max_capacity) * 100 : 0;
              
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="stat-card group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(zone)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(zone, zone.status === 'active' ? 'maintenance' : 'active')}>
                          <Settings className="w-4 h-4 mr-2" />
                          {zone.status === 'active' ? 'Set Maintenance' : 'Set Active'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(zone.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{zone.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{zone.location}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={zone.status || 'active'} />
                    <span className="text-sm text-muted-foreground">
                      {zone.ap_count} AP{zone.ap_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity</span>
                      <span>{zone.current_devices || 0} / {zone.max_capacity}</span>
                    </div>
                    <Progress value={usage} className="h-2" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
