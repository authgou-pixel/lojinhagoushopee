
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state?.payment;
  const [currentStatus, setCurrentStatus] = useState(payment?.status || 'pending');

  useEffect(() => {
    if (!payment) {
      navigate('/meus-pedidos');
      return;
    }

    // Subscribe to realtime updates for this order
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `mercado_pago_payment_id=eq.${payment.id}`,
        },
        (payload) => {
          const newStatus = payload.new.payment_status;
          if (newStatus) {
            setCurrentStatus(newStatus);
            if (newStatus === 'approved') {
                toast.success('Pagamento aprovado!');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [payment, navigate]);

  if (!payment) return null;

  const isPix = payment.payment_method_id === 'pix';
  const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
  const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;
  const ticketUrl = payment.transaction_details?.external_resource_url;

  const copyPixCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('Código Pix copiado!');
    }
  };

  const isApproved = currentStatus === 'approved';

  return (
    <Layout>
      <div className="container-elegant py-12 md:py-24">
        <div className="max-w-2xl mx-auto bg-card rounded-xl border border-border/50 shadow-soft p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {isApproved ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                  <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              )}
            </div>
          </div>

          <h1 className="font-display text-3xl font-semibold mb-4">
            {isApproved ? 'Pagamento Aprovado!' : 'Aguardando Pagamento'}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Seu pedido #{payment.id} foi registrado com sucesso.
          </p>

          {!isApproved && isPix && qrCode && (
            <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
              <h3 className="font-semibold mb-4">Pagamento via Pix</h3>
              
              {qrCodeBase64 && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain mix-blend-multiply"
                  />
                </div>
              )}

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Copie o código abaixo se não conseguir ler o QR Code:
                </p>
                
                <div className="flex gap-2">
                  <code className="flex-1 bg-background border border-border rounded p-3 text-xs break-all text-left overflow-hidden">
                    {qrCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyPixCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {payment.payment_method_id === 'ticket' && ticketUrl && (
             <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
              <h3 className="font-semibold mb-4">Boleto Bancário</h3>
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para visualizar e imprimir seu boleto.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visualizar Boleto
                </a>
              </Button>
             </div>
          )}

          <div className="space-y-4">
            <div className={`p-4 rounded-lg text-sm flex items-start gap-3 text-left ${isApproved ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Status do Pagamento: {translateStatus(currentStatus)}</p>
                <p className="mt-1 opacity-90">
                    {isApproved 
                        ? 'Seu pagamento foi confirmado. Estamos preparando seu pedido!' 
                        : 'Assim que você realizar o pagamento, a confirmação aparecerá aqui automaticamente.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button onClick={() => navigate('/meus-pedidos')} variant="outline" className="w-full sm:w-auto">
                Meus Pedidos
              </Button>
              <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function translateStatus(status: string) {
  const statusMap: Record<string, string> = {
    approved: 'Aprovado',
    pending: 'Pendente',
    in_process: 'Em processamento',
    rejected: 'Rejeitado',
    refunded: 'Reembolsado',
    cancelled: 'Cancelado',
    in_mediation: 'Em mediação',
    charged_back: 'Estornado'
  };
  return statusMap[status] || status;
}
