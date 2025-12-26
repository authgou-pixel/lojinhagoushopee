import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categories = [
  { name: 'Perfumes', slug: 'perfumes' },
  { name: 'Hidratantes', slug: 'hidratantes' },
  { name: 'Sabonetes', slug: 'sabonetes' },
  { name: 'Desodorantes', slug: 'desodorantes' },
  { name: 'Kits', slug: 'kits' },
];

export function Header() {
  const { itemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container-elegant">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-wide">
              GouShopee
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Início
            </Link>
            <Link
              to="/produtos"
              className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Produtos
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 outline-none">
                Categorias <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-white/95 backdrop-blur-md border-border/50">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link 
                      to={`/produtos?categoria=${category.slug}`}
                      className="cursor-pointer w-full"
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/categorias" className="cursor-pointer w-full font-medium">
                    Ver todas as categorias
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/sobre"
              className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/carrinho" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5 text-primary" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[100]">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.user_metadata?.full_name && (
                        <p className="font-medium">{user.user_metadata.full_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Minha Conta</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-pedidos" className="cursor-pointer w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Meus Pedidos</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center gap-2 w-full">
                          <Settings className="h-4 w-4" />
                          <span>Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log('Logout clicado');
                      signOut();
                    }} 
                    className="cursor-pointer focus:bg-destructive/10 focus:text-destructive w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Entrar</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/produtos"
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produtos
              </Link>
              
              <div className="space-y-3">
                <div className="font-body text-sm font-medium text-foreground">Categorias</div>
                <div className="pl-4 flex flex-col gap-3 border-l border-border/50 ml-1">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/produtos?categoria=${category.slug}`}
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    to="/categorias"
                    className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ver todas
                  </Link>
                </div>
              </div>

              <Link
                to="/sobre"
                className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
