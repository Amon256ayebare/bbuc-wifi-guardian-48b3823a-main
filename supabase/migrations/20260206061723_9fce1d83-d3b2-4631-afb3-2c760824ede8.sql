-- Allow public access to lookup network users by username (for WiFi portal login)
CREATE POLICY "Anyone can lookup network users by username" 
ON public.network_users 
FOR SELECT 
USING (true);

-- Allow public access to insert devices (for WiFi portal device registration)
CREATE POLICY "Anyone can register devices via WiFi portal" 
ON public.devices 
FOR INSERT 
WITH CHECK (true);

-- Allow public access to insert wifi sessions (for WiFi portal connection)
CREATE POLICY "Anyone can create wifi sessions via portal" 
ON public.wifi_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow public access to update wifi sessions (for disconnect functionality)
CREATE POLICY "Anyone can update wifi sessions via portal" 
ON public.wifi_sessions 
FOR UPDATE 
USING (true);