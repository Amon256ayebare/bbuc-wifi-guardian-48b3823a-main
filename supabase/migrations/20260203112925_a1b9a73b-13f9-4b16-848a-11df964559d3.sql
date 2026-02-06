-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for device status
CREATE TYPE public.device_status AS ENUM ('online', 'offline', 'blocked', 'suspicious');

-- Create enum for zone status
CREATE TYPE public.zone_status AS ENUM ('active', 'inactive', 'maintenance');

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create network_users table (WiFi users being monitored)
CREATE TABLE public.network_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  user_type TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_bandwidth_used BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create devices table
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  device_name TEXT,
  device_type TEXT DEFAULT 'unknown',
  network_user_id UUID REFERENCES public.network_users(id) ON DELETE SET NULL,
  status device_status DEFAULT 'offline',
  zone_id UUID,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bandwidth_used BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create zones table (access points / network zones)
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  ap_count INTEGER DEFAULT 1,
  status zone_status DEFAULT 'active',
  max_capacity INTEGER DEFAULT 100,
  current_devices INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add foreign key for zone_id in devices
ALTER TABLE public.devices ADD CONSTRAINT devices_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id) ON DELETE SET NULL;

-- Create bandwidth_logs table for tracking
CREATE TABLE public.bandwidth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  download_mbps DECIMAL(10,2) DEFAULT 0,
  upload_mbps DECIMAL(10,2) DEFAULT 0,
  active_devices INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create intrusion_alerts table
CREATE TABLE public.intrusion_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bandwidth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_alerts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for network_users (admins can manage)
CREATE POLICY "Authenticated users can view network users" ON public.network_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert network users" ON public.network_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update network users" ON public.network_users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete network users" ON public.network_users FOR DELETE TO authenticated USING (true);

-- RLS Policies for devices
CREATE POLICY "Authenticated users can view devices" ON public.devices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert devices" ON public.devices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update devices" ON public.devices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete devices" ON public.devices FOR DELETE TO authenticated USING (true);

-- RLS Policies for zones
CREATE POLICY "Authenticated users can view zones" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert zones" ON public.zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update zones" ON public.zones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete zones" ON public.zones FOR DELETE TO authenticated USING (true);

-- RLS Policies for bandwidth_logs
CREATE POLICY "Authenticated users can view bandwidth logs" ON public.bandwidth_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bandwidth logs" ON public.bandwidth_logs FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for intrusion_alerts
CREATE POLICY "Authenticated users can view alerts" ON public.intrusion_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON public.intrusion_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON public.intrusion_alerts FOR UPDATE TO authenticated USING (true);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();