-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'Sistema em manutenção. Por favor, aguarde.'),
  ('group_dialog_text', 'Entre no nosso grupo VIP!'),
  ('group_dialog_link', 'https://chat.whatsapp.com/example'),
  ('voice_enabled', 'false'),
  ('admin_code', 'KLEIN');

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read for non-sensitive settings
CREATE POLICY "Public can read non-sensitive settings" 
ON public.admin_settings 
FOR SELECT 
USING (setting_key NOT IN ('admin_code'));

-- Allow anyone to update settings (we'll validate admin code in app)
CREATE POLICY "Anyone can update settings with valid code" 
ON public.admin_settings 
FOR UPDATE 
USING (true);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER update_admin_settings_timestamp
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_admin_settings_updated_at();