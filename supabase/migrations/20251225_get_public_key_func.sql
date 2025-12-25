-- Function to get the public key safely
CREATE OR REPLACE FUNCTION public.get_mp_public_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key TEXT;
BEGIN
  SELECT mp_public_key INTO key FROM public.store_settings LIMIT 1;
  RETURN key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_mp_public_key() TO anon, authenticated, service_role;
