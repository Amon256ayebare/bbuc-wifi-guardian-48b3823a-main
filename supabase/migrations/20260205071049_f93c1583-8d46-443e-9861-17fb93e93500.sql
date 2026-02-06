-- Allow public/anonymous access to view zones for the WiFi captive portal
CREATE POLICY "Anyone can view zones" 
ON public.zones 
FOR SELECT 
USING (true);
