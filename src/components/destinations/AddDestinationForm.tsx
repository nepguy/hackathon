import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDestinations } from '../../contexts/UserDestinationContext';
import { useLocation } from '../../contexts/LocationContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  MapPin, Calendar, Shield, Bell, BellOff, 
  Plane, Clock, Check, X, AlertCircle
} from 'lucide-react';

interface AddDestinationFormProps {
  onClose?: () => void;
}

const AddDestinationForm: React.FC<AddDestinationFormProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { addDestination } = useUserDestinations();
  const { requestLocationPermission, locationPermission } = useLocation();
  
  const [formData, setFormData] = useState({
    destination: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: 'planned' as 'planned' | 'active' | 'completed' | 'cancelled',
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
    if (!formData.destination.trim()) {
      setError('Destination is required');
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
    
    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      return false;
    }
    
    if (formData.startDate < new Date()) {
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
        destination: formData.destination.trim(),
        startDate: formData.startDate!.toISOString().split('T')[0],
        endDate: formData.endDate!.toISOString().split('T')[0],
        status: formData.status,
        alertsEnabled: formData.enableRealTimeAlerts && permissionsGranted.notifications,
      };
      
      await addDestination(destination);
      
      // Navigate to home page to see the new destination
      navigate('/home');
      
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

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 2); // Allow planning up to 2 years ahead

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Add New Destination</h1>
        <p className="text-slate-600 mt-2">
          Plan your next adventure with real-time safety monitoring and alerts
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination Information */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <MapPin className="w-5 h-5 mr-3 text-blue-600" />
            Travel Details
          </h2>
          
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="e.g., Paris, France or Tokyo, Japan"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Include city and country for better safety monitoring
            </p>
          </div>

          {/* Date Selection with Modern Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                  minDate={today}
                  maxDate={maxDate}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select start date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  calendarClassName="modern-calendar"
                  wrapperClassName="datepicker-wrapper"
                  showPopperArrow={false}
                  popperClassName="datepicker-popper"
                  popperPlacement="bottom-start"
                  withPortal={true}
                  portalId="datepicker-portal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date *
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                  minDate={formData.startDate || today}
                  maxDate={maxDate}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select end date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  calendarClassName="modern-calendar"
                  wrapperClassName="datepicker-wrapper"
                  showPopperArrow={false}
                  popperClassName="datepicker-popper"
                  popperPlacement="bottom-start"
                  withPortal={true}
                  portalId="datepicker-portal-end"
                  required
                />
              </div>
            </div>
          </div>

          {/* Trip Duration Display */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  Trip Duration: {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Privacy & Permissions */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Shield className="w-5 h-5 mr-3 text-green-600" />
            Safety & Alerts
          </h2>
          
          <p className="text-sm text-slate-600">
            Enable features to get real-time safety updates and alerts for your destination.
          </p>

          {/* Location Tracking */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  permissionsGranted.location ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  <MapPin className={`w-5 h-5 ${
                    permissionsGranted.location ? 'text-green-600' : 'text-slate-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Location Tracking</h3>
                  <p className="text-sm text-slate-500">
                    Enable GPS tracking for location-based safety alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {permissionsGranted.location ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Granted</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLocationPermissionRequest}
                    className="btn btn-outline btn-sm"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  permissionsGranted.notifications ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  {permissionsGranted.notifications ? (
                    <Bell className="w-5 h-5 text-green-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Push Notifications</h3>
                  <p className="text-sm text-slate-500">
                    Receive instant alerts about safety, weather, and local events
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {permissionsGranted.notifications ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Granted</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNotificationPermissionRequest}
                    className="btn btn-outline btn-sm"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate('/home');
              }
            }}
            className="btn btn-outline flex-1"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding Destination...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Add Destination
              </>
            )}
          </button>
        </div>
      </form>

      {/* Custom Styles for Calendar */}
      <style>{`
        .datepicker-wrapper {
          position: relative;
          z-index: 50;
        }
        
        .datepicker-popper {
          z-index: 99999 !important;
          position: fixed !important;
        }
        
        .modern-calendar {
          font-family: inherit;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 100000 !important;
          position: relative;
          background: white;
        }
        
        .modern-calendar .react-datepicker__header {
          background-color: #3b82f6;
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          color: white;
        }
        
        .modern-calendar .react-datepicker__current-month,
        .modern-calendar .react-datepicker__day-name {
          color: white;
          font-weight: 600;
        }
        
        .modern-calendar .react-datepicker__navigation {
          top: 12px;
        }
        
        .modern-calendar .react-datepicker__navigation--previous {
          border-right-color: white;
        }
        
        .modern-calendar .react-datepicker__navigation--next {
          border-left-color: white;
        }
        
        .modern-calendar .react-datepicker__day {
          border-radius: 6px;
          margin: 2px;
          transition: all 0.15s ease;
        }
        
        .modern-calendar .react-datepicker__day:hover {
          background-color: #dbeafe;
          color: #1e40af;
          transform: scale(1.05);
        }
        
        .modern-calendar .react-datepicker__day--selected {
          background-color: #3b82f6;
          color: white;
          transform: scale(1.05);
        }
        
        .modern-calendar .react-datepicker__day--today {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 600;
          border: 2px solid #f59e0b;
        }
        
        .modern-calendar .react-datepicker__day--keyboard-selected {
          background-color: #93c5fd;
          color: #1e40af;
        }
        
        .modern-calendar .react-datepicker__day--disabled {
          color: #cbd5e1;
          cursor: not-allowed;
        }
        
        .modern-calendar .react-datepicker__day--disabled:hover {
          background-color: transparent;
          transform: none;
        }
        
        /* Ensure calendar appears above all other content */
        .react-datepicker-popper {
          z-index: 99999 !important;
          position: fixed !important;
        }
        
        .react-datepicker {
          z-index: 100000 !important;
          position: relative !important;
        }
        
        /* Override any conflicting z-index from other components */
        .react-datepicker__portal {
          z-index: 100001 !important;
          position: fixed !important;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(2px);
        }
        
        /* Portal calendar positioning */
        #datepicker-portal,
        #datepicker-portal-end {
          z-index: 100002 !important;
        }
        
        /* Portal overlay styling */
        .react-datepicker__portal .react-datepicker {
          position: relative !important;
          margin: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default AddDestinationForm; 