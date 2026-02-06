export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bandwidth_logs: {
        Row: {
          active_devices: number | null
          download_mbps: number | null
          id: string
          recorded_at: string
          upload_mbps: number | null
          zone_id: string | null
        }
        Insert: {
          active_devices?: number | null
          download_mbps?: number | null
          id?: string
          recorded_at?: string
          upload_mbps?: number | null
          zone_id?: string | null
        }
        Update: {
          active_devices?: number | null
          download_mbps?: number | null
          id?: string
          recorded_at?: string
          upload_mbps?: number | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bandwidth_logs_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          bandwidth_used: number | null
          created_at: string
          device_name: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          last_seen: string | null
          mac_address: string
          network_user_id: string | null
          status: Database["public"]["Enums"]["device_status"] | null
          zone_id: string | null
        }
        Insert: {
          bandwidth_used?: number | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          mac_address: string
          network_user_id?: string | null
          status?: Database["public"]["Enums"]["device_status"] | null
          zone_id?: string | null
        }
        Update: {
          bandwidth_used?: number | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          mac_address?: string
          network_user_id?: string | null
          status?: Database["public"]["Enums"]["device_status"] | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_network_user_id_fkey"
            columns: ["network_user_id"]
            isOneToOne: false
            referencedRelation: "network_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      intrusion_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          device_id: string | null
          id: string
          resolved: boolean | null
          severity: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          device_id?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          device_id?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intrusion_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      network_users: {
        Row: {
          created_at: string
          default_zone_id: string | null
          department: string | null
          email: string | null
          full_name: string
          id: string
          last_seen: string | null
          password_hash: string | null
          status: string | null
          total_bandwidth_used: number | null
          user_type: string | null
          username: string
        }
        Insert: {
          created_at?: string
          default_zone_id?: string | null
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_seen?: string | null
          password_hash?: string | null
          status?: string | null
          total_bandwidth_used?: number | null
          user_type?: string | null
          username: string
        }
        Update: {
          created_at?: string
          default_zone_id?: string | null
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_seen?: string | null
          password_hash?: string | null
          status?: string | null
          total_bandwidth_used?: number | null
          user_type?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_users_default_zone_id_fkey"
            columns: ["default_zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wifi_sessions: {
        Row: {
          bytes_downloaded: number | null
          bytes_uploaded: number | null
          connected_at: string
          created_at: string
          device_id: string | null
          disconnected_at: string | null
          duration_minutes: number | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          network_user_id: string
          zone_id: string | null
        }
        Insert: {
          bytes_downloaded?: number | null
          bytes_uploaded?: number | null
          connected_at?: string
          created_at?: string
          device_id?: string | null
          disconnected_at?: string | null
          duration_minutes?: number | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          network_user_id: string
          zone_id?: string | null
        }
        Update: {
          bytes_downloaded?: number | null
          bytes_uploaded?: number | null
          connected_at?: string
          created_at?: string
          device_id?: string | null
          disconnected_at?: string | null
          duration_minutes?: number | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          network_user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_sessions_network_user_id_fkey"
            columns: ["network_user_id"]
            isOneToOne: false
            referencedRelation: "network_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_sessions_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          ap_count: number | null
          created_at: string
          current_devices: number | null
          id: string
          location: string
          max_capacity: number | null
          name: string
          status: Database["public"]["Enums"]["zone_status"] | null
        }
        Insert: {
          ap_count?: number | null
          created_at?: string
          current_devices?: number | null
          id?: string
          location: string
          max_capacity?: number | null
          name: string
          status?: Database["public"]["Enums"]["zone_status"] | null
        }
        Update: {
          ap_count?: number | null
          created_at?: string
          current_devices?: number | null
          id?: string
          location?: string
          max_capacity?: number | null
          name?: string
          status?: Database["public"]["Enums"]["zone_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      device_status: "online" | "offline" | "blocked" | "suspicious"
      zone_status: "active" | "inactive" | "maintenance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      device_status: ["online", "offline", "blocked", "suspicious"],
      zone_status: ["active", "inactive", "maintenance"],
    },
  },
} as const
