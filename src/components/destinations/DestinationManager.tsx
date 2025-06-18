import React, { useState } from 'react';
import { useUserDestinations, UserDestination } from '../../contexts/UserDestinationContext';
import { MapPin, Calendar, Plus, Trash2, Settings, Bell, BellOff } from 'lucide-react';

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

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isCurrent = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">My Travel Destinations</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Current Active Destination */}
      {currentDestination && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">Currently Active</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-900">
            {currentDestination.name}, {currentDestination.country}
          </h3>
          <p className="text-sm text-blue-700">
            {formatDate(currentDestination.startDate)} - {formatDate(currentDestination.endDate)}
          </p>
        </div>
      )}

      {/* Add Destination Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Destination</h3>
          <form onSubmit={handleAddDestination} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Destination
                </label>
                <input
                  type="text"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Bangkok, Tokyo, Paris"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={newDestination.country}
                  onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Thailand, Japan, France"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newDestination.startDate}
                  onChange={(e) => setNewDestination({ ...newDestination, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={newDestination.endDate}
                  onChange={(e) => setNewDestination({ ...newDestination, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newDestination.isActive}
                  onChange={(e) => setNewDestination({ ...newDestination, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set as active destination</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Destination
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Destinations List */}
      <div className="space-y-3">
        {destinations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No destinations added yet.</p>
            <p className="text-sm text-gray-400">Add your travel destinations to get personalized alerts.</p>
          </div>
        ) : (
          destinations.map((destination) => (
            <div
              key={destination.id}
              className={`p-4 border rounded-lg transition-all ${
                destination.isActive
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">
                      {destination.name}, {destination.country}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {isCurrent(destination.startDate, destination.endDate) && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      )}
                      {isUpcoming(destination.startDate) && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Upcoming
                        </span>
                      )}
                      {destination.isActive && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Active Alerts
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(destination.startDate)} - {formatDate(destination.endDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAlerts(destination)}
                    className={`p-2 rounded-lg transition-colors ${
                      destination.alertsEnabled
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={destination.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                  >
                    {destination.alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                  {!destination.isActive && (
                    <button
                      onClick={() => setAsActive(destination)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Set as active destination"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeDestination(destination.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove destination"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DestinationManager; 