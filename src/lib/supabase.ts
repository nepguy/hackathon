import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Simple Supabase client configuration to avoid multiple instances
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 2000, 30000),
    timeout: 15000,
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'travel-safety-app',
    },
  },
  db: {
    schema: 'public',
  },
})

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
    const { data: { session }, error } = await supabase.auth.getSession();
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
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  try {
    const channelName = `${table}_changes_${Date.now()}`;
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: '' },
        },
      })
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          ...(filter && { filter })
        }, 
        (payload) => {
          console.log(`📡 Received ${table} change:`, payload);
          callback(payload);
        }
      );

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Successfully subscribed to ${table} changes`);
        wsConnectionAttempts = 0;
        notifyConnectionChange(true);
      } else if (status === 'CHANNEL_ERROR') {
        wsConnectionAttempts++;
        console.error(`❌ Failed to subscribe to ${table} changes. Attempt ${wsConnectionAttempts}/${MAX_WS_ATTEMPTS}`, err);
        notifyConnectionChange(false);
        
        if (wsConnectionAttempts >= MAX_WS_ATTEMPTS) {
          console.error('❌ Max WebSocket connection attempts reached. Operating in offline mode.');
        }
      } else if (status === 'TIMED_OUT') {
        console.warn(`⏰ Subscription to ${table} timed out. Will retry automatically.`);
        notifyConnectionChange(false);
      } else if (status === 'CLOSED') {
        console.info(`🔌 WebSocket connection for ${table} closed. App will work with cached data.`);
        notifyConnectionChange(false);
      }
    });

    return () => {
      console.log(`🔌 Unsubscribing from ${table} changes`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error(`Error creating subscription for ${table}:`, error);
    return () => {}; // Return empty cleanup function
  }
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
export const initializeSupabaseMonitoring = () => {
  console.log('🔧 Initializing Supabase monitoring with realtime subscriptions');
  
  // Create a monitoring channel to track connection status
  const monitoringChannel = supabase.channel('connection_monitor');
  
  monitoringChannel.subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('✅ Supabase WebSocket connected');
      notifyConnectionChange(true);
    } else if (status === 'CHANNEL_ERROR') {
      console.warn('⚠️ Supabase WebSocket error, but app will continue working:', err);
      notifyConnectionChange(false);
    } else if (status === 'TIMED_OUT') {
      console.warn('⏰ Supabase WebSocket timeout, retrying...');
      notifyConnectionChange(false);
    } else if (status === 'CLOSED') {
      console.info('🔌 Supabase WebSocket closed, app working in offline mode');
      notifyConnectionChange(false);
    }
  });

  // Cleanup function
  return () => {
    console.log('🧹 Cleaning up Supabase monitoring');
    try {
      supabase.removeChannel(monitoringChannel);
    } catch (error) {
      console.warn('Warning during cleanup:', error);
    }
    connectionListeners = [];
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