import React, { useState } from 'react';
import { useUserDestinations, UserDestination } from '../../contexts/UserDestinationContext';
import { 
  MapPin, Calendar, Plus, Trash2, Settings, Bell, BellOff, 
  Globe, Plane, Clock
} from 'lucide-react';

const DestinationManager: React.FC = () => {
  const { 
    destinations, 
    currentDestination, 
    addDestination, 
    removeDestination, 
    setCurrentDestination,
    updateDestination 
  } = useUserDestinations();
  
  const [showAddForm, setShowAddForm] = useState(false);

  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    startDate: '',
    endDate: '',
    isActive: false,
    alertsEnabled: true
  });

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDestination.name && newDestination.country && newDestination.startDate && newDestination.endDate) {
      addDestination(newDestination);
      setNewDestination({
        name: '',
        country: '',
        startDate: '',
        endDate: '',
        isActive: false,
        alertsEnabled: true
      });
      setShowAddForm(false);
    }
  };

  const toggleAlerts = (destination: UserDestination) => {
    updateDestination(destination.id, { alertsEnabled: !destination.alertsEnabled });
  };

  const setAsActive = (destination: UserDestination) => {
    // Set all destinations as inactive first
    destinations.forEach(d => {
      if (d.isActive) {
        updateDestination(d.id, { isActive: false });
      }
    });
    // Set selected destination as active
    updateDestination(destination.id, { isActive: true });
    setCurrentDestination(destination);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDestinationStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    if (now >= start && now <= end) return { status: 'current', color: 'bg-emerald-100 text-emerald-800' };
    return { status: 'past', color: 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="space-y-6 stagger-children">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Globe className="w-6 h-6 mr-3 text-blue-600" />
            My Destinations
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your travel destinations and alert preferences
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Current Active Destination */}
      {currentDestination && (
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">Currently Active</span>
                </div>
                <h3 className="text-xl font-bold text-blue-900">
                  {currentDestination.name}, {currentDestination.country}
                </h3>
                <p className="text-blue-700">
                  {formatDate(currentDestination.startDate)} - {formatDate(currentDestination.endDate)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Alerts Active</div>
              <div className="text-xs text-blue-500">Real-time monitoring</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Destination Form */}
      {showAddForm && (
        <div className="card p-6 animate-slide-down">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Destination
          </h3>
          
          <form onSubmit={handleAddDestination} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City/Destination
                </label>
                <input
                  type="text"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Bangkok, Tokyo, Paris"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={newDestination.country}
                  onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                  className="input"
                  placeholder="e.g., Thailand, Japan, France"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newDestination.startDate}
                  onChange={(e) => setNewDestination({ ...newDestination, startDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newDestination.endDate}
                  onChange={(e) => setNewDestination({ ...newDestination, endDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDestination.isActive}
                  onChange={(e) => setNewDestination({ ...newDestination, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Set as active destination</span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Add Destination
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Destinations List */}
      <div className="space-y-4">
        {destinations.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No destinations yet</h3>
            <p className="text-slate-600 mb-6">
              Add your travel destinations to get personalized safety alerts and insights.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              Add Your First Destination
            </button>
          </div>
        ) : (
          destinations.map((destination) => {
            const status = getDestinationStatus(destination.startDate, destination.endDate);
            
            return (
              <div
                key={destination.id}
                className={`card p-6 transition-all duration-300 ${
                  destination.isActive ? 'ring-2 ring-blue-200 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {destination.name}, {destination.country}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.status}
                      </span>
                      {destination.isActive && (
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(destination.startDate)} - {formatDate(destination.endDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {Math.ceil((new Date(destination.endDate).getTime() - new Date(destination.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAlerts(destination)}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        destination.alertsEnabled
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={destination.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                    >
                      {destination.alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    
                    {!destination.isActive && (
                      <button
                        onClick={() => setAsActive(destination)}
                        className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all duration-300"
                        title="Set as active destination"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeDestination(destination.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all duration-300"
                      title="Remove destination"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DestinationManager;