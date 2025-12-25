import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, Package, Check, ShieldCheck, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

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

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container-elegant py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
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
        <div className="container-elegant py-20 text-center">
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
      <div className="container-elegant py-8 md:py-16">
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 hover:pl-2 transition-all"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="relative animate-fade-in">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted/30 border border-border/50 shadow-soft">
              {product.image_url && !imageError ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Package className="h-24 w-24 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {discount > 0 && (
              <div className="absolute top-6 left-6">
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  -{discount}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-6">
              <div>
                {product.categories && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">
                      {product.categories.name}
                    </span>
                  </div>
                )}
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                  {product.name}
                </h1>
                <div className="flex items-end gap-4">
                  <span className="text-3xl font-body font-semibold text-foreground">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through mb-1">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-sm text-muted-foreground">
                <p>{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border/50 space-y-6">
                <Button 
                  size="xl" 
                  className="w-full text-lg gap-3"
                  onClick={handleAddToCart}
                  disabled={!product.is_active || product.stock === 0}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                </Button>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Garantia de qualidade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Entrega rápida</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
