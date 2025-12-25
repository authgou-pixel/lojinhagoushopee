import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return data?.some(r => r.role === 'admin') ?? false;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Timeout de segurança para garantir que o loading não fique travado
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Timeout de segurança atingido: forçando fim do carregamento');
        setLoading(false);
      }
    }, 5000);

    // Função auxiliar para inicializar a sessão
    const initializeAuth = async () => {
      try {
        console.log('Iniciando verificação de sessão...');
        
        // Promise.race para evitar que o getSession trave indefinidamente
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao buscar sessão')), 4000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Usuário encontrado, verificando permissões...');
            // Não bloqueia o loading inicial pela verificação de admin
            checkAdminRole(session.user.id).then(adminStatus => {
              if (mounted) setIsAdmin(adminStatus);
            });
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        // Em caso de erro, assume sem usuário para destravar a interface
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('Finalizando carregamento inicial...');
          setLoading(false);
          clearTimeout(loadingTimeout);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de estado de autenticação:', event);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          if (session?.user) {
            checkAdminRole(session.user.id).then(adminStatus => {
              if (mounted) setIsAdmin(adminStatus);
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error as Error | null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Iniciando logout...');
    // Limpa estado local IMEDIATAMENTE para feedback instantâneo na UI
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    
    try {
      // Tenta logout no servidor
      await supabase.auth.signOut();
      console.log('Logout no servidor concluído');
    } catch (error) {
      console.error('Erro no logout do servidor (ignorado pois estado local já foi limpo):', error);
      // Força limpeza do localStorage se houver erro
      localStorage.clear(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
