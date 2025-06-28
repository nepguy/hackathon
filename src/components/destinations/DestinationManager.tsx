import React, { useState } from 'react';
import { useUserDestinations, UserDestination } from '../../contexts/UserDestinationContext';
import { 
  MapPin, Calendar, Plus, Trash2, Settings, Bell, BellOff, 
  Globe, Plane, Clock, Edit, RefreshCw, AlertTriangle
} from 'lucide-react';

const DestinationManager: React.FC = () => {
  const { 
    destinations, 
    currentDestination, 
    addDestination, 
    removeDestination, 
    setCurrentDestination,
    updateDestination,
    refreshDestinations
  } = useUserDestinations();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<UserDestination | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newDestination, setNewDestination] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    status: 'planned' as const,
    alertsEnabled: true
  });

  const [editFormData, setEditFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    status: 'planned' as 'planned' | 'active' | 'completed' | 'cancelled',
    alertsEnabled: true
  });

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (newDestination.destination && newDestination.startDate && newDestination.endDate) {
      try {
        await addDestination(newDestination);
        setNewDestination({
          destination: '',
          startDate: '',
          endDate: '',
          status: 'planned',
          alertsEnabled: true
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to add destination:', error);
        setError('Failed to add destination. Please try again.');
      }
    }
  };

  const handleEditDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDestination) return;
    
    setError(null);
    try {
      await updateDestination(editingDestination.id, editFormData);
      setShowEditModal(false);
      setEditingDestination(null);
    } catch (error) {
      console.error('Failed to update destination:', error);
      setError('Failed to update destination. This record may not exist in the database. Try refreshing.');
      // Auto-refresh to sync data
      handleRefresh();
    }
  };

  const openEditModal = (destination: UserDestination) => {
    setEditingDestination(destination);
    setEditFormData({
      destination: destination.destination,
      startDate: destination.startDate,
      endDate: destination.endDate,
      status: destination.status,
      alertsEnabled: destination.alertsEnabled
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await refreshDestinations();
    } catch (error) {
      console.error('Failed to refresh destinations:', error);
      setError('Failed to refresh data. Please check your connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleAlerts = async (destination: UserDestination) => {
    setError(null);
    try {
      await updateDestination(destination.id, { alertsEnabled: !destination.alertsEnabled });
    } catch (error) {
      console.error('Failed to toggle alerts:', error);
      setError('Failed to update alerts. This record may not exist. Try refreshing.');
      handleRefresh();
    }
  };

  const setAsActive = async (destination: UserDestination) => {
    setError(null);
    try {
      // Set all destinations as inactive first
      for (const d of destinations) {
        if (d.status === 'active') {
          await updateDestination(d.id, { status: 'planned' });
        }
      }
      // Set selected destination as active
      await updateDestination(destination.id, { status: 'active' });
      setCurrentDestination(destination);
    } catch (error) {
      console.error('Failed to set active destination:', error);
      setError('Failed to set active destination. Try refreshing.');
      handleRefresh();
    }
  };

  const handleRemoveDestination = async (id: string) => {
    setError(null);
    try {
      await removeDestination(id);
    } catch (error) {
      console.error('Failed to remove destination:', error);
      setError('Failed to remove destination. Try refreshing.');
      handleRefresh();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDestinationStatus = (startDate: string, _endDate: string, status: string) => {
    if (status === 'active') return { status: 'active', color: 'bg-emerald-100 text-emerald-800' };
    if (status === 'completed') return { status: 'completed', color: 'bg-slate-100 text-slate-600' };
    if (status === 'cancelled') return { status: 'cancelled', color: 'bg-red-100 text-red-600' };
    
    const now = new Date();
    const start = new Date(startDate);
    
    if (now < start) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    return { status: 'planned', color: 'bg-amber-100 text-amber-800' };
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
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isRefreshing 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Refresh destinations"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

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
                  {currentDestination.destination}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={newDestination.destination}
                  onChange={(e) => setNewDestination({ ...newDestination, destination: e.target.value })}
                  className="input"
                  placeholder="e.g., Bangkok, Thailand or Paris, France"
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
                  checked={newDestination.alertsEnabled}
                  onChange={(e) => setNewDestination({ ...newDestination, alertsEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Enable safety alerts</span>
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

      {/* Edit Modal */}
      {showEditModal && editingDestination && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 animate-slideUp">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-600" />
              Edit Destination
            </h3>
            
            <form onSubmit={handleEditDestination} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={editFormData.destination}
                  onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                  className="input"
                  placeholder="e.g., Bangkok, Thailand or Paris, France"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
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
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="input"
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editAlertsEnabled"
                  checked={editFormData.alertsEnabled}
                  onChange={(e) => setEditFormData({ ...editFormData, alertsEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editAlertsEnabled" className="text-sm text-slate-700 cursor-pointer">
                  Enable safety alerts
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
            const status = getDestinationStatus(destination.startDate, destination.endDate, destination.status);
            
            return (
              <div
                key={destination.id}
                className={`card p-6 transition-all duration-300 ${
                  destination.status === 'active' ? 'ring-2 ring-blue-200 shadow-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {destination.destination}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.status}
                      </span>
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
                    
                    <button
                      onClick={() => openEditModal(destination)}
                      className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-all duration-300"
                      title="Edit destination"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {destination.status !== 'active' && (
                      <button
                        onClick={() => setAsActive(destination)}
                        className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-xl transition-all duration-300"
                        title="Set as active destination"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveDestination(destination.id)}
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