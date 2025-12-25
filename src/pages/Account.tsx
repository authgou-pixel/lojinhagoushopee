import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Package, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Você saiu da sua conta');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao sair da conta');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-elegant py-20 text-center">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container-elegant py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
              Minha Conta
            </h1>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Profile Card */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-champagne/10 flex items-center justify-center text-champagne mb-4">
                  <User className="h-10 w-10" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-1">
                  {user.user_metadata?.full_name || 'Usuário'}
                </h2>
                <p className="text-sm text-muted-foreground break-all">
                  {user.email}
                </p>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/meus-pedidos">
                    <Package className="h-4 w-4" />
                    Meus Pedidos
                  </Link>
                </Button>
                {/* Add more account links here if needed */}
              </div>
            </div>

            {/* Recent Activity or Welcome Message */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-6">
                <h3 className="font-display text-lg font-semibold mb-4">
                  Bem-vindo(a) de volta!
                </h3>
                <p className="text-muted-foreground">
                  Aqui você pode gerenciar seus pedidos e informações da conta.
                  Se precisar de ajuda, entre em contato com nosso suporte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
