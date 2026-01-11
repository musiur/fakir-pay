import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { FACTORY_GEOFENCE, LOCATION_CONFIG, LOCATION_ERRORS } from '../constants/LocationConfig';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: Date;
  source: 'gps' | 'network' | 'beacon' | 'cached';
  isWithinGeofence: boolean;
  distanceFromCenter?: number;
}

export interface LocationResult {
  success: boolean;
  location?: LocationData;
  error?: string;
}

export interface GeofenceConfig {
  center: Coordinates;
  radius: number; // in meters
}

class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationData | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION = LOCATION_CONFIG.CACHE_DURATION;
  private readonly CACHE_KEY = 'cached_location';
  
  // Use factory geofence configuration
  private geofenceConfig: GeofenceConfig = FACTORY_GEOFENCE;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get current location with fallback hierarchy:
   * 1. High-accuracy GPS
   * 2. Network-based location
   * 3. Cached location (if within 5 minutes)
   */
  public async getCurrentLocation(): Promise<LocationResult> {
    try {
      // Check permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          error: LOCATION_ERRORS.PERMISSION_DENIED
        };
      }

      // Try high-accuracy GPS first
      try {
        const gpsLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: LOCATION_CONFIG.GPS_TIMEOUT,
        });

        const locationData: LocationData = {
          coordinates: {
            latitude: gpsLocation.coords.latitude,
            longitude: gpsLocation.coords.longitude,
          },
          accuracy: gpsLocation.coords.accuracy || 0,
          timestamp: new Date(gpsLocation.timestamp),
          source: 'gps',
          isWithinGeofence: this.isWithinGeofence({
            latitude: gpsLocation.coords.latitude,
            longitude: gpsLocation.coords.longitude,
          }),
        };

        // Calculate distance from geofence center
        locationData.distanceFromCenter = this.calculateDistance(
          locationData.coordinates,
          this.geofenceConfig.center
        );

        // Cache the location
        await this.cacheLocation(locationData);

        return {
          success: true,
          location: locationData
        };
      } catch (gpsError) {
        console.log('GPS failed, trying network location:', gpsError);
        
        // Fallback to network-based location
        try {
          const networkLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: LOCATION_CONFIG.NETWORK_TIMEOUT,
          });

          const locationData: LocationData = {
            coordinates: {
              latitude: networkLocation.coords.latitude,
              longitude: networkLocation.coords.longitude,
            },
            accuracy: networkLocation.coords.accuracy || 0,
            timestamp: new Date(networkLocation.timestamp),
            source: 'network',
            isWithinGeofence: this.isWithinGeofence({
              latitude: networkLocation.coords.latitude,
              longitude: networkLocation.coords.longitude,
            }),
          };

          locationData.distanceFromCenter = this.calculateDistance(
            locationData.coordinates,
            this.geofenceConfig.center
          );

          await this.cacheLocation(locationData);

          return {
            success: true,
            location: locationData
          };
        } catch (networkError) {
          console.log('Network location failed, trying cached location:', networkError);
          
          // Fallback to cached location
          const cachedLocation = await this.getCachedLocation();
          if (cachedLocation) {
            return {
              success: true,
              location: cachedLocation
            };
          }

          return {
            success: false,
            error: LOCATION_ERRORS.ALL_METHODS_FAILED
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Location service error: ${error}`
      };
    }
  }

  /**
   * Check if coordinates are within the defined geofence
   */
  public isWithinGeofence(coordinates: Coordinates): boolean {
    const distance = this.calculateDistance(coordinates, this.geofenceConfig.center);
    return distance <= this.geofenceConfig.radius;
  }

  /**
   * Start location tracking (placeholder for future background tracking)
   */
  public startLocationTracking(): void {
    console.log('Location tracking started');
    // Future implementation for background location tracking
  }

  /**
   * Stop location tracking
   */
  public stopLocationTracking(): void {
    console.log('Location tracking stopped');
    // Future implementation
  }

  /**
   * Get cached location if still valid (within 5 minutes)
   */
  public async getCachedLocation(): Promise<LocationData | null> {
    try {
      // Check memory cache first
      if (this.cachedLocation && this.cacheExpiry && new Date() < this.cacheExpiry) {
        return this.cachedLocation;
      }

      // Check persistent cache
      const cachedData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheTime = new Date(parsed.timestamp);
        const now = new Date();
        
        if (now.getTime() - cacheTime.getTime() < this.CACHE_DURATION) {
          // Cache is still valid
          const locationData: LocationData = {
            ...parsed,
            timestamp: cacheTime,
            source: 'cached'
          };
          
          // Update memory cache
          this.cachedLocation = locationData;
          this.cacheExpiry = new Date(now.getTime() + this.CACHE_DURATION);
          
          return locationData;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(this.CACHE_KEY);
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving cached location:', error);
      return null;
    }
  }

  /**
   * Cache location data for 5 minutes
   */
  private async cacheLocation(location: LocationData): Promise<void> {
    try {
      // Update memory cache
      this.cachedLocation = location;
      this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION);

      // Update persistent cache
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Update geofence configuration
   */
  public updateGeofenceConfig(config: GeofenceConfig): void {
    this.geofenceConfig = config;
  }

  /**
   * Get current geofence configuration
   */
  public getGeofenceConfig(): GeofenceConfig {
    return { ...this.geofenceConfig };
  }

  /**
   * Get error message with distance information for geofence violations
   */
  public getGeofenceViolationMessage(coordinates: Coordinates): string {
    const distance = this.calculateDistance(coordinates, this.geofenceConfig.center);
    const distanceFromBoundary = distance - this.geofenceConfig.radius;
    
    if (distanceFromBoundary > 0) {
      return `You are ${Math.round(distanceFromBoundary)} meters outside the Fakir Zone. Please move closer to the factory premises to clock in/out.`;
    }
    
    return 'You are within the Fakir Zone and can clock in/out.';
  }
}

export default LocationService;