import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WifiSession {
  id: string;
  network_user_id: string;
  device_id: string | null;
  zone_id: string | null;
  connected_at: string;
  disconnected_at: string | null;
  duration_minutes: number | null;
  bytes_downloaded: number;
  bytes_uploaded: number;
  ip_address: string | null;
  is_active: boolean;
  created_at: string;
  network_users?: {
    username: string;
    full_name: string;
    department: string | null;
  };
  devices?: {
    mac_address: string;
    device_name: string | null;
    device_type: string | null;
  };
  zones?: {
    name: string;
  };
}

interface UserUsageStats {
  network_user_id: string;
  full_name: string;
  username: string;
  department: string | null;
  total_sessions: number;
  total_time_minutes: number;
  total_bytes_downloaded: number;
  total_bytes_uploaded: number;
  active_sessions: number;
  last_connected: string | null;
}

// Get all WiFi sessions with relations
export function useWifiSessions() {
  return useQuery({
    queryKey: ['wifi-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wifi_sessions')
        .select(`
          *,
          network_users (username, full_name, department),
          devices (mac_address, device_name, device_type),
          zones (name)
        `)
        .order('connected_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as WifiSession[];
    },
  });
}

// Get active sessions only
export function useActiveSessions() {
  return useQuery({
    queryKey: ['wifi-sessions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wifi_sessions')
        .select(`
          *,
          network_users (username, full_name, department),
          devices (mac_address, device_name, device_type),
          zones (name)
        `)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });
      if (error) throw error;
      return data as WifiSession[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Get sessions for a specific user
export function useUserSessions(userId: string | null) {
  return useQuery({
    queryKey: ['wifi-sessions', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('wifi_sessions')
        .select(`
          *,
          devices (mac_address, device_name, device_type),
          zones (name)
        `)
        .eq('network_user_id', userId)
        .order('connected_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as WifiSession[];
    },
    enabled: !!userId,
  });
}

// Get usage statistics per user
export function useUserUsageStats() {
  return useQuery({
    queryKey: ['user-usage-stats'],
    queryFn: async () => {
      // Fetch all network users first
      const { data: users, error: usersError } = await supabase
        .from('network_users')
        .select('id, username, full_name, department');
      if (usersError) throw usersError;

      // Fetch all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('wifi_sessions')
        .select('*');
      if (sessionsError) throw sessionsError;

      // Calculate stats per user
      const stats: UserUsageStats[] = users.map(user => {
        const userSessions = sessions.filter(s => s.network_user_id === user.id);
        const activeSessions = userSessions.filter(s => s.is_active);
        
        const totalTimeMinutes = userSessions.reduce((acc, s) => {
          if (s.duration_minutes) return acc + s.duration_minutes;
          if (s.is_active) {
            // Calculate ongoing session time
            const connectedAt = new Date(s.connected_at);
            const now = new Date();
            return acc + Math.floor((now.getTime() - connectedAt.getTime()) / 60000);
          }
          return acc;
        }, 0);

        const totalBytesDownloaded = userSessions.reduce((acc, s) => acc + (s.bytes_downloaded || 0), 0);
        const totalBytesUploaded = userSessions.reduce((acc, s) => acc + (s.bytes_uploaded || 0), 0);

        const lastSession = userSessions.length > 0 
          ? userSessions.reduce((latest, s) => 
              new Date(s.connected_at) > new Date(latest.connected_at) ? s : latest
            )
          : null;

        return {
          network_user_id: user.id,
          full_name: user.full_name,
          username: user.username,
          department: user.department,
          total_sessions: userSessions.length,
          total_time_minutes: totalTimeMinutes,
          total_bytes_downloaded: totalBytesDownloaded,
          total_bytes_uploaded: totalBytesUploaded,
          active_sessions: activeSessions.length,
          last_connected: lastSession?.connected_at || null,
        };
      });

      return stats;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// Connect a user (start session)
export function useConnectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      network_user_id, 
      device_id, 
      zone_id, 
      ip_address 
    }: { 
      network_user_id: string; 
      device_id?: string; 
      zone_id?: string; 
      ip_address?: string;
    }) => {
      const { data, error } = await supabase
        .from('wifi_sessions')
        .insert({
          network_user_id,
          device_id: device_id || null,
          zone_id: zone_id || null,
          ip_address: ip_address || null,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      
      // Update device status to online
      if (device_id) {
        await supabase
          .from('devices')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('id', device_id);
      }
      
      // Update network user last_seen
      await supabase
        .from('network_users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', network_user_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['network-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// Disconnect a user (end session)
export function useDisconnectUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      session_id, 
      bytes_downloaded = 0, 
      bytes_uploaded = 0 
    }: { 
      session_id: string; 
      bytes_downloaded?: number;
      bytes_uploaded?: number;
    }) => {
      // Get session to find device
      const { data: session } = await supabase
        .from('wifi_sessions')
        .select('device_id, bytes_downloaded, bytes_uploaded')
        .eq('id', session_id)
        .single();

      const { data, error } = await supabase
        .from('wifi_sessions')
        .update({
          disconnected_at: new Date().toISOString(),
          is_active: false,
          bytes_downloaded: (session?.bytes_downloaded || 0) + bytes_downloaded,
          bytes_uploaded: (session?.bytes_uploaded || 0) + bytes_uploaded,
        })
        .eq('id', session_id)
        .select()
        .single();
      if (error) throw error;
      
      // Update device status to offline
      if (session?.device_id) {
        await supabase
          .from('devices')
          .update({ status: 'offline' })
          .eq('id', session.device_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['user-usage-stats'] });
    },
  });
}

// Update session bandwidth
export function useUpdateSessionBandwidth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      session_id, 
      bytes_downloaded, 
      bytes_uploaded 
    }: { 
      session_id: string; 
      bytes_downloaded: number;
      bytes_uploaded: number;
    }) => {
      const { data, error } = await supabase
        .from('wifi_sessions')
        .update({
          bytes_downloaded,
          bytes_uploaded,
        })
        .eq('id', session_id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['user-usage-stats'] });
    },
  });
}

// Helper function to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours < 24) return `${hours}h ${remainingMinutes}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}
