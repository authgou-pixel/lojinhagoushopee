import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ArrowRight } from 'lucide-react';

export default function Orders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container-elegant py-20 text-center">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-elegant py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Meus Pedidos
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o status das suas compras
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Você ainda não fez nenhuma compra. Explore nossa loja e encontre produtos incríveis!
            </p>
            <Button variant="champagne" asChild>
              <Link to="/produtos">
                Explorar Produtos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
