import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, Package, Check, ShieldCheck, Truck, Heart, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url ?? undefined,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Parcelamento simulado (até 10x ou mínimo de 50 reais)
  const maxInstallments = 10;
  const installmentValue = product ? product.price / maxInstallments : 0;
  
  // Preço Pix com 5% de desconto simulado
  const pixPrice = product ? product.price * 0.95 : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              <Skeleton className="aspect-square rounded-xl w-full" />
            </div>
            <div className="md:col-span-5 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Package className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-2xl font-display font-semibold">Produto não encontrado</h2>
            <p className="text-muted-foreground">O produto que você procura não existe ou foi removido.</p>
            <Button variant="outline" onClick={() => navigate('/produtos')}>
              Voltar para Loja
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12 bg-white">
        <div className="mb-6">
           <Button 
            variant="ghost" 
            className="pl-0 hover:pl-2 transition-all hover:bg-transparent"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex gap-4">
             {/* Thumbnails (Simulated for now as we only have 1 image) */}
             <div className="hidden md:flex flex-col gap-4 w-20 flex-shrink-0">
                <div className="aspect-square rounded-lg border-2 border-primary cursor-pointer overflow-hidden">
                  <img src={product.image_url || ''} className="w-full h-full object-cover" alt="Thumb" />
                </div>
                {/* Placeholders for other images if they existed */}
             </div>

             {/* Main Image */}
             <div className="flex-1 relative">
                <div className="aspect-[4/5] md:aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {product.image_url && !imageError ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply p-4"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Package className="h-24 w-24 text-muted-foreground/20" />
                  )}
                </div>
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-primary text-white hover:bg-primary/90 px-3 py-1 text-sm font-medium">
                    {discount}% OFF
                  </Badge>
                )}
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="h-6 w-6" />
                </button>
             </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="space-y-4">
              {product.categories && (
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {product.categories.name}
                </span>
              )}
              
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Price Section */}
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="space-y-1">
                   {product.original_price && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm line-through">
                      <span>R$ {product.original_price.toFixed(2).replace('.', ',')}</span>
                      <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="text-sm text-primary font-medium flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>no Pix (5% de desconto)</span>
                  </div>

                  <div className="pt-2 text-sm text-gray-600">
                    ou <span className="font-semibold text-gray-900">R$ {product.price.toFixed(2).replace('.', ',')}</span> em até <span className="font-semibold text-gray-900">{maxInstallments}x de R$ {installmentValue.toFixed(2).replace('.', ',')}</span> sem juros no cartão
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="pt-6 space-y-3">
                <Button 
                  size="xl" 
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
                  onClick={handleBuyNow}
                  disabled={!product.is_active || product.stock === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Esgotado' : 'Comprar Agora'}
                </Button>

                <Button 
                  size="xl" 
                  variant="outline"
                  className="w-full h-14 text-lg font-medium border-2"
                  onClick={handleAddToCart}
                  disabled={!product.is_active || product.stock === 0}
                >
                  Adicionar à Sacola
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-green-50 rounded-full text-green-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Compra Segura</p>
                    <p className="text-xs">Garantia de 7 dias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                     <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Entrega Garantida</p>
                    <p className="text-xs">Para todo o Brasil</p>
                  </div>
                </div>
              </div>

               <div className="text-xs text-gray-400 pt-4">
                  Vendido e entregue por <span className="font-semibold text-gray-600">Aura Boutique</span>
               </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Bottom Section: Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
           <div className="md:col-span-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Descrição</h3>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              </div>
           </div>

           <div className="md:col-span-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold mb-4">Características</h3>
                <div className="space-y-4">
                  {product.categories && (
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-500">Categoria</span>
                      <span className="font-medium text-gray-900">{product.categories.name}</span>
                    </div>
                  )}
                  {product.tags && product.tags.map((tag: string, index: number) => (
                     <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-gray-500">Característica</span>
                        <span className="font-medium text-gray-900 capitalize">{tag}</span>
                     </div>
                  ))}
                   <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-500">Marca</span>
                      <span className="font-medium text-gray-900">Aura Boutique</span>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
