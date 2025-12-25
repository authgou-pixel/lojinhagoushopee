import { Truck, Shield, CreditCard, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Entrega Rápida',
    description: 'Envio para todo o Brasil com rastreamento',
  },
  {
    icon: Shield,
    title: 'Produtos Originais',
    description: 'Garantia de autenticidade em todos os produtos',
  },
  {
    icon: CreditCard,
    title: 'Pagamento Seguro',
    description: 'Pix e cartão de crédito via Mercado Pago',
  },
  {
    icon: Headphones,
    title: 'Atendimento',
    description: 'Suporte personalizado para suas dúvidas',
  },
];

export function Benefits() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container-elegant">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-14 w-14 rounded-full bg-champagne/10 flex items-center justify-center text-champagne mb-4">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
