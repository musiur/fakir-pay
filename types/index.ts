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
