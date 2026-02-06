import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NetworkUser = Database['public']['Tables']['network_users']['Row'];
type Device = Database['public']['Tables']['devices']['Row'];
type Zone = Database['public']['Tables']['zones']['Row'];
type BandwidthLog = Database['public']['Tables']['bandwidth_logs']['Row'];
type IntrusionAlert = Database['public']['Tables']['intrusion_alerts']['Row'];

// Network Users
export function useNetworkUsers() {
  return useQuery({
    queryKey: ['network-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as NetworkUser[];
    },
  });
}

export function useAddNetworkUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: {
      username: string;
      full_name: string;
      email?: string;
      department?: string;
      user_type?: string;
      status?: string;
      default_zone_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('network_users')
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-users'] });
    },
  });
}

export function useUpdateNetworkUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NetworkUser> & { id: string }) => {
      const { data, error } = await supabase
        .from('network_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-users'] });
    },
  });
}

export function useDeleteNetworkUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('network_users').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-users'] });
    },
  });
}

// Devices
export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          network_users (username, full_name),
          zones (name)
        `)
        .order('last_seen', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (device: Omit<Device, 'id' | 'created_at' | 'last_seen' | 'bandwidth_used'>) => {
      const { data, error } = await supabase
        .from('devices')
        .insert(device)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Device> & { id: string }) => {
      const { data, error } = await supabase
        .from('devices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

// Zones
export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Zone[];
    },
  });
}

export function useAddZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zone: Omit<Zone, 'id' | 'created_at' | 'current_devices'>) => {
      const { data, error } = await supabase
        .from('zones')
        .insert(zone)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Zone> & { id: string }) => {
      const { data, error } = await supabase
        .from('zones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

// Bandwidth Logs
export function useBandwidthLogs() {
  return useQuery({
    queryKey: ['bandwidth-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bandwidth_logs')
        .select(`
          *,
          zones (name)
        `)
        .order('recorded_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useAddBandwidthLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<BandwidthLog, 'id' | 'recorded_at'>) => {
      const { data, error } = await supabase
        .from('bandwidth_logs')
        .insert(log)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bandwidth-logs'] });
    },
  });
}

// Intrusion Alerts
export function useIntrusionAlerts() {
  return useQuery({
    queryKey: ['intrusion-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intrusion_alerts')
        .select(`
          *,
          devices (mac_address, device_name, ip_address)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddIntrusionAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alert: Omit<IntrusionAlert, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('intrusion_alerts')
        .insert(alert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intrusion-alerts'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('intrusion_alerts')
        .update({ resolved: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intrusion-alerts'] });
    },
  });
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [usersRes, devicesRes, zonesRes, alertsRes] = await Promise.all([
        supabase.from('network_users').select('id, status', { count: 'exact' }),
        supabase.from('devices').select('id, status', { count: 'exact' }),
        supabase.from('zones').select('id, status', { count: 'exact' }),
        supabase.from('intrusion_alerts').select('id, resolved', { count: 'exact' }).eq('resolved', false),
      ]);

      const devices = devicesRes.data || [];
      const onlineDevices = devices.filter(d => d.status === 'online').length;

      return {
        totalUsers: usersRes.count || 0,
        totalDevices: devicesRes.count || 0,
        onlineDevices,
        totalZones: zonesRes.count || 0,
        unresolvedAlerts: alertsRes.count || 0,
      };
    },
  });
}
