-- Create table to track WiFi sessions (when users connect/disconnect)
CREATE TABLE public.wifi_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network_user_id UUID REFERENCES public.network_users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN disconnected_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (disconnected_at - connected_at)) / 60
      ELSE NULL
    END
  ) STORED,
  bytes_downloaded BIGINT DEFAULT 0,
  bytes_uploaded BIGINT DEFAULT 0,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wifi_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wifi_sessions
CREATE POLICY "Authenticated users can view wifi sessions"
ON public.wifi_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert wifi sessions"
ON public.wifi_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update wifi sessions"
ON public.wifi_sessions FOR UPDATE
TO authenticated
USING (true);

-- Add password hash column to network_users for WiFi portal login
ALTER TABLE public.network_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS default_zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL;

-- Create index for faster session queries
CREATE INDEX idx_wifi_sessions_user_id ON public.wifi_sessions(network_user_id);
CREATE INDEX idx_wifi_sessions_active ON public.wifi_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_wifi_sessions_connected_at ON public.wifi_sessions(connected_at DESC);

-- Enable realtime for wifi_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.wifi_sessions;