-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mp_public_key TEXT,
  mp_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Only allow admin to manage settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage store settings"
  ON public.store_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert a default row if not exists
INSERT INTO public.store_settings (mp_public_key, mp_access_token)
SELECT '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);
