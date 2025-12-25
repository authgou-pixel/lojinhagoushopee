import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-elegant py-20 md:py-32">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-muted-foreground mb-8">
              Explore nossa coleção de produtos e encontre algo especial para você.
            </p>
            <Link to="/produtos">
              <Button variant="champagne" size="lg">
                Ver Produtos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-elegant py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Carrinho de Compras
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-soft"
              >
                <div className="w-24 h-24 rounded-lg bg-muted/50 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-medium text-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="text-foreground">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-foreground">Calculado no checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-display text-lg font-semibold text-foreground">
                    Total
                  </span>
                  <span className="font-display text-lg font-semibold text-foreground">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="block">
                <Button variant="champagne" className="w-full" size="lg">
                  Finalizar Compra
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <Link to="/produtos" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
