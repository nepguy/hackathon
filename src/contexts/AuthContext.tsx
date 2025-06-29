import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { statisticsService } from '../lib/userDataService'
import { databaseService } from '../lib/database'
import { resendService } from '../lib/resendService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Auth session error (expected if Supabase not configured):', error.message);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update state immediately for fast UI response
        if (mounted) {
          setUser(session?.user ?? null);
          setSession(session);
          setLoading(false);
        }

        // Track user statistics and ensure user data exists (non-blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔥 User joined - updating statistics and ensuring user data');
          statisticsService.updateStatistic('user_joined');
          
          // Ensure user profile and preferences exist in background
          // This runs async and doesn't block the UI
          (async () => {
            try {
              const userId = session.user.id;
              
              // Check and create user profile if needed
              let profile = await databaseService.getUserProfile(userId);
              if (!profile) {
                console.log('Creating user profile for:', userId);
                profile = await databaseService.createUserProfile(userId);
              }
              
              // Check and create user preferences if needed
              let preferences = await databaseService.getUserPreferences(userId);
              if (!preferences) {
                console.log('Creating user preferences for:', userId);
                preferences = await databaseService.createUserPreferences(userId);
                if (preferences) {
                  console.log('✅ User preferences created successfully');
                } else {
                  console.error('❌ Failed to create user preferences');
                }
              }
              
            } catch (error) {
              console.error('Error ensuring user data:', error);
            }
          })();
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User left - updating statistics');
          statisticsService.updateStatistic('user_left');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: 'https://guardnomand.com/auth'
      },
    })

    // Send welcome email if signup was successful
    if (data.user && !error) {
      try {
        const userName = metadata?.full_name || data.user.email?.split('@')[0] || 'Traveler';
        await resendService.sendWelcomeEmail(data.user.email!, userName);
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup process if email fails
      }
    }

    return { user: data.user, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://guardnomand.com/password-reset'
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}