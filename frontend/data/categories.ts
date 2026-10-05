export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  description: string;
  subcategories: string[];
  examples: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "academic",
    name: "Academic",
    icon: "GraduationCap",
    color: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "text-blue-700",
    borderColor: "hover:border-blue-500",
    description: "Coursework, exam anxiety, missing credits, and faculty communications.",
    subcategories: ["Exams & Assessments", "Course Workload", "Attendance Issues", "Faculty Concerns"],
    examples: [
      "I'm struggling to manage my classes and exams.",
      "I fell behind on 3 assignments and need an extension.",
      "I missed attendance due to illness and might get debarred."
    ]
  },
  {
    id: "financial",
    name: "Financial",
    icon: "Coins",
    color: "from-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "text-emerald-700",
    borderColor: "hover:border-emerald-500",
    description: "Tuition deadlines, scholarship eligibility, installment plans, and emergency aid.",
    subcategories: ["Semester Fee Deadlines", "Scholarships & Grants", "Emergency Financial Aid", "Fee Installments"],
    examples: [
      "I need urgent guidance on emergency financial support.",
      "When is the final date for the merit scholarship verification?",
      "Can I pay my semester fee in two split installments?"
    ]
  },
  {
    id: "wellbeing",
    name: "Wellbeing",
    icon: "HeartPulse",
    color: "from-purple-600 to-pink-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeText: "text-purple-700",
    borderColor: "hover:border-purple-500",
    description: "Confidential emotional support, stress, burnout, and mental health counseling.",
    subcategories: ["Stress & Burnout", "Feeling Overwhelmed", "Emotional Support", "Sleep & Anxiety"],
    examples: [
      "I've been feeling extremely overwhelmed and unable to focus.",
      "I'm experiencing intense panic before upcoming finals.",
      "I need to talk to a university counselor confidentially."
    ]
  },
  {
    id: "accommodation",
    name: "Campus Life",
    icon: "Home",
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "text-amber-700",
    borderColor: "hover:border-amber-500",
    description: "Hostel accommodation, mess food, campus transport, and room maintenance.",
    subcategories: ["Hostel & Room Allocation", "Dining & Mess Issues", "Campus Transportation", "Facilities & Maintenance"],
    examples: [
      "My hostel room AC has been broken for 4 days.",
      "I want to request a room change due to conflicts.",
      "The late-night campus shuttle bus schedule is inconsistent."
    ]
  },
  {
    id: "safety",
    name: "Safety & Security",
    icon: "ShieldAlert",
    color: "from-red-600 to-rose-600",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    badgeText: "text-red-700",
    borderColor: "hover:border-red-500",
    description: "Zero-tolerance support for harassment, safety hazards, bullying, or threats.",
    subcategories: ["Harassment or Bullying", "Physical Safety Concern", "Discrimination", "Campus Security Escort"],
    examples: [
      "Someone is persistently harassing me in the department.",
      "I felt unsafe walking back from the library late at night.",
      "I need immediate campus security assistance."
    ]
  },
  {
    id: "career",
    name: "Career & Placements",
    icon: "Briefcase",
    color: "from-cyan-600 to-blue-700",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badgeText: "text-cyan-700",
    borderColor: "hover:border-cyan-500",
    description: "Internship approvals, resume reviews, placement drives, and career guidance.",
    subcategories: ["Internship Approvals", "Campus Placement Drives", "Resume & Portfolio Review", "Career Counseling"],
    examples: [
      "How do I get an NOC for an off-campus summer internship?",
      "Can someone review my tech resume before placement week?",
      "I'm unsure which career track aligns with my degree."
    ]
  },
  {
    id: "social",
    name: "Personal & Social",
    icon: "Users",
    color: "from-fuchsia-600 to-indigo-600",
    badgeBg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    badgeText: "text-fuchsia-700",
    borderColor: "hover:border-fuchsia-500",
    description: "Navigating university life, loneliness, peer conflicts, and family pressures.",
    subcategories: ["Social Isolation / Loneliness", "Peer & Team Conflicts", "Family Pressures", "Adjusting to University"],
    examples: [
      "I feel isolated and haven't made many friends this semester.",
      "Conflict with my capstone group members is escalating.",
      "I'm dealing with difficult personal news from home."
    ]
  },
  {
    id: "administrative",
    name: "Administration",
    icon: "FileText",
    color: "from-slate-600 to-gray-700",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    badgeText: "text-slate-700",
    borderColor: "hover:border-slate-500",
    description: "Official transcripts, bonafide certificates, student ID replacements, and records.",
    subcategories: ["Official Transcripts & Bonafide", "ID Card & Smartcard Issues", "Course Registration Forms", "Leave of Absence"],
    examples: [
      "How do I apply for an urgent bonafide certificate for visa?",
      "I lost my physical student ID card on campus.",
      "What is the procedure for an official medical leave of absence?"
    ]
  }
];
