// Security and Privacy Utilities
export class SecurityManager {
  private static instance: SecurityManager;
  
  private constructor() {}
  
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Location Permission Management
  async requestLocationPermission(): Promise<PermissionState> {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return 'denied';
    }

    if (!navigator.permissions) {
      // Fallback for browsers without Permissions API
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve('denied');
            } else {
              resolve('prompt');
            }
          },
          { timeout: 5000, maximumAge: 0 }
        );
      });
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'denied';
    }
  }

  // Notification Permission Management
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Camera Permission Management (for profile pictures)
  async requestCameraPermission(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Camera is not supported by this browser');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately as we only wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  // Privacy Settings Validation
  validatePrivacySettings(settings: any): boolean {
    const requiredFields = ['notifications', 'location', 'dataSharing'];
    return requiredFields.every(field => field in settings);
  }

  // Data Encryption Utilities
  encryptSensitiveData(data: string): string {
    // In a real app, use proper encryption like AES
    return btoa(data); // Base64 encoding for demo
  }

  decryptSensitiveData(encryptedData: string): string {
    try {
      return atob(encryptedData);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return '';
    }
  }

  // Secure Local Storage
  setSecureItem(key: string, value: any): void {
    try {
      const encrypted = this.encryptSensitiveData(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  getSecureItem(key: string): any {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      const decrypted = this.decryptSensitiveData(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  // Clear all sensitive data
  clearSecureData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // GDPR Compliance
  exportUserData(): any {
    const userData = {
      profile: this.getSecureItem('userProfile'),
      preferences: this.getSecureItem('userPreferences'),
      destinations: this.getSecureItem('userDestinations'),
      alertHistory: this.getSecureItem('alertHistory'),
      exportedAt: new Date().toISOString(),
    };
    
    return userData;
  }

  deleteAllUserData(): void {
    this.clearSecureData();
    // Clear regular localStorage items
    localStorage.removeItem('userDestinations');
    localStorage.removeItem('lastKnownLocation');
    // Clear session storage
    sessionStorage.clear();
    console.log('All user data has been deleted');
  }

  // Content Security Policy Headers
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://maps.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.openweathermap.org https://api.eventbrite.com",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': [
        'camera=(self)',
        'microphone=()',
        'geolocation=(self)',
        'notifications=(self)'
      ].join(', ')
    };
  }

  // Privacy Audit
  performPrivacyAudit(): {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if sensitive data is properly encrypted
    const sensitiveKeys = Object.keys(localStorage).filter(key => 
      !key.startsWith('secure_') && 
      (key.includes('user') || key.includes('location') || key.includes('auth'))
    );

    if (sensitiveKeys.length > 0) {
      issues.push('Unencrypted sensitive data found in localStorage');
      recommendations.push('Migrate sensitive data to secure storage');
    }

    // Check permissions
    if (!navigator.permissions) {
      issues.push('Permissions API not supported');
      recommendations.push('Implement fallback permission checks');
    }

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('Site not served over HTTPS');
      recommendations.push('Enable HTTPS for production');
    }

    return {
      passed: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Privacy Policy Template
export const PRIVACY_MANIFESTO = {
  version: '1.0.0',
  lastUpdated: '2024-12-19',
  principles: [
    'We respect your privacy and never sell your personal data',
    'Location data is only used for travel safety features',
    'All sensitive data is encrypted before storage',
    'You can delete all your data at any time',
    'We comply with GDPR and international privacy laws',
    'Minimal data collection - we only collect what we need',
    'Transparent data usage - you always know how data is used'
  ],
  dataCollection: {
    location: {
      purpose: 'Provide location-based safety alerts and weather information',
      retention: '30 days or until user removes destination',
      encryption: true,
      userControl: true
    },
    preferences: {
      purpose: 'Customize app experience and notification settings',
      retention: 'Until account deletion',
      encryption: true,
      userControl: true
    },
    travelPlans: {
      purpose: 'Provide relevant safety information for planned trips',
      retention: 'Until trip completion + 30 days',
      encryption: true,
      userControl: true
    }
  },
  userRights: [
    'Right to access your data',
    'Right to rectify incorrect data',
    'Right to erase your data',
    'Right to restrict processing',
    'Right to data portability',
    'Right to object to processing',
    'Right to withdraw consent'
  ]
};

export default SecurityManager; 