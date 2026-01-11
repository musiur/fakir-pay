import {
  AttendanceRecord,
  Employee,
  ESignDocument,
  KBDocument,
} from "../types";

export const EMPLOYEES: Employee[] = [
  {
    id: "FFL-1001",
    name: "Fuad Tasrim Hossain",
    designation: "Senior Merchandiser",
    department: "Merchandising",
    joinDate: "2017-04-03",
    phone: "+880 1711-234567",
    emergency: "+880 1999-876543",
    shift: "A (06:00—14:00)",
    leaveBalance: { annual: 12, sick: 8, casual: 6 },
    biometricsEnabled: true,
  },
  {
    id: "FFL-1020",
    name: "Ayesha Rahman",
    designation: "HR Officer",
    department: "HR & Admin",
    joinDate: "2019-10-15",
    phone: "+880 1711-987654",
    emergency: "+880 1888-543210",
    shift: "B (14:00—22:00)",
    leaveBalance: { annual: 9, sick: 10, casual: 4 },
    biometricsEnabled: true,
  },
];

export const KB_DOCS: KBDocument[] = [
  {
    id: "KB-LEAVE-23",
    title: "Leave Policy v2.3",
    category: "HR Policies",
    lastUpdated: "2025-07-02",
    ownerDept: "HR",
    excerpt:
      "Apply for Annual, Sick, or Casual leave with manager approval within 48 hours. Emergency leave requires medical documentation.",
    chunks: [
      {
        id: "c1",
        heading: "Eligibility",
        text: "All full-time employees who have completed probation (90 days) are eligible for Annual, Sick and Casual leave. Annual leave accrues at 1.5 days per month (18 days per year). Sick leave is capped at 14 days per year. Casual leave is 10 days per year, non-cumulative.",
      },
      {
        id: "c2",
        heading: "Application Process",
        text: "Submit leave request via mobile portal at least 3 days in advance for planned leave. Manager must approve within 48 hours. For urgent leave, contact your supervisor directly and submit documentation within 24 hours of return. HR reviews all leave requests for compliance.",
      },
      {
        id: "c3",
        heading: "Emergency Leave",
        text: "Emergency leave may be auto-approved by HR for medical emergencies, family emergencies, or natural disasters. Medical certificate required within 3 working days. Maximum 5 days emergency leave per incident. Additional days will be deducted from annual leave balance.",
      },
      {
        id: "c4",
        heading: "Maternity & Paternity",
        text: "Female employees: 16 weeks paid maternity leave (8 weeks before, 8 weeks after delivery). Male employees: 10 days paid paternity leave within 6 months of birth. Documentation required: birth certificate, medical records.",
      },
    ],
  },
  {
    id: "KB-COM-25",
    title: "Policy Acknowledgement 2025",
    category: "Compliance",
    lastUpdated: "2025-08-01",
    ownerDept: "Compliance",
    excerpt:
      "All staff must acknowledge the revised employee handbook, code of conduct, and safety protocols in the app by August 31, 2025.",
    chunks: [
      {
        id: "c1",
        heading: "Scope & Coverage",
        text: "All departments and employees are required to complete digital acknowledgement. This includes: Employee Handbook v5.0, Code of Conduct, Anti-Harassment Policy, Data Protection Guidelines, and Workplace Safety Standards. Non-compliance may result in system access restrictions.",
      },
      {
        id: "c2",
        heading: "Acknowledgement Deadline",
        text: "Employees must complete acknowledgement by August 31, 2025. Late acknowledgements require manager approval and written explanation. HR will send automated reminders at 15, 7, and 1 day before deadline. Failure to acknowledge may affect performance review.",
      },
      {
        id: "c3",
        heading: "Review Process",
        text: "Read each section carefully. Quiz questions may appear to confirm understanding. Estimated completion time: 45 minutes. Documents available in English and Bangla. Contact compliance@fakirfashion.com for questions or accessibility needs.",
      },
    ],
  },
  {
    id: "KB-SEC-11",
    title: "Password & MFA Standard v1.1",
    category: "IT & Security",
    lastUpdated: "2025-06-14",
    ownerDept: "IT Security",
    excerpt:
      "Minimum 12 characters, MFA required for payroll and e-sign. Password rotation every 90 days. No password reuse for last 5 passwords.",
    chunks: [
      {
        id: "c1",
        heading: "Password Requirements",
        text: "Passwords must be minimum 12 characters including: uppercase letter, lowercase letter, number, and special symbol (@#$%&*). Cannot contain: username, employee ID, common words, or keyboard patterns (qwerty, 123456). Passwords expire every 90 days. System will prompt for change 7 days before expiry.",
      },
      {
        id: "c2",
        heading: "Multi-Factor Authentication",
        text: "MFA mandatory for: Payroll system, E-signature platform, HR portal, and VPN access. Supported methods: SMS OTP, Email OTP, or Authenticator App (Google/Microsoft). Setup MFA during first login. Emergency bypass available through IT helpdesk with manager approval.",
      },
      {
        id: "c3",
        heading: "Account Security",
        text: "Account locked after 5 failed login attempts. Unlock requires IT helpdesk ticket or manager approval. Never share passwords or OTP codes. Report suspicious activity immediately to security@fakirfashion.com. Periodic security training mandatory for all employees.",
      },
    ],
  },
  {
    id: "KB-OPS-40",
    title: "Sewing Line Startup SOP v4.0",
    category: "Operations",
    lastUpdated: "2025-05-21",
    ownerDept: "Operations",
    excerpt:
      "Pre-shift checks, machine calibration, and safety verification steps for all sewing production lines. Mandatory for line supervisors and operators.",
    chunks: [
      {
        id: "c1",
        heading: "Pre-Shift Inspection Checklist",
        text: "Before starting production: (1) Inspect all needles for damage or wear, (2) Check oil levels in machine reservoirs, (3) Verify thread tension settings, (4) Test emergency stop buttons, (5) Confirm safety guards are properly installed, (6) Check lighting levels (minimum 500 lux), (7) Verify first aid kit availability, (8) Document inspection in logbook.",
      },
      {
        id: "c2",
        heading: "Machine Calibration",
        text: "Run 2-minute calibration cycle on each workstation: (1) Set correct stitch length for garment type, (2) Adjust presser foot pressure, (3) Test feed dog alignment, (4) Run sample stitches on scrap fabric, (5) Verify stitch quality meets QC standards, (6) Adjust as needed and re-test, (7) Document calibration completion time and operator ID.",
      },
      {
        id: "c3",
        heading: "Quality Standards",
        text: "First piece inspection mandatory before bulk production. Check: seam strength (minimum 50N), stitch density (10-12 SPI for woven, 12-14 SPI for knits), seam appearance, thread color match. Line supervisor must approve first piece. Hourly quality audits during production. Defect rate must stay below 2%.",
      },
    ],
  },
  {
    id: "KB-SAFE-32",
    title: "Fire Drill Procedure v3.2",
    category: "Safety",
    lastUpdated: "2025-04-10",
    ownerDept: "Safety & Compliance",
    excerpt:
      "Quarterly fire drills with designated assembly points, floor wardens, and evacuation routes. All employees must participate.",
    chunks: [
      {
        id: "c1",
        heading: "Drill Frequency & Notification",
        text: "Fire drills conducted quarterly (January, April, July, October). Advance notice provided 72 hours before drill via email and notice boards. Unannounced drills may occur twice per year to test emergency readiness. Participation mandatory for all employees present on premises.",
      },
      {
        id: "c2",
        heading: "Evacuation Procedure",
        text: "Upon alarm: (1) Stop work immediately, (2) Leave belongings, (3) Walk quickly to nearest exit (do not run), (4) Follow green exit signs, (5) Use stairs only (never elevators), (6) Assist colleagues with mobility issues, (7) Proceed to designated assembly point, (8) Report to floor warden for headcount, (9) Wait for all-clear signal before re-entering.",
      },
      {
        id: "c3",
        heading: "Assembly Points & Wardens",
        text: "Assembly points marked on safety maps (posted at each floor entrance): Floor 1-2: Main parking lot East, Floor 3-4: Main parking lot West, Floor 5-6: Side parking North. Floor wardens wear yellow vests, conduct headcount using floor roster, report missing persons to incident commander immediately. Re-entry only after Safety Officer approval.",
      },
    ],
  },
  {
    id: "KB-LEGAL-25",
    title: "Vendor NDA Template v2025",
    category: "Legal",
    lastUpdated: "2025-07-28",
    ownerDept: "Legal & Contracts",
    excerpt:
      "Standard Non-Disclosure Agreement template for external vendors, suppliers, and buyers. Includes intellectual property, confidentiality, and data protection clauses.",
    chunks: [
      {
        id: "c1",
        heading: "Usage & Applicability",
        text: "Use this NDA template for: (1) New vendor onboarding, (2) Technology partner agreements, (3) Buyer negotiations, (4) Contractor engagements, (5) Third-party service providers. Do NOT use for: Employee agreements (use HR template), Joint ventures (use partnership agreement), Government agencies (use special template). Legal team review required for any modifications.",
      },
      {
        id: "c2",
        heading: "Key Clauses Overview",
        text: "Standard NDA includes: (1) Definition of Confidential Information, (2) 5-year confidentiality period, (3) Permitted disclosures (legal requirements), (4) Return of materials clause, (5) No license grant to IP, (6) Indemnification provisions, (7) Governing law: Bangladesh, (8) Dispute resolution: Arbitration in Dhaka. Both parties must sign. Witness signatures required for validity.",
      },
      {
        id: "c3",
        heading: "E-Signature Process",
        text: 'Route NDA through E-Sign module: (1) Upload finalized PDF, (2) Add vendor contact as signer, (3) Add Legal team as reviewer, (4) Set signing sequence: Vendor → Legal → Business Unit Head, (5) Mark as "High" priority for urgent deals, (6) System sends automated reminders every 48 hours, (7) Completed NDAs auto-archived in Legal repository.',
      },
    ],
  },
  {
    id: "KB-FIN-07",
    title: "Expense Reimbursement Policy v2.4",
    category: "Finance",
    lastUpdated: "2025-06-20",
    ownerDept: "Finance",
    excerpt:
      "Guidelines for employee expense claims including travel, meals, accommodation, and business expenses. Per diem rates and approval limits.",
    chunks: [
      {
        id: "c1",
        heading: "Eligible Expenses",
        text: "Reimbursable expenses: (1) Business travel (train, bus, air), (2) Client meetings and entertainment, (3) Hotel accommodation (up to ৳5,000/night), (4) Meals during travel (per diem: ৳1,500/day), (5) Mobile and internet charges (up to ৳1,000/month), (6) Office supplies (pre-approved). Not reimbursable: Personal expenses, alcohol, luxury items, fines/penalties, expenses without receipts.",
      },
      {
        id: "c2",
        heading: "Claim Submission Process",
        text: "Submit claims within 15 days of expense date. Required documents: (1) Original receipts (photos acceptable for amounts under ৳500), (2) Completed expense form, (3) Manager approval, (4) Travel approval email (for travel claims). Process time: 7-10 working days after approval. Payment via bank transfer to registered employee account.",
      },
    ],
  },
  {
    id: "KB-HR-15",
    title: "Performance Review Guidelines 2025",
    category: "HR Policies",
    lastUpdated: "2025-03-15",
    ownerDept: "HR",
    excerpt:
      "Annual performance review process, rating scales, goal setting frameworks, and promotion criteria.",
    chunks: [
      {
        id: "c1",
        heading: "Review Schedule",
        text: "Performance reviews conducted annually in December. Mid-year check-ins mandatory in June. New employees: first review after 6 months (probation completion). Process: (1) Employee self-assessment, (2) Manager evaluation, (3) Peer feedback (360° for senior roles), (4) HR review, (5) Final rating meeting. Rating scale: Outstanding (5), Exceeds Expectations (4), Meets Expectations (3), Needs Improvement (2), Unsatisfactory (1).",
      },
      {
        id: "c2",
        heading: "Goal Setting & KPIs",
        text: "SMART goals framework: Specific, Measurable, Achievable, Relevant, Time-bound. Minimum 3, maximum 7 goals per employee. Categories: (1) Business objectives, (2) Professional development, (3) Team collaboration, (4) Innovation/improvement. Goals set in January, reviewed quarterly. Weightage: Business objectives 60%, Development 20%, Collaboration 20%.",
      },
    ],
  },
  {
    id: "KB-IT-09",
    title: "Remote Access & VPN Setup Guide",
    category: "IT & Security",
    lastUpdated: "2025-05-05",
    ownerDept: "IT",
    excerpt:
      "Instructions for setting up VPN access to company systems for remote work. Security protocols and troubleshooting steps.",
    chunks: [
      {
        id: "c1",
        heading: "VPN Access Request",
        text: "Eligibility: Approved remote work arrangement or business travel. Request process: (1) Submit IT ticket with justification, (2) Manager approval required, (3) Complete security training (1 hour), (4) Sign remote work policy, (5) IT provisions VPN credentials within 24 hours. Access reviewed quarterly. Unauthorized VPN use may result in disciplinary action.",
      },
      {
        id: "c2",
        heading: "Installation & Configuration",
        text: "Supported VPN clients: Cisco AnyConnect (recommended), OpenVPN. Download from: https://vpn.fakirfashion.com. Setup: (1) Install VPN client, (2) Import company profile, (3) Enter username (employee ID), (4) Enter password + MFA code, (5) Connect to server: vpn.fakirfashion.com. Connection timeout: 8 hours (auto-disconnect). Reconnect as needed. Do not share VPN credentials.",
      },
    ],
  },
  {
    id: "KB-QC-18",
    title: "Quality Control Standards for Garment Finishing",
    category: "Operations",
    lastUpdated: "2025-04-18",
    ownerDept: "Quality Control",
    excerpt:
      "Final inspection checklist for finished garments before packaging. Defect classification and acceptance criteria.",
    chunks: [
      {
        id: "c1",
        heading: "Final Inspection Checklist",
        text: "100% visual inspection required. Check points: (1) Stitching quality (no skipped stitches, loose threads), (2) Seam alignment (±2mm tolerance), (3) Color matching (within color tolerance), (4) Button/zipper functionality, (5) Label placement (care label, size label, brand label), (6) Iron finish (no shine, creases), (7) Measurements (within spec tolerance), (8) Cleanliness (no stains, marks). Document findings in QC report.",
      },
      {
        id: "c2",
        heading: "Defect Classification",
        text: "Critical defects: Safety issues, wrong size/color, major measurement errors, broken zippers - REJECT 100%. Major defects: Visible stitching issues, color shading, misaligned pockets - Accept up to 2.5% AQL. Minor defects: Loose thread ends, minor stitch irregularities, small marks - Accept up to 4.0% AQL. Buyer may have stricter standards - always follow buyer specs.",
      },
    ],
  },
];

const daysFromNow = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const ESIGN_DOCS: ESignDocument[] = [
  {
    id: "ES-100",
    title: "Policy Acknowledgement 2025",
    dept: "Compliance",
    emergency: "High",
    deadline: daysFromNow(3),
    route: "Sequential",
    owner: "FFL-1020",
    kbId: "KB-COM-25",
    createdAt: daysFromNow(-2),
    hasDocument: true,
    signers: [
      {
        id: "FFL-1001",
        name: "Fuad Tasrim Hossain",
        designation: "Senior Merchandiser",
        status: "pending",
      },
      {
        id: "FFL-1020",
        name: "Ayesha Rahman",
        designation: "HR Officer",
        status: "pending",
      },
    ],
  },
  {
    id: "ES-101",
    title: "Vendor NDA — Buyer X",
    dept: "Legal",
    emergency: "Normal",
    deadline: daysFromNow(7),
    route: "Sequential",
    owner: "FFL-1001",
    createdAt: daysFromNow(-1),
    hasDocument: true,
    signers: [
      {
        id: "FFL-1001",
        name: "Fuad Tasrim Hossain",
        designation: "Senior Merchandiser",
        status: "signed",
        signedAt: daysFromNow(-0.5),
      },
      {
        id: "FFL-1020",
        name: "Ayesha Rahman",
        designation: "HR Officer",
        status: "pending",
      },
    ],
  },
  {
    id: "ES-090",
    title: "Q3 Capital Expenditure Request",
    dept: "Finance",
    emergency: "Critical",
    deadline: daysFromNow(-1),
    route: "Parallel",
    owner: "FFL-1020",
    createdAt: daysFromNow(-10),
    hasDocument: true,
    signers: [
      {
        id: "FFL-1020",
        name: "Ayesha Rahman",
        designation: "HR Officer",
        status: "signed",
        signedAt: daysFromNow(-2),
      },
      {
        id: "FFL-1001",
        name: "Fuad Tasrim Hossain",
        designation: "Senior Merchandiser",
        status: "signed",
        signedAt: daysFromNow(-1.5),
      },
    ],
  },
  {
    id: "ES-095",
    title: "Equipment Lease Agreement - Sewing Machines",
    dept: "Operations",
    emergency: "Normal",
    deadline: daysFromNow(14),
    route: "Sequential",
    owner: "FFL-1001",
    createdAt: daysFromNow(-3),
    hasDocument: true,
    signers: [
      {
        id: "FFL-1001",
        name: "Fuad Tasrim Hossain",
        designation: "Senior Merchandiser",
        status: "pending",
      },
      {
        id: "FFL-1020",
        name: "Ayesha Rahman",
        designation: "HR Officer",
        status: "pending",
      },
    ],
  },
  {
    id: "ES-088",
    title: "Annual Performance Review - Team Acknowledgement",
    dept: "HR",
    emergency: "High",
    deadline: daysFromNow(5),
    route: "Parallel",
    owner: "FFL-1020",
    createdAt: daysFromNow(-1),
    hasDocument: true,
    signers: [
      {
        id: "FFL-1001",
        name: "Fuad Tasrim Hossain",
        designation: "Senior Merchandiser",
        status: "pending",
      },
      {
        id: "FFL-1020",
        name: "Ayesha Rahman",
        designation: "HR Officer",
        status: "pending",
      },
    ],
  },
];

export const ATTENDANCE_HISTORY: AttendanceRecord[] = [
  {
    date: "2025-08-11",
    status: "Present",
    clockIn: "05:58",
    clockOut: "14:03",
    late: false,
  },
  {
    date: "2025-08-10",
    status: "Present",
    clockIn: "06:03",
    clockOut: "14:02",
    late: false,
  },
  {
    date: "2025-08-09",
    status: "Present",
    clockIn: "06:01",
    clockOut: "14:05",
    late: false,
  },
  {
    date: "2025-08-08",
    status: "Absent",
    clockIn: "-",
    clockOut: "-",
    late: false,
  },
  {
    date: "2025-08-07",
    status: "Present",
    clockIn: "06:15",
    clockOut: "14:12",
    late: true,
  },
  {
    date: "2025-08-06",
    status: "Present",
    clockIn: "05:55",
    clockOut: "14:01",
    late: false,
  },
  {
    date: "2025-08-05",
    status: "Present",
    clockIn: "06:02",
    clockOut: "14:00",
    late: false,
  },
  {
    date: "2025-08-04",
    status: "Present",
    clockIn: "06:08",
    clockOut: "13:58",
    late: false,
  },
  {
    date: "2025-08-03",
    status: "Present",
    clockIn: "06:00",
    clockOut: "14:02",
    late: false,
  },
  {
    date: "2025-08-02",
    status: "Present",
    clockIn: "05:57",
    clockOut: "14:05",
    late: false,
  },
];
