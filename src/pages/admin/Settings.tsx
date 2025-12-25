import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const settingsSchema = z.object({
  mp_public_key: z.string().optional(),
  mp_access_token: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        reset({
          mp_public_key: data.mp_public_key || '',
          mp_access_token: data.mp_access_token || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    try {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('store_settings')
        .select('id')
        .single();

      let error;

      if (existingSettings) {
        const { error: updateError } = await supabase
          .from('store_settings')
          .update(data)
          .eq('id', existingSettings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('store_settings')
          .insert([data]);
        error = insertError;
      }

      if (error) throw error;

      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua loja</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integração Mercado Pago</CardTitle>
            <CardDescription>
              Configure suas credenciais do Mercado Pago para receber pagamentos.
              Você pode encontrar essas chaves no painel de desenvolvedor do Mercado Pago.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mp_public_key">Public Key (Chave Pública)</Label>
                <Input
                  id="mp_public_key"
                  placeholder="APP_USR-..."
                  {...register('mp_public_key')}
                />
                <p className="text-sm text-muted-foreground">
                  Usada para processar pagamentos no frontend.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mp_access_token">Access Token (Token de Acesso)</Label>
                <Input
                  id="mp_access_token"
                  type="password"
                  placeholder="APP_USR-..."
                  {...register('mp_access_token')}
                />
                <p className="text-sm text-muted-foreground">
                  Usada para criar preferências e processar pagamentos seguros. Mantenha em segredo.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
