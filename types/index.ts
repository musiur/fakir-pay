export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  joinDate: string;
  phone: string;
  emergency: string;
  shift: string;
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
  biometricsEnabled: boolean;
  medicalInfo: {
    bloodGroup: string;
    allergies: string;
    insuranceId: string;
    lastCheckup: string;
  };
}

export interface KBDocument {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  ownerDept?: string;
  excerpt: string;
  chunks?: {
    id: string;
    heading: string;
    text: string;
  }[];
}

export interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late";
  clockIn: string;
  clockOut: string;
  late: boolean;
  location?: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    accuracy: number;
    source: 'gps' | 'network' | 'beacon' | 'cached';
    isWithinGeofence: boolean;
  };
  authenticationType?: 'biometric' | 'pin' | 'manual';
  isOfflineRecord?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface ESignDocument {
  id: string;
  title: string;
  dept: string;
  emergency: "Normal" | "High" | "Critical";
  deadline: string;
  route: "Sequential" | "Parallel";
  owner: string;
  kbId?: string;
  createdAt: string;
  hasDocument: boolean;
  signers: ESignSigner[];
  completedAt?: string;
}

export interface ESignSigner {
  id: string;
  name: string;
  designation: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  from: string;
  to: string;
  status: "pending" | "approved" | "rejected";
}

export interface Complaint {
  id: string;
  subject: string;
  category: string;
  status: "pending" | "resolved";
  date: string;
  priority: "Low" | "Medium" | "High";
  description?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  text: string;
  cite?: {
    docId: string;
    heading: string;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  folderId: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatFolder {
  id: string;
  name: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface EmployeeWithNotifications extends Employee {
  unreadNotifications: number;
}
// Enhanced Attendance Record for new system
export interface EnhancedAttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  location: LocationData;
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

export interface LocationData {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accuracy: number;
  timestamp: Date;
  source: 'gps' | 'network' | 'beacon' | 'cached';
  isWithinGeofence: boolean;
  distanceFromCenter?: number;
}

// QS Request types
export interface QSRequest {
  id: string;
  employeeId: string;
  type: 'attendance_correction' | 'time_adjustment' | 'manual_entry';
  requestDate: Date;
  targetDate: Date;
  originalClockIn?: Date;
  originalClockOut?: Date;
  requestedClockIn?: Date;
  requestedClockOut?: Date;
  reason: string;
  attachments: DocumentAttachment[];
  status: 'pending' | 'approved' | 'rejected' | 'requires_info';
  workflowSteps: WorkflowStep[];
  auditTrail: AuditEntry[];
}

export interface WorkflowStep {
  id: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: Date;
  comments?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Movement Request types
export interface MovementRequest {
  id: string;
  employeeId: string;
  date: Date;
  departureTime: Date;
  expectedReturnTime: Date;
  actualReturnTime?: Date;
  destination: string;
  purpose: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'overdue';
  route: RoutePoint[];
  estimatedTravelTime: number;
  actualTravelTime?: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
}
export interface Issue {
  id: string;
  reporter: string;
  department: string;
  area: string;
  description: string;
  priority: "Low" | "Moderate" | "High";
  status: "Open" | "Resolved";
  reportedDate: string;
}