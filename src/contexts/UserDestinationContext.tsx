import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserDestination {
  id: string;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  alertsEnabled: boolean;
}

interface UserDestinationContextType {
  destinations: UserDestination[];
  currentDestination: UserDestination | null;
  addDestination: (destination: Omit<UserDestination, 'id'>) => void;
  removeDestination: (id: string) => void;
  setCurrentDestination: (destination: UserDestination | null) => void;
  updateDestination: (id: string, updates: Partial<UserDestination>) => void;
  getActiveDestinations: () => UserDestination[];
}

const UserDestinationContext = createContext<UserDestinationContextType | undefined>(undefined);

export const useUserDestinations = () => {
  const context = useContext(UserDestinationContext);
  if (!context) {
    throw new Error('useUserDestinations must be used within a UserDestinationProvider');
  }
  return context;
};

export const UserDestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [destinations, setDestinations] = useState<UserDestination[]>([]);
  const [currentDestination, setCurrentDestination] = useState<UserDestination | null>(null);

  // Load destinations from localStorage on mount
  useEffect(() => {
    const savedDestinations = localStorage.getItem('userDestinations');
    if (savedDestinations) {
      const parsed = JSON.parse(savedDestinations);
      setDestinations(parsed);
      
      // Set current destination to the first active one
      const active = parsed.find((d: UserDestination) => d.isActive);
      if (active) {
        setCurrentDestination(active);
      }
    } else {
      // Initialize with sample destinations for demo
      const sampleDestinations: UserDestination[] = [
        {
          id: '1',
          name: 'Bangkok',
          country: 'Thailand',
          startDate: '2025-07-15',
          endDate: '2025-07-25',
          isActive: true,
          alertsEnabled: true
        },
        {
          id: '2',
          name: 'Paris',
          country: 'France',
          startDate: '2025-08-10',
          endDate: '2025-08-20',
          isActive: false,
          alertsEnabled: true
        }
      ];
      setDestinations(sampleDestinations);
      setCurrentDestination(sampleDestinations[0]);
    }
  }, []);

  // Save destinations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userDestinations', JSON.stringify(destinations));
  }, [destinations]);

  const addDestination = (destination: Omit<UserDestination, 'id'>) => {
    const newDestination: UserDestination = {
      ...destination,
      id: Date.now().toString()
    };
    setDestinations(prev => [...prev, newDestination]);
  };

  const removeDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
    if (currentDestination?.id === id) {
      setCurrentDestination(null);
    }
  };

  const updateDestination = (id: string, updates: Partial<UserDestination>) => {
    setDestinations(prev => 
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    );
    
    if (currentDestination?.id === id) {
      setCurrentDestination(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const getActiveDestinations = () => {
    const now = new Date();
    return destinations.filter(d => {
      const startDate = new Date(d.startDate);
      const endDate = new Date(d.endDate);
      return d.alertsEnabled && startDate <= now && now <= endDate;
    });
  };

  return (
    <UserDestinationContext.Provider value={{
      destinations,
      currentDestination,
      addDestination,
      removeDestination,
      setCurrentDestination,
      updateDestination,
      getActiveDestinations
    }}>
      {children}
    </UserDestinationContext.Provider>
  );
}; 