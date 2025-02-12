import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getTranslation } from '../utils/errorHandling';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChangeInProgress, setAuthChangeInProgress] = useState(false);

  const clearError = () => setError(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error('Error getting session:', err);
      setError(getTranslation('error.auth.sessionError'));
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setAuthChangeInProgress(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Handle session expiry
      if (event === 'TOKEN_REFRESHED') {
        console.log('Session token refreshed');
      } else if (event === 'SIGNED_OUT') {
        setError(getTranslation('error.auth.sessionExpired'));
      }

      if (currentUser) {
        try {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

          // If no profile exists, create one
          if (!profile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: currentUser.id,
                  name: currentUser.email?.split('@')[0] || 'User',
                  points: 0,
                  created_at: new Date().toISOString(),
                }
              ], { onConflict: 'id' });

            if (profileError) {
              setError(getTranslation('error.profile.creation'));
            }
          }
        } catch (err) {
          console.error('Error checking/creating profile:', err);
        }
      }

      setLoading(false);
      setAuthChangeInProgress(false);
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const signUp = async (email: string, password: string, name: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create profile after successful signup
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            points: 0,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, we should clean up by deleting the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError }}>
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