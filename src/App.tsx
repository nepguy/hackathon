import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LocationProvider } from './contexts/LocationContext';
import { UserDestinationProvider } from './contexts/UserDestinationContext';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { TrialProvider } from './contexts/TrialContext';
import { initializeSupabaseMonitoring } from './lib/supabase';
import PermissionManager from './components/common/PermissionManager';
import AppContent from './components/layout/AppContent';

function App() {
  useEffect(() => {
    // Initialize Supabase connection monitoring
    const cleanup = initializeSupabaseMonitoring();
    
    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <TrialProvider>
          <TranslationProvider>
            <LocationProvider autoStart={true}>
              <UserDestinationProvider>
                <PermissionManager>
                  <Router 
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <AppContent />
                  </Router>
                </PermissionManager>
              </UserDestinationProvider>
            </LocationProvider>
          </TranslationProvider>
        </TrialProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;