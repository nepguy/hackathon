import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import AlertItem from '../components/alerts/AlertItem';
import AlertFilters from '../components/alerts/AlertFilters';
import { safetyAlerts } from '../data/mockData';
import { SafetyAlert } from '../types';

const AlertsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(safetyAlerts);
  
  const handleFilterChange = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  
  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };
  
  // Filter alerts based on active filters
  const filteredAlerts = activeFilters.length === 0 
    ? alerts 
    : alerts.filter(alert => activeFilters.includes(alert.type));
  
  // Sort alerts: unread first, then by timestamp
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <PageContainer title="Safety Alerts">
      <AlertFilters 
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />
      
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No alerts found for the selected filters.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {sortedAlerts.filter(a => !a.read).length} unread alerts
            </p>
          </div>
          
          {sortedAlerts.map((alert) => (
            <AlertItem 
              key={alert.id} 
              alert={alert} 
              onMarkAsRead={handleMarkAsRead} 
            />
          ))}
        </>
      )}
    </PageContainer>
  );
};

export default AlertsPage;