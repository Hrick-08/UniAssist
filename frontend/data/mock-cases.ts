export interface CaseTimelineEvent {
  step: string;
  status: "completed" | "current" | "pending";
  date: string;
  description: string;
}

export interface SupportCase {
  id: string;
  trackingNumber: string;
  studentName: string;
  studentId: string;
  category: "Academic" | "Financial" | "Wellbeing" | "Campus Life" | "Safety" | "Career" | "Administration";
  subcategory: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priorityLevel: 1 | 2 | 3 | 4;
  urgencyLabel: string;
  status: "New" | "In Progress" | "Awaiting Student" | "Resolved";
  assignedTeam: string;
  assignedAdvisor: string;
  expectedResponse: string;
  createdDate: string;
  problemSummary: string;
  studentNote: string;
  sharedDataSummary: string[];
  timeline: CaseTimelineEvent[];
  appointmentScheduled?: {
    date: string;
    time: string;
    location: string;
    advisor: string;
  };
}

export const MOCK_CASES: SupportCase[] = [
  {
    id: "case-1042",
    trackingNumber: "STU-1042",
    studentName: "Alex Rivera",
    studentId: "2024CS891",
    category: "Academic",
    subcategory: "Exam & Workload Management",
    priority: "MEDIUM",
    priorityLevel: 2,
    urgencyLabel: "Support Recommended",
    status: "In Progress",
    assignedTeam: "Academic Advising Center",
    assignedAdvisor: "Dr. Sarah Jenkins",
    expectedResponse: "Within 24 hours",
    createdDate: "Today, 10:15 AM",
    problemSummary: "Struggling to balance 4 concurrent midterm projects with semester examinations. Missing morning classes.",
    studentNote: "I've been feeling overwhelmed with exams and assignments and I need guidance on requesting a short extension.",
    sharedDataSummary: [
      "Difficulty managing coursework",
      "Upcoming examination pressure",
      "Assignments affecting regular study pace"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Today 10:15 AM", description: "Problem categorized under Academic Advising" },
      { step: "Case Assigned", status: "completed", date: "Today 10:20 AM", description: "Assigned to Dr. Sarah Jenkins (Senior Advisor)" },
      { step: "Advisor Review", status: "current", date: "Today 11:00 AM", description: "Advisor reviewing current course load & extension eligibility" },
      { step: "Consultation / Resolution", status: "pending", date: "Pending", description: "1-on-1 workload balancing meeting" }
    ],
    appointmentScheduled: {
      date: "October 8, 2026",
      time: "2:30 PM",
      location: "Student Support Center, Room 304",
      advisor: "Dr. Sarah Jenkins"
    }
  },
  {
    id: "case-2188",
    trackingNumber: "STU-2188",
    studentName: "Priya Sharma",
    studentId: "2023EC104",
    category: "Financial",
    subcategory: "Tuition Installment Request",
    priority: "MEDIUM",
    priorityLevel: 2,
    urgencyLabel: "Support Recommended",
    status: "In Progress",
    assignedTeam: "Financial Aid & Scholarship Office",
    assignedAdvisor: "Michael Vance",
    expectedResponse: "Tomorrow by 5 PM",
    createdDate: "Yesterday, 2:40 PM",
    problemSummary: "Requesting split payment for semester fees due to banking delay in education loan clearance.",
    studentNote: "My education loan tranche is scheduled for release on the 25th. I need a temporary hold on the late fee penalty.",
    sharedDataSummary: [
      "Bank sanction letter attached",
      "Requesting 2-part installment",
      "Late fee waiver consideration"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Yesterday 2:40 PM", description: "Routed to Financial Aid Office" },
      { step: "Case Assigned", status: "completed", date: "Yesterday 3:15 PM", description: "Assigned to Michael Vance" },
      { step: "Loan Verification", status: "current", date: "Today 9:30 AM", description: "Communicating with bank representative" },
      { step: "Installment Approval", status: "pending", date: "Pending", description: "Formal fee portal adjustment" }
    ]
  },
  {
    id: "case-3321",
    trackingNumber: "STU-3321",
    studentName: "Jordan Lee",
    studentId: "2025ME419",
    category: "Wellbeing",
    subcategory: "Stress & Sleep Disruption",
    priority: "HIGH",
    priorityLevel: 3,
    urgencyLabel: "Priority Support",
    status: "Awaiting Student",
    assignedTeam: "Student Wellbeing Services",
    assignedAdvisor: "Counselor Elena Rostova",
    expectedResponse: "Within 6 hours",
    createdDate: "Today, 8:05 AM",
    problemSummary: "Severe academic stress leading to insomnia and high anxiety prior to engineering vivas.",
    studentNote: "I haven't slept properly in 4 days and feel panic whenever I enter the engineering lab.",
    sharedDataSummary: [
      "Persistent anxiety around upcoming presentations",
      "Sleep deprivation affecting daily concentration",
      "Requested confidential counseling slot"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Today 8:05 AM", description: "High-priority wellbeing triage flag" },
      { step: "Assigned to Counselor", status: "completed", date: "Today 8:15 AM", description: "Assigned to Counselor Elena Rostova" },
      { step: "Slot Invitation Sent", status: "current", date: "Today 8:40 AM", description: "Priority counseling timeslot offered to student" },
      { step: "Session Completed", status: "pending", date: "Pending", description: "In-person confidential session" }
    ],
    appointmentScheduled: {
      date: "Tomorrow, Oct 6",
      time: "11:30 AM",
      location: "Health & Wellbeing Pavillion, Room 102",
      advisor: "Elena Rostova, LPC"
    }
  },
  {
    id: "case-4091",
    trackingNumber: "STU-4091",
    studentName: "Marcus Sterling",
    studentId: "2022BT055",
    category: "Campus Life",
    subcategory: "Hostel Maintenance & Plumbing",
    priority: "LOW",
    priorityLevel: 1,
    urgencyLabel: "General Guidance",
    status: "Resolved",
    assignedTeam: "Hostel Administration",
    assignedAdvisor: "Facilities Helpdesk",
    expectedResponse: "Resolved",
    createdDate: "Oct 3, 2026",
    problemSummary: "Hot water geyser in Block C 4th floor bathroom was leaking.",
    studentNote: "Geyser is constantly dripping water on the floor.",
    sharedDataSummary: [
      "Block C Floor 4 restroom",
      "Maintenance request logged"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Oct 3, 11:00 AM", description: "Ticket created for maintenance" },
      { step: "Plumber Dispatched", status: "completed", date: "Oct 3, 1:30 PM", description: "Technician inspected valve" },
      { step: "Repaired", status: "completed", date: "Oct 3, 4:00 PM", description: "Valve replaced and verified" }
    ]
  },
  {
    id: "case-5510",
    trackingNumber: "STU-5510",
    studentName: "Ananya Deshmukh",
    studentId: "2024DS211",
    category: "Career",
    subcategory: "Internship NOC Endorsement",
    priority: "LOW",
    priorityLevel: 1,
    urgencyLabel: "General Guidance",
    status: "Resolved",
    assignedTeam: "Career Services",
    assignedAdvisor: "Placement Cell Admin",
    expectedResponse: "Resolved",
    createdDate: "Oct 2, 2026",
    problemSummary: "Required signed institutional NOC for summer research internship in Tokyo.",
    studentNote: "The research institute requires university clearance within 10 days.",
    sharedDataSummary: [
      "Offer letter verified",
      "Department head recommendation received"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Oct 2, 10:00 AM", description: "Document verification started" },
      { step: "HOD Approval", status: "completed", date: "Oct 2, 3:30 PM", description: "Academic credits matched" },
      { step: "NOC Issued", status: "completed", date: "Oct 3, 10:00 AM", description: "Digital signed certificate delivered" }
    ]
  },
  {
    id: "case-6129",
    trackingNumber: "STU-6129",
    studentName: "David O'Connor",
    studentId: "2023CS619",
    category: "Academic",
    subcategory: "Attendance Medical Condonation",
    priority: "MEDIUM",
    priorityLevel: 2,
    urgencyLabel: "Support Recommended",
    status: "In Progress",
    assignedTeam: "Academic Advising Center",
    assignedAdvisor: "Prof. Kenneth Clark",
    expectedResponse: "Within 48 hours",
    createdDate: "Oct 4, 2026",
    problemSummary: "Hospitalized for dengue for 12 days; fell below the 75% mandatory lecture attendance threshold.",
    studentNote: "I have discharge papers from City Hospital and doctor's fitness certificate.",
    sharedDataSummary: [
      "12 days medical certificate",
      "Hospitalization records attached",
      "Seeking attendance waiver before midterms"
    ],
    timeline: [
      { step: "Triage Completed", status: "completed", date: "Oct 4, 9:20 AM", description: "Medical documents submitted" },
      { step: "Medical Officer Review", status: "completed", date: "Oct 4, 2:00 PM", description: "Certificate authenticated" },
      { step: "Academic Dean Clearance", status: "current", date: "Today 10:00 AM", description: "Updating ERP attendance register" }
    ]
  },
  {
    id: "case-7740",
    trackingNumber: "STU-7740",
    studentName: "Chloe Dupont",
    studentId: "2025PY108",
    category: "Administration",
    subcategory: "Lost ID & Access Card",
    priority: "LOW",
    priorityLevel: 1,
    urgencyLabel: "General Guidance",
    status: "Resolved",
    assignedTeam: "University Registrar",
    assignedAdvisor: "Student ID Desk",
    expectedResponse: "Resolved",
    createdDate: "Oct 1, 2026",
    problemSummary: "Physical student RFID card misplaced in cafeteria.",
    studentNote: "Need replacement smart card to access library turnstiles.",
    sharedDataSummary: ["Card deactivated remotely", "Replacement print order approved"],
    timeline: [
      { step: "Reported", status: "completed", date: "Oct 1, 1:15 PM", description: "Old card blocked" },
      { step: "Card Printed", status: "completed", date: "Oct 1, 4:00 PM", description: "Ready at Student Services counter" }
    ]
  },
  {
    id: "case-8902",
    trackingNumber: "STU-8902",
    studentName: "Kavita Nair",
    studentId: "2024CH330",
    category: "Safety",
    subcategory: "Harassment Escalation",
    priority: "CRITICAL",
    priorityLevel: 4,
    urgencyLabel: "CRITICAL — Escalation",
    status: "In Progress",
    assignedTeam: "Campus Safety & Student Protection",
    assignedAdvisor: "Chief Security Officer Miller",
    expectedResponse: "Immediate (Ongoing)",
    createdDate: "Oct 4, 11:45 PM",
    problemSummary: "Persistent harassment and unwanted following after late-night lab session.",
    studentNote: "Security escort escorted me to my hostel room safely. Case opened for formal investigation.",
    sharedDataSummary: [
      "Incident location logged: Science Quad",
      "CCTV footage reviewed by security",
      "Protective measures enacted"
    ],
    timeline: [
      { step: "Emergency Dispatch", status: "completed", date: "Oct 4, 11:46 PM", description: "On-duty patrol responded in 3 minutes" },
      { step: "Safe Escort", status: "completed", date: "Oct 4, 11:55 PM", description: "Student secured in residence" },
      { step: "Formal Inquiry", status: "current", date: "Yesterday 9:00 AM", description: "Security and student affairs investigating incident" }
    ]
  }
];
