import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Sparkles, Heart, Wind, Gift } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  perfumes: <Sparkles className="h-8 w-8" />,
  hidratantes: <Droplets className="h-8 w-8" />,
  sabonetes: <Heart className="h-8 w-8" />,
  desodorantes: <Wind className="h-8 w-8" />,
  kits: <Gift className="h-8 w-8" />,
};

export function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 md:py-28 gradient-elegant">
      <div className="container-elegant">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Categorias
          </h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Explore nossa seleção de produtos organizados por categoria
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))
          ) : (
            categories?.map((category, index) => (
              <Link
                key={category.id}
                to={`/produtos?categoria=${category.slug}`}
                className="group relative aspect-square rounded-2xl bg-card border border-border/50 overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-champagne/10 flex items-center justify-center text-champagne mb-4 group-hover:scale-110 transition-transform duration-300">
                    {categoryIcons[category.slug] || <Sparkles className="h-8 w-8" />}
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 bg-champagne/0 group-hover:bg-champagne/5 transition-colors duration-300" />
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
