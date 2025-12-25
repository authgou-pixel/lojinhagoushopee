import { Link } from 'react-router-dom';
import { ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    original_price?: number | null;
    image_url?: string | null;
    categories?: { name: string; slug: string } | null;
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url ?? undefined,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative aspect-square rounded-2xl bg-muted/50 overflow-hidden mb-4 shadow-soft group-hover:shadow-medium transition-all duration-300">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            variant="champagne"
            className="w-full"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {product.categories && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.categories.name}
          </p>
        )}
        <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body font-semibold text-foreground">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {product.original_price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
