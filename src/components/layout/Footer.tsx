import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="container-elegant py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-3xl font-semibold text-champagne">
                Essência
              </span>
            </Link>
            <p className="text-cream/70 font-body text-sm max-w-md leading-relaxed">
              Descubra fragrâncias e produtos de cuidados pessoais de alta qualidade.
              Trabalhamos com as melhores marcas para trazer sofisticação ao seu dia a dia.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-champagne/20 transition-colors"
              >
                <Instagram className="h-5 w-5 text-champagne" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-champagne/20 transition-colors"
              >
                <Facebook className="h-5 w-5 text-champagne" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-champagne mb-4">
              Links Úteis
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/produtos"
                  className="text-cream/70 hover:text-champagne transition-colors text-sm"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias"
                  className="text-cream/70 hover:text-champagne transition-colors text-sm"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre"
                  className="text-cream/70 hover:text-champagne transition-colors text-sm"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-champagne mb-4">
              Contato
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contato@essencia.com"
                  className="flex items-center gap-2 text-cream/70 hover:text-champagne transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  contato@essencia.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+5511999999999"
                  className="flex items-center gap-2 text-cream/70 hover:text-champagne transition-colors text-sm"
                >
                  <Phone className="h-4 w-4" />
                  (11) 99999-9999
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-12 pt-8 text-center">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Essência. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
