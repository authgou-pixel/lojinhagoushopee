import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Admin
import { AdminRoute } from "@/components/admin/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";
import ProductList from "./pages/admin/products/ProductList";
import ProductForm from "./pages/admin/products/ProductForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/minha-conta" element={<Account />} />
              <Route path="/meus-pedidos" element={<Orders />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<Dashboard />} />
                <Route path="produtos" element={<ProductList />} />
                <Route path="produtos/novo" element={<ProductForm />} />
                <Route path="produtos/:id" element={<ProductForm />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
