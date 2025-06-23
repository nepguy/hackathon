import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDestinations } from '../../contexts/UserDestinationContext';
import { useLocation } from '../../contexts/LocationContext';
import { MapPin, Bell, Shield, AlertTriangle, Check, Plus } from 'lucide-react';

interface AddDestinationFormProps {
  onClose?: () => void;
}

const AddDestinationForm: React.FC<AddDestinationFormProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { addDestination } = useUserDestinations();
  const { requestLocationPermission, locationPermission } = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    startDate: '',
    endDate: '',
    enableLocationTracking: false,
    enableRealTimeAlerts: false,
    enableWeatherAlerts: false,
    enableLocalNews: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [permissionsGranted, setPermissionsGranted] = useState({
    location: false,
    notifications: false,
  });

  // Check initial permissions
  useEffect(() => {
    setPermissionsGranted(prev => ({
      ...prev,
      location: locationPermission === 'granted',
    }));
  }, [locationPermission]);

  const handleLocationPermissionRequest = async () => {
    try {
      const permission = await requestLocationPermission();
      setPermissionsGranted(prev => ({
        ...prev,
        location: permission === 'granted',
      }));
      
      if (permission === 'granted') {
        setFormData(prev => ({
          ...prev,
          enableLocationTracking: true,
        }));
      } else {
        alert('Location permission is required for real-time features. You can still add destinations without location tracking.');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const handleNotificationPermissionRequest = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionsGranted(prev => ({
          ...prev,
          notifications: permission === 'granted',
        }));
        
        if (permission === 'granted') {
          setFormData(prev => ({
            ...prev,
            enableRealTimeAlerts: true,
            enableWeatherAlerts: true,
            enableLocalNews: true,
          }));
        } else {
          alert('Notification permission is required for real-time alerts. You can still add destinations without notifications.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Destination name is required');
      return false;
    }
    
    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    
    if (new Date(formData.startDate) < new Date()) {
      setError('Start date cannot be in the past');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const destination = {
        name: formData.name.trim(),
        country: formData.country.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: true,
        alertsEnabled: formData.enableRealTimeAlerts && permissionsGranted.notifications,
      };
      
      await addDestination(destination);
      
      // Navigate to home page to see the new destination
      navigate('/');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding destination:', error);
      setError('Failed to add destination. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Add New Destination</h2>
        <p className="text-slate-600">Plan your trip and stay informed</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destination Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Paris, Tokyo, New York"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., France, Japan, USA"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Privacy & Permissions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Privacy & Permissions
          </h3>
          
          <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
            We respect your privacy. All permissions are optional and can be changed later in settings.
          </div>

          {/* Location Permission */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">Location Access</p>
                  <p className="text-sm text-slate-600">Enable real-time location tracking</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {permissionsGranted.location && <Check className="w-4 h-4 text-green-500" />}
                <button
                  type="button"
                  onClick={handleLocationPermissionRequest}
                  disabled={permissionsGranted.location}
                  className={`px-3 py-1 text-xs rounded-full ${
                    permissionsGranted.location 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {permissionsGranted.location ? 'Granted' : 'Allow Access'}
                </button>
              </div>
            </div>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enableLocationTracking}
                onChange={(e) => setFormData(prev => ({ ...prev, enableLocationTracking: e.target.checked }))}
                disabled={!permissionsGranted.location}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Enable location tracking for this trip
              </span>
            </label>
          </div>

          {/* Notifications Permission */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">Notifications</p>
                  <p className="text-sm text-slate-600">Get real-time alerts and updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {permissionsGranted.notifications && <Check className="w-4 h-4 text-green-500" />}
                <button
                  type="button"
                  onClick={handleNotificationPermissionRequest}
                  disabled={permissionsGranted.notifications}
                  className={`px-3 py-1 text-xs rounded-full ${
                    permissionsGranted.notifications 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {permissionsGranted.notifications ? 'Granted' : 'Allow Notifications'}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.enableRealTimeAlerts}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableRealTimeAlerts: e.target.checked }))}
                  disabled={!permissionsGranted.notifications}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Safety & scam alerts</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.enableWeatherAlerts}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableWeatherAlerts: e.target.checked }))}
                  disabled={!permissionsGranted.notifications}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Weather updates</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.enableLocalNews}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableLocalNews: e.target.checked }))}
                  disabled={!permissionsGranted.notifications}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Local news & events</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose || (() => navigate(-1))}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDestinationForm; 