import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Benefits } from '@/components/home/Benefits';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Benefits />
      <Categories />
      <FeaturedProducts />
    </Layout>
  );
};

export default Index;
