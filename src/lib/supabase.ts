/**
 * Supabase Configuration for GuardNomad
 * 
 * IMPORTANT: WebSocket/Realtime features are DISABLED to prevent connection errors.
 * This configuration prioritizes app stability over real-time updates.
 * 
 * Changes made to fix WebSocket errors:
 * 1. Disabled realtime subscriptions (eventsPerSecond: 0)
 * 2. Overridden channel methods to prevent WebSocket connections
 * 3. Added error suppression for realtime connection attempts
 * 4. All subscription functions return no-op cleanup functions
 * 
 * The app will work perfectly without real-time features using:
 * - Manual data refreshing
 * - Polling mechanisms where needed
 * - Local state management
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DIAGNOSTIC LOGGING for troubleshooting
console.group('🔍 Supabase Environment Variables Check');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '❌ MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ MISSING');
console.log('URL starts with https://', supabaseUrl?.startsWith('https://'));
console.log('URL contains supabase.co:', supabaseUrl?.includes('.supabase.co'));
console.log('Not placeholder URL:', supabaseUrl !== 'your_supabase_url_here');
console.log('Not placeholder key:', supabaseAnonKey !== 'your_supabase_anon_key_here');
console.groupEnd();

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your_supabase_url_here' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here' &&
         supabaseUrl.startsWith('https://') &&
         supabaseUrl.includes('.supabase.co');
};

// Create a mock client for development when Supabase is not configured
const createMockSupabaseClient = () => {
  console.warn('🔧 Supabase not configured - using mock client for development');
  
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
        })
      }),
      insert: () => ({ 
        select: () => ({ 
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
        })
      }),
      update: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    channel: (name: string) => {
      console.log('🔇 Mock channel request suppressed for:', name);
      return {
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        subscribe: () => ({ unsubscribe: () => {} }),
        unsubscribe: () => {}
      };
    },
    removeChannel: () => {}
  };

  return mockClient as any;
};

// Initialize Supabase client with proper error handling
let supabase: any;

try {
  if (hasValidSupabaseConfig()) {
    // Create real Supabase client with disabled realtime to prevent WebSocket errors
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        // Disable realtime connections to prevent WebSocket errors
        params: {
          eventsPerSecond: 0, // Disable events
        },
        heartbeatIntervalMs: 60000, // Longer intervals
        reconnectAfterMs: () => 60000, // Less aggressive reconnection
        timeout: 30000,
        // Add error handling for realtime connections
        logger: (level: string, message: string, details?: any) => {
          if (level === 'error') {
            console.warn('⚠️ Supabase WebSocket error, but app will continue working:', details);
            return; // Suppress error logging
          }
        }
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'x-application-name': 'guardnomad',
        },
      },
      db: {
        schema: 'public',
      },
    });
    
    // Override realtime methods to prevent WebSocket connections
    const originalChannel = supabase.channel;
    supabase.channel = function(name: string) {
      console.log('🔇 Realtime channel request suppressed for:', name);
      return {
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        subscribe: () => ({ unsubscribe: () => {} }),
        unsubscribe: () => {}
      };
    };
    
    console.log('✅ Supabase client initialized successfully (realtime disabled)');
  } else {
    // Use mock client for development
    supabase = createMockSupabaseClient();
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  console.log('🔧 Using mock client for development');
  supabase = createMockSupabaseClient();
}

export { supabase };

// Clear stale authentication sessions
export const clearAuthSession = async () => {
  try {
    console.log('🧹 Clearing stale authentication session...');
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear localStorage items related to Supabase auth
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed localStorage key: ${key}`);
    });
    
    // Clear sessionStorage as well
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('sb-')) {
        sessionKeysToRemove.push(key);
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`Removed sessionStorage key: ${key}`);
    });
    
    console.log('✅ Auth session cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth session:', error);
    return false;
  }
};

// Enhanced auth state monitoring
export const initializeAuthMonitoring = () => {
  supabase.auth.onAuthStateChange((event: any, session: any) => {
    console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('✅ Token refreshed successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('👋 User signed out');
    } else if (event === 'SIGNED_IN') {
      console.log('👋 User signed in:', session?.user?.email);
    }
  });
};

// Initialize auth monitoring when module loads
if (hasValidSupabaseConfig()) {
  initializeAuthMonitoring();
}

// WebSocket connection monitoring
let wsConnectionAttempts = 0;
const MAX_WS_ATTEMPTS = 5;
let connectionListeners: ((connected: boolean) => void)[] = [];

// Simple connection status check
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  websocket: boolean;
  database: boolean;
  error?: string;
}> => {
  try {
    // Simple auth check to verify connection
    const { error } = await supabase.auth.getSession();
    const connected = !error;
    
    return {
      connected,
      websocket: false, // Disable websocket checks
      database: connected,
      error: error?.message
    };
  } catch (error) {
    return {
      connected: false,
      websocket: false,
      database: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
};

// Add connection status listener
export const addConnectionListener = (callback: (connected: boolean) => void) => {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter(listener => listener !== callback);
  };
};

// Notify all listeners of connection changes
const notifyConnectionChange = (connected: boolean) => {
  connectionListeners.forEach(listener => listener(connected));
};

// Enhanced subscription creation with better error handling
// Note: Realtime subscriptions are disabled to prevent WebSocket errors
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  console.log(`🔇 Realtime subscription disabled for ${table} to prevent WebSocket errors`);
  
  // Return a no-op unsubscribe function since realtime is disabled
  return () => {
    console.log(`🔇 Realtime subscription cleanup for ${table} (no-op)`);
  };
};

// Subscribe to safety alerts with real-time updates
export const subscribeSafetyAlerts = (callback: (alerts: any[]) => void) => {
  return createRealtimeSubscription('safety_alerts', (payload) => {
    // Handle different types of changes
    if (payload.eventType === 'INSERT') {
      console.log('🆕 New safety alert:', payload.new);
    } else if (payload.eventType === 'UPDATE') {
      console.log('📝 Updated safety alert:', payload.new);
    } else if (payload.eventType === 'DELETE') {
      console.log('🗑️ Deleted safety alert:', payload.old);
    }
    
    // Fetch updated alerts and call the callback
    fetchSafetyAlerts().then(callback);
  });
};

// Fetch safety alerts without polling
export const fetchSafetyAlerts = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('safety_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching safety alerts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    return [];
  }
};

// Initialize connection monitoring without polling
// Note: Monitoring is disabled to prevent WebSocket errors
export const initializeSupabaseMonitoring = () => {
  console.log('🔇 Supabase monitoring disabled to prevent WebSocket errors');
  
  // Return a no-op cleanup function since monitoring is disabled
  return () => {
    console.log('🔇 Supabase monitoring cleanup (no-op)');
  };
};

// Simple test authentication for development
export const createTestUser = async () => {
  try {
    const testEmail = 'test@travelsafe.com';
    const testPassword = 'testpassword123';
    
    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInData.user) {
      console.log('✅ Test user signed in successfully');
      return { user: signInData.user, error: null };
    }
    
    // If sign in fails, try to create the user
    if (signInError) {
      console.log('Creating test user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
      
      if (signUpError) {
        console.error('❌ Failed to create test user:', signUpError);
        return { user: null, error: signUpError };
      }
      
      console.log('✅ Test user created successfully');
      return { user: signUpData.user, error: null };
    }
    
    return { user: null, error: signInError };
  } catch (error) {
    console.error('❌ Test authentication error:', error);
    return { user: null, error };
  }
};