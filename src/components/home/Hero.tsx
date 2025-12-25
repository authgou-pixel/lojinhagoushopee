import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden gradient-hero">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-champagne/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-champagne/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-elegant relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <Sparkles className="h-5 w-5 text-champagne" />
            <span className="text-champagne font-body text-sm tracking-widest uppercase">
              Perfumaria & Cuidados Pessoais
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-cream leading-tight mb-6 animate-fade-in-up">
            Descubra sua
            <span className="block text-champagne">Essência</span>
          </h1>

          <p className="text-cream/80 font-body text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Fragrâncias sofisticadas e produtos de cuidados pessoais
            das melhores marcas, selecionados especialmente para você.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/produtos">
              <Button variant="hero" size="xl">
                Ver Produtos
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/categorias">
              <Button variant="hero-outline" size="xl">
                Explorar Categorias
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
