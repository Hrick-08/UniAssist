// Maps each service's display category to the backend's category slug, so
// "Book Appointment" can hand off into a real triage conversation.
export const SUPPORT_CATEGORY_SLUGS: Record<string, string> = {
  Academic: "academic",
  Wellbeing: "wellbeing",
  Financial: "financial",
  Safety: "safety",
  Career: "career",
  "Campus Life": "accommodation",
  Administration: "administrative"
};

export interface SupportService {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  location: string;
  building: string;
  room: string;
  email: string;
  phone: string;
  hours: string;
  urgentAvailable: boolean;
  appointmentTypes: string[];
  coordinates: { x: number; y: number }; // For campus map visual
}

export const SUPPORT_SERVICES: SupportService[] = [
  {
    id: "academic-advising",
    name: "Academic Advising Center",
    category: "Academic",
    tagline: "Workload balancing, exam mitigation, and degree planning",
    description: "Dedicated faculty advisors to help you plan coursework, manage academic distress, request assignment deadline extensions, and review exam appeals.",
    location: "Student Services Hub, 3rd Floor",
    building: "Central Library Complex (Block A)",
    room: "Room 304",
    email: "advising@university.edu",
    phone: "+1 (555) 342-8810",
    hours: "Mon – Fri: 9:00 AM – 5:00 PM",
    urgentAvailable: true,
    appointmentTypes: ["In-person 1-on-1", "Virtual Video Call", "Email Consultation"],
    coordinates: { x: 38, y: 32 }
  },
  {
    id: "wellbeing-counseling",
    name: "Student Wellbeing & Counseling Support",
    category: "Wellbeing",
    tagline: "Free, confidential emotional support and psychological counseling",
    description: "Licensed psychologists and peer wellbeing mentors providing crisis de-escalation, stress management strategies, burnout prevention, and individual talk therapy.",
    location: "Health & Wellbeing Pavillion",
    building: "Green Wellness Centre (East Wing)",
    room: "Room 102",
    email: "wellbeing@university.edu",
    phone: "+1 (555) 342-9900",
    hours: "24/7 Helpline Available | In-person: Mon – Sat 8:30 AM – 7:00 PM",
    urgentAvailable: true,
    appointmentTypes: ["Confidential Counseling (45 min)", "Crisis Drop-in (Immediate)", "Peer Wellbeing Check-in"],
    coordinates: { x: 65, y: 28 }
  },
  {
    id: "financial-aid",
    name: "Financial Aid & Scholarship Office",
    category: "Financial",
    tagline: "Emergency student grants, tuition installment plans, and scholarship verification",
    description: "Guidance on managing unexpected financial hardship, applying for emergency student relief grants, scholarship compliance, and semester fee installment waivers.",
    location: "Administrative Tower, Ground Floor",
    building: "Administrative Tower (Block B)",
    room: "Counter 4 & 5",
    email: "finaid@university.edu",
    phone: "+1 (555) 342-7720",
    hours: "Mon – Fri: 9:30 AM – 4:30 PM",
    urgentAvailable: false,
    appointmentTypes: ["Emergency Grant Review", "Scholarship Documentation", "Fee Installment Counseling"],
    coordinates: { x: 25, y: 55 }
  },
  {
    id: "campus-safety",
    name: "Campus Safety & Emergency Dispatch",
    category: "Safety",
    tagline: "24/7 Rapid response for security, harassment reports, and safe-walk escorts",
    description: "Trained campus security team equipped for immediate emergency intervention, confidential harassment reporting, and late-night walking escorts across campus.",
    location: "Security Central Operations",
    building: "Campus Security Pavilion (Main Gate)",
    room: "Emergency Dispatch Room",
    email: "security@university.edu",
    phone: "+1 (555) 911-SAFE (7233)",
    hours: "24 Hours / 7 Days a week",
    urgentAvailable: true,
    appointmentTypes: ["Immediate Dispatch", "Confidential Incident Report", "Night Escort Request"],
    coordinates: { x: 80, y: 70 }
  },
  {
    id: "career-services",
    name: "Career Development & Placement Cell",
    category: "Career",
    tagline: "Resume reviews, internship credits, and recruitment preparations",
    description: "Assisting students with resume audits, mock technical and behavioral interviews, corporate internship endorsements, and campus placement registration.",
    location: "Innovation & Career Hub",
    building: "Tech Center (Block C)",
    room: "Room 210",
    email: "careers@university.edu",
    phone: "+1 (555) 342-6640",
    hours: "Mon – Fri: 10:00 AM – 6:00 PM",
    urgentAvailable: false,
    appointmentTypes: ["1-on-1 Resume Critique", "Mock Interview", "Internship Credit Sign-off"],
    coordinates: { x: 48, y: 68 }
  },
  {
    id: "residence-life",
    name: "Hostel & Residence Life Administration",
    category: "Campus Life",
    tagline: "Room allocations, mess quality, facilities, and maintenance tickets",
    description: "Overseeing student on-campus housing, roommate mediation, hostel repairs, mess catering complaints, and campus shuttle transport passes.",
    location: "Residential Village Hub",
    building: "North Residence Commons",
    room: "Management Suite",
    email: "housing@university.edu",
    phone: "+1 (555) 342-5530",
    hours: "Mon – Sat: 8:00 AM – 8:00 PM",
    urgentAvailable: true,
    appointmentTypes: ["Room Change Consultation", "Maintenance Escalation", "Warden Appointment"],
    coordinates: { x: 20, y: 22 }
  },
  {
    id: "registrar-office",
    name: "University Registrar & Student Records",
    category: "Administration",
    tagline: "Official transcripts, bonafide verification, smartcard ID replacements",
    description: "Official repository for university documents, semester grade cards, bonafide certificates for passport/visas, and replacement student smart ID cards.",
    location: "Administrative Tower, 1st Floor",
    building: "Administrative Tower (Block B)",
    room: "Room 112",
    email: "registrar@university.edu",
    phone: "+1 (555) 342-4410",
    hours: "Mon – Fri: 9:00 AM – 4:00 PM",
    urgentAvailable: false,
    appointmentTypes: ["Document Verification", "Express Bonafide Dispatch", "Student Record Update"],
    coordinates: { x: 30, y: 50 }
  }
];
