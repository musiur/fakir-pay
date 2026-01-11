import { GeofenceConfig } from '../services/LocationService';

// Fakir Fashion Factory Location Configuration
export const FACTORY_GEOFENCE: GeofenceConfig = {
  center: {
    latitude: 23.8103, // Example coordinates for Dhaka area
    longitude: 90.4125, // Replace with actual factory coordinates
  },
  radius: 100, // 100 meters radius around factory
};

// Location service configuration
export const LOCATION_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  GPS_TIMEOUT: 10000, // 10 seconds
  NETWORK_TIMEOUT: 5000, // 5 seconds
  HIGH_ACCURACY_THRESHOLD: 50, // meters
  ACCEPTABLE_ACCURACY_THRESHOLD: 100, // meters
};

// Error messages
export const LOCATION_ERRORS = {
  PERMISSION_DENIED: 'Location permission is required to use attendance features. Please enable location access in your device settings.',
  GPS_UNAVAILABLE: 'GPS is currently unavailable. Trying alternative location methods...',
  NETWORK_UNAVAILABLE: 'Network location is unavailable. Using cached location if available.',
  ALL_METHODS_FAILED: 'Unable to determine your location. Please check your device settings and try again.',
  OUTSIDE_GEOFENCE: 'You are outside the factory premises. Please move closer to clock in/out.',
  CACHE_EXPIRED: 'Cached location has expired. Please refresh your location.',
};