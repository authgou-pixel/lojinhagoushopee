-- Add new columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.product_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  changes JSONB, -- Store what changed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.product_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit logs
CREATE POLICY "Admins can view audit logs" ON public.product_audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit logs" ON public.product_audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for products if it doesn't exist (This usually needs to be done via API/Dashboard, but we can set policies)
-- Assuming bucket 'products' exists or will be created.

-- Storage Policies (You need to create the 'products' bucket in Storage > Buckets)
-- We can't create buckets via SQL easily in standard Supabase without extensions, 
-- but we can define policies for the 'storage.objects' table targeting the 'products' bucket.

CREATE POLICY "Public Access to Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND public.has_role(auth.uid(), 'admin'));
