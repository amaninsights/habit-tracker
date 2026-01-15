import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface SavedAccount {
  email: string;
  lastUsed: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  savedAccounts: SavedAccount[];
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  removeSavedAccount: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    const saved = localStorage.getItem('habitflow_saved_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  // Save account to localStorage when user signs in
  const saveAccount = (email: string) => {
    setSavedAccounts(prev => {
      const filtered = prev.filter(a => a.email !== email);
      const updated = [{ email, lastUsed: Date.now() }, ...filtered].slice(0, 5); // Keep max 5 accounts
      localStorage.setItem('habitflow_saved_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedAccount = (email: string) => {
    setSavedAccounts(prev => {
      const updated = prev.filter(a => a.email !== email);
      localStorage.setItem('habitflow_saved_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        saveAccount(session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      saveAccount(email);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, savedAccounts, signUp, signIn, signOut, removeSavedAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
