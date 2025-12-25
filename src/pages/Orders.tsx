import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ArrowRight, Calendar, CreditCard, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
}

export default function Orders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, loading, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
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

          {orders.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl border border-border/50 shadow-soft p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">Pedido #{order.id.slice(0, 8)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.payment_status === 'approved' ? 'bg-green-100 text-green-700' :
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.payment_status === 'approved' ? 'Aprovado' :
                           order.status === 'completed' ? 'Concluído' :
                           order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="font-semibold text-lg">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-end">
                        <CreditCard className="h-4 w-4" />
                        {order.payment_status === 'approved' ? 'Pago' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
