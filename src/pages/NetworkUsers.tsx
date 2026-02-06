import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Ban, Check, Clock, Download, Wifi } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNetworkUsers, useAddNetworkUser, useUpdateNetworkUser, useDeleteNetworkUser, useZones } from '@/hooks/useNetworkData';
import { useUserUsageStats, formatBytes, formatDuration } from '@/hooks/useWifiSessions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function NetworkUsers() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    department: '',
    user_type: 'student',
    status: 'active',
    default_zone_id: '',
  });

  const { data: users, isLoading } = useNetworkUsers();
  const { data: zones } = useZones();
  const { data: usageStats } = useUserUsageStats();
  const addUser = useAddNetworkUser();
  const updateUser = useUpdateNetworkUser();
  const deleteUser = useDeleteNetworkUser();

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Get usage stats for a user
  const getUserStats = (userId: string) => {
    return usageStats?.find(s => s.network_user_id === userId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        default_zone_id: formData.default_zone_id || null,
      };
      
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, ...data });
        toast.success('User updated successfully');
      } else {
        await addUser.mutateAsync(data);
        toast.success('User added successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.full_name,
      email: user.email || '',
      department: user.department || '',
      user_type: user.user_type || 'student',
      status: user.status || 'active',
      default_zone_id: user.default_zone_id || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser.mutateAsync(id);
        toast.success('User deleted successfully');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleBlock = async (user: any) => {
    try {
      await updateUser.mutateAsync({ 
        id: user.id, 
        status: user.status === 'blocked' ? 'active' : 'blocked' 
      });
      toast.success(user.status === 'blocked' ? 'User unblocked' : 'User blocked');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      email: '',
      department: '',
      user_type: 'student',
      status: 'active',
      default_zone_id: '',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Network Users
            </h1>
            <p className="text-muted-foreground">Manage WiFi users and their access</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="john.doe"
                    className="input-dark"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="input-dark"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@bbuc.edu"
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science"
                    className="input-dark"
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <Select value={formData.user_type} onValueChange={(v) => setFormData({ ...formData, user_type: v })}>
                    <SelectTrigger className="input-dark">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Zone (for WiFi login)</Label>
                  <Select 
                    value={formData.default_zone_id} 
                    onValueChange={(v) => setFormData({ ...formData, default_zone_id: v })}
                  >
                    <SelectTrigger className="input-dark">
                      <SelectValue placeholder="Select default zone (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {zones?.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gradient-primary" disabled={addUser.isPending || updateUser.isPending}>
                    {editingUser ? 'Update' : 'Add User'}
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
            placeholder="Search users..."
            className="pl-10 input-dark"
          />
        </div>

        {/* Users Table */}
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
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">WiFi Usage</th>
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
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const stats = getUserStats(user.id);
                    return (
                      <tr key={user.id} className="table-row">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              stats?.active_sessions ? 'bg-status-online/20' : 'bg-primary/20'
                            }`}>
                              <span className={`font-medium ${
                                stats?.active_sessions ? 'text-status-online' : 'text-primary'
                              }`}>
                                {user.full_name[0]}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.full_name}</p>
                                {stats?.active_sessions ? (
                                  <span className="flex items-center gap-1 text-xs text-status-online">
                                    <Wifi className="w-3 h-3" />
                                    Online
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{user.department || '-'}</td>
                        <td className="py-4 px-4 capitalize">{user.user_type}</td>
                        <td className="py-4 px-4">
                          {stats ? (
                            <div className="flex flex-col gap-1 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {formatDuration(stats.total_time_minutes)}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Download className="w-3 h-3" />
                                {formatBytes(stats.total_bytes_downloaded)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={user.status === 'blocked' ? 'blocked' : 'active'} />
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {user.last_seen ? format(new Date(user.last_seen), 'MMM d, HH:mm') : 'Never'}
                        </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlock(user)}>
                              {user.status === 'blocked' ? (
                                <><Check className="w-4 h-4 mr-2" /> Unblock</>
                              ) : (
                                <><Ban className="w-4 h-4 mr-2" /> Block</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
