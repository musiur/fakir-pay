// Dummy Offline Data Manager for Demo
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  authenticationType: 'biometric' | 'pin' | 'manual';
  status: 'present' | 'absent' | 'late' | 'early_departure';
  workingHours?: number;
  isOfflineRecord: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  metadata: {
    deviceId: string;
    appVersion: string;
    locationAccuracy: number;
    biometricType?: string;
  };
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export interface DataConflict {
  localRecord: AttendanceRecord;
  serverRecord: AttendanceRecord;
  conflictType: 'timestamp' | 'location' | 'status';
}

export class OfflineDataManager {
  private readonly STORAGE_KEY = 'offline_attendance_records';
  private readonly MAX_OFFLINE_DAYS = 7;

  async storeAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      const existingRecords = await this.getPendingSyncRecords();
      
      // Mark as offline record
      const offlineRecord: AttendanceRecord = {
        ...record,
        isOfflineRecord: true,
        syncStatus: 'pending',
        id: record.id || this.generateId()
      };

      const updatedRecords = [...existingRecords, offlineRecord];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedRecords)
      );

      console.log('Attendance record stored offline:', offlineRecord.id);
    } catch (error) {
      console.error('Failed to store offline record:', error);
      throw new Error('Failed to store attendance record offline');
    }
  }

  async getPendingSyncRecords(): Promise<AttendanceRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const records: AttendanceRecord[] = JSON.parse(stored);
      
      // Filter out records older than 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.MAX_OFFLINE_DAYS);

      const validRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= cutoffDate && record.syncStatus === 'pending';
      });

      // Update storage if we filtered out old records
      if (validRecords.length !== records.length) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(validRecords));
      }

      return validRecords;
    } catch (error) {
      console.error('Failed to get pending sync records:', error);
      return [];
    }
  }

  async syncWithServer(): Promise<SyncResult> {
    const pendingRecords = await this.getPendingSyncRecords();
    
    if (pendingRecords.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        errors: []
      };
    }

    // Simulate server sync with some failures for demo
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    const updatedRecords = await Promise.all(
      pendingRecords.map(async (record) => {
        // Simulate 90% success rate
        const syncSuccess = Math.random() > 0.1;
        
        if (syncSuccess) {
          syncedCount++;
          return {
            ...record,
            syncStatus: 'synced' as const
          };
        } else {
          failedCount++;
          errors.push(`Failed to sync record ${record.id}: Network error`);
          return {
            ...record,
            syncStatus: 'failed' as const
          };
        }
      })
    );

    // Update storage with sync results
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));

    console.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      errors
    };
  }

  async resolveConflict(conflict: DataConflict): Promise<void> {
    // For demo, always prefer local record
    console.log('Resolving conflict by keeping local record:', conflict.localRecord.id);
    
    // Update the record to mark conflict as resolved
    const pendingRecords = await this.getPendingSyncRecords();
    const updatedRecords = pendingRecords.map(record => 
      record.id === conflict.localRecord.id 
        ? { ...record, syncStatus: 'synced' as const }
        : record
    );

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
  }

  async getOfflineRecordCount(): Promise<number> {
    const records = await this.getPendingSyncRecords();
    return records.length;
  }

  async clearSyncedRecords(): Promise<void> {
    const allRecords = await this.getAllRecords();
    const pendingRecords = allRecords.filter(record => record.syncStatus === 'pending');
    
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(pendingRecords));
  }

  private async getAllRecords(): Promise<AttendanceRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get all records:', error);
      return [];
    }
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if we're in offline mode (simulate network connectivity)
  isOfflineMode(): boolean {
    // For demo, randomly return true 20% of the time
    return Math.random() < 0.2;
  }

  // Get days until sync is required
  getDaysUntilSyncRequired(): number {
    // For demo, return a random number between 1-7
    return Math.floor(Math.random() * 7) + 1;
  }
}

// Singleton instance
export const offlineDataManager = new OfflineDataManager();