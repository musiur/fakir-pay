// Hook for Enhanced Attendance Features (Demo)
import { useEffect, useState } from 'react';
import { AuthResult, biometricService } from '../services/BiometricService';
import { LocationResult, locationService } from '../services/LocationService';
import { offlineDataManager } from '../services/OfflineDataManager';

export interface AttendanceState {
  isInGeofence: boolean;
  location: LocationResult | null;
  isOfflineMode: boolean;
  pendingRecordsCount: number;
  biometricAvailable: boolean;
  isLocationLoading: boolean;
  locationError: string | null;
}

export const useAttendanceEnhancements = () => {
  const [state, setState] = useState<AttendanceState>({
    isInGeofence: true, // Start with true for demo
    location: null,
    isOfflineMode: false,
    pendingRecordsCount: 0,
    biometricAvailable: true,
    isLocationLoading: false,
    locationError: null
  });

  // Initialize services
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Check biometric availability
      const biometricTypes = await biometricService.isAvailable();
      const biometricAvailable = biometricTypes.length > 0;

      // Get current location
      setState(prev => ({ ...prev, isLocationLoading: true }));
      const location = await locationService.getCurrentLocation();
      
      // Check offline status
      const isOfflineMode = offlineDataManager.isOfflineMode();
      const pendingRecordsCount = await offlineDataManager.getOfflineRecordCount();

      setState(prev => ({
        ...prev,
        location,
        isInGeofence: location.location?.isWithinGeofence || false,
        biometricAvailable,
        isOfflineMode,
        pendingRecordsCount,
        isLocationLoading: false,
        locationError: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLocationLoading: false,
        locationError: 'Failed to initialize location services'
      }));
    }
  };

  const refreshLocation = async () => {
    try {
      setState(prev => ({ ...prev, isLocationLoading: true, locationError: null }));
      
      // Try to get fresh location
      const location = await locationService.getCurrentLocation();
      
      setState(prev => ({
        ...prev,
        location,
        isInGeofence: location.location?.isWithinGeofence || false,
        isLocationLoading: false
      }));

      return location;
    } catch (error) {
      // Try fallback location method
      try {
        const fallbackLocation = await locationService.getLocationWithFallback();
        setState(prev => ({
          ...prev,
          location: fallbackLocation,
          isInGeofence: fallbackLocation.location?.isWithinGeofence || false,
          isLocationLoading: false
        }));
        return fallbackLocation;
      } catch (fallbackError) {
        setState(prev => ({
          ...prev,
          isLocationLoading: false,
          locationError: 'Unable to determine location. Please check GPS settings.'
        }));
        throw fallbackError;
      }
    }
  };

  const authenticateWithBiometric = async (): Promise<AuthResult> => {
    return await biometricService.authenticate('Verify your identity to clock in/out');
  };

  const authenticateWithPIN = async (pin: string): Promise<AuthResult> => {
    return await biometricService.authenticateWithPIN(pin);
  };

  const recordAttendance = async (type: 'clock_in' | 'clock_out', authResult: AuthResult) => {
    const locationResult = state.location || await refreshLocation();
    
    if (!locationResult.location) {
      throw new Error('Unable to get location for attendance record');
    }
    
    const record = {
      id: `att_${Date.now()}`,
      employeeId: 'FFL-1001', // Demo employee ID
      date: new Date(),
      clockInTime: type === 'clock_in' ? new Date() : undefined,
      clockOutTime: type === 'clock_out' ? new Date() : undefined,
      location: {
        latitude: locationResult.location.coordinates.latitude,
        longitude: locationResult.location.coordinates.longitude,
        accuracy: locationResult.location.accuracy
      },
      authenticationType: authResult.biometricType ? 'biometric' : 'pin' as const,
      status: 'present' as const,
      isOfflineRecord: state.isOfflineMode,
      syncStatus: state.isOfflineMode ? 'pending' : 'synced' as const,
      metadata: {
        deviceId: 'demo_device_001',
        appVersion: '1.0.0',
        locationAccuracy: locationResult.location.accuracy,
        biometricType: authResult.biometricType
      }
    };

    if (state.isOfflineMode) {
      await offlineDataManager.storeAttendanceRecord(record);
      const newCount = await offlineDataManager.getOfflineRecordCount();
      setState(prev => ({ ...prev, pendingRecordsCount: newCount }));
    }

    return record;
  };

  const syncOfflineRecords = async () => {
    if (state.pendingRecordsCount === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: []
      };
    }

    const result = await offlineDataManager.syncWithServer();
    const newCount = await offlineDataManager.getOfflineRecordCount();
    
    setState(prev => ({ 
      ...prev, 
      pendingRecordsCount: newCount,
      isOfflineMode: offlineDataManager.isOfflineMode()
    }));

    return result;
  };

  // Demo functions to simulate different scenarios
  const simulateOutsideGeofence = async () => {
    const outsideLocation = await locationService.getLocationOutsideGeofence();
    setState(prev => ({
      ...prev,
      location: { success: true, location: outsideLocation },
      isInGeofence: false
    }));
  };

  const simulateInsideGeofence = async () => {
    const insideLocation = await locationService.getCurrentLocation();
    setState(prev => ({
      ...prev,
      location: insideLocation,
      isInGeofence: true
    }));
  };

  const simulateOfflineMode = () => {
    setState(prev => ({ ...prev, isOfflineMode: true }));
  };

  const simulateOnlineMode = () => {
    setState(prev => ({ ...prev, isOfflineMode: false }));
  };

  const getLocationErrorMessage = (): string | null => {
    if (!state.location || !state.location.location || state.isInGeofence) return null;
    return locationService.getGeofenceErrorMessage(state.location.location.coordinates);
  };

  return {
    ...state,
    refreshLocation,
    authenticateWithBiometric,
    authenticateWithPIN,
    recordAttendance,
    syncOfflineRecords,
    getLocationErrorMessage,
    // Demo functions
    simulateOutsideGeofence,
    simulateInsideGeofence,
    simulateOfflineMode,
    simulateOnlineMode
  };
};