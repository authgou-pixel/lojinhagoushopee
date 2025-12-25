import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  zipCode: z.string().min(8, 'CEP inválido'),
  address: z.string().min(5, 'Endereço obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().min(2, 'Estado obrigatório'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<CheckoutFormData | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
    }
  });

  useEffect(() => {
    fetchPublicKey();
  }, []);

  const fetchPublicKey = async () => {
    try {
      const { data, error } = await supabase.rpc('get_mp_public_key');
      if (error) {
        console.error('Error fetching public key:', error);
        return;
      }
      if (data) {
        setMpPublicKey(data);
        initMercadoPago(data, { locale: 'pt-BR' });
      }
    } catch (error) {
      console.error('Error initializing MP:', error);
    }
  };

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  const onShippingSubmit = (data: CheckoutFormData) => {
    setShippingData(data);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setLoading(true);
    try {
      const { formData } = paymentData;
      
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: `Pedido na Aura Boutique - ${items.length} itens`,
          notification_url: window.location.origin + '/api/webhooks/mercadopago',
          payer: {
            email: shippingData?.email,
            first_name: shippingData?.fullName.split(' ')[0],
            last_name: shippingData?.fullName.split(' ').slice(1).join(' '),
            identification: {
              type: 'CPF',
              number: shippingData?.cpf.replace(/\D/g, '')
            },
            address: {
              zip_code: shippingData?.zipCode,
              street_name: shippingData?.address,
              street_number: shippingData?.number,
              neighborhood: shippingData?.neighborhood,
              city: shippingData?.city,
              federal_unit: shippingData?.state
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }

      toast.success('Pagamento processado com sucesso!');
      clearCart();
      navigate('/meus-pedidos');
      
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento: ' + (error.message || 'Tente novamente'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment Brick Error:', error);
    toast.error('Ocorreu um erro no módulo de pagamento.');
  };

  return (
    <Layout>
      <div className="container-elegant py-8 md:py-12">
        <Button 
          variant="ghost" 
          onClick={() => step === 'payment' ? setStep('shipping') : navigate('/carrinho')}
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 'payment' ? 'Voltar para Endereço' : 'Voltar para o Carrinho'}
        </Button>

        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 'shipping' ? 'border-primary bg-primary/10' : 'border-border'}`}>1</div>
                <span>Entrega</span>
              </div>
              <div className="h-[1px] flex-1 bg-border" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 'payment' ? 'border-primary bg-primary/10' : 'border-border'}`}>2</div>
                <span>Pagamento</span>
              </div>
            </div>

            {step === 'shipping' ? (
              <form id="shipping-form" onSubmit={handleSubmit(onShippingSubmit)} className="space-y-8">
                {/* Personal Info */}
                <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Dados Pessoais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input id="fullName" {...register('fullName')} />
                      {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register('email')} />
                      {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" {...register('phone')} />
                      {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" {...register('cpf')} />
                      {errors.cpf && <p className="text-destructive text-sm">{errors.cpf.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Endereço de Entrega</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input id="zipCode" {...register('zipCode')} />
                      {errors.zipCode && <p className="text-destructive text-sm">{errors.zipCode.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input id="address" {...register('address')} />
                      {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input id="number" {...register('number')} />
                      {errors.number && <p className="text-destructive text-sm">{errors.number.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" {...register('complement')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input id="neighborhood" {...register('neighborhood')} />
                      {errors.neighborhood && <p className="text-destructive text-sm">{errors.neighborhood.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" {...register('city')} />
                      {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" {...register('state')} />
                      {errors.state && <p className="text-destructive text-sm">{errors.state.message}</p>}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Pagamento</h2>
                {mpPublicKey ? (
                  <Payment
                    initialization={{ amount: total }}
                    customization={{
                      paymentMethods: {
                        ticket: 'all',
                        bankTransfer: 'all',
                        creditCard: 'all',
                        debitCard: 'all',
                        mercadopago: 'all',
                      },
                    }}
                    onSubmit={handlePaymentSubmit}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      O sistema de pagamentos ainda não foi configurado.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Por favor, entre em contato com o administrador ou configure as chaves do Mercado Pago no painel administrativo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 text-sm">
                    <div className="w-12 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                       {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      <p className="text-muted-foreground">{item.quantity}x R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {step === 'shipping' && (
                <Button 
                  type="submit" 
                  form="shipping-form"
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  Continuar para Pagamento
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
