export interface Resource {
  id: string;
  title: string;
  category: "Academic" | "Financial" | "Wellbeing" | "Campus Life" | "Safety" | "Career";
  description: string;
  readTime: string;
  downloads?: number;
  tags: string[];
  linkUrl: string;
  featured?: boolean;
}

export const MOCK_RESOURCES: Resource[] = [
  {
    id: "res-1",
    title: "Exam Period Workload & Time Management Guide",
    category: "Academic",
    description: "Step-by-step strategies for breaking down intensive course syllabi, creating sustainable study blocks, and mitigating pre-exam anxiety.",
    readTime: "5 min read",
    downloads: 1420,
    tags: ["Exams", "Time Management", "Study Plan"],
    linkUrl: "#",
    featured: true
  },
  {
    id: "res-2",
    title: "Official Assignment Extension Policy & Form",
    category: "Academic",
    description: "Guidelines on circumstances eligible for assignment extensions (medical, personal emergencies) and standard Dean approval procedures.",
    readTime: "3 min read",
    downloads: 890,
    tags: ["Deadlines", "Extensions", "Regulations"],
    linkUrl: "#"
  },
  {
    id: "res-3",
    title: "Peer Tutoring & Academic Mentorship Directory",
    category: "Academic",
    description: "Connect with upper-year student tutors for free weekly help in Calculus, Data Structures, Physics, and Business Economics.",
    readTime: "4 min read",
    downloads: 620,
    tags: ["Tutoring", "STEM", "Peer Support"],
    linkUrl: "#"
  },
  {
    id: "res-4",
    title: "Emergency Student Relief Fund Application",
    category: "Financial",
    description: "Discretionary micro-grants up to $1,000 for students undergoing sudden, unforeseen financial disruption or textbook shortages.",
    readTime: "6 min read",
    downloads: 510,
    tags: ["Emergency Aid", "Grants", "Relief"],
    linkUrl: "#",
    featured: true
  },
  {
    id: "res-5",
    title: "Semester Tuition Fee Installment Scheme Walkthrough",
    category: "Financial",
    description: "How to split your semester fees into 3 monthly interest-free payments through the student financial services portal.",
    readTime: "4 min read",
    downloads: 1140,
    tags: ["Tuition", "Payment Plan", "Installments"],
    linkUrl: "#"
  },
  {
    id: "res-6",
    title: "Merit & Need-Based Scholarship Eligibility Matrix",
    category: "Financial",
    description: "Comprehensive listing of all internal university and government alumni endowments open for the upcoming academic cycle.",
    readTime: "7 min read",
    downloads: 980,
    tags: ["Scholarships", "Endowments", "Aid"],
    linkUrl: "#"
  },
  {
    id: "res-7",
    title: "Student Mind & Stress De-Escalation Toolkit",
    category: "Wellbeing",
    description: "Clinically reviewed cognitive exercises, 4-7-8 breathing techniques, and guided grounding prompts for managing high-pressure weeks.",
    readTime: "8 min read",
    downloads: 2300,
    tags: ["Mindfulness", "Anxiety", "Self-Care"],
    linkUrl: "#",
    featured: true
  },
  {
    id: "res-8",
    title: "Overcoming Academic Burnout & Imposter Syndrome",
    category: "Wellbeing",
    description: "Understanding chronic fatigue vs academic burnout, with practical boundary-setting techniques for university students.",
    readTime: "6 min read",
    downloads: 1840,
    tags: ["Burnout", "Mental Health", "Counseling"],
    linkUrl: "#"
  },
  {
    id: "res-9",
    title: "Campus SafeWalk: 24/7 Security Night Escort Protocol",
    category: "Safety",
    description: "How to request a trained student safety officer to walk with you between campus buildings, parking decks, or hostels after 9 PM.",
    readTime: "2 min read",
    downloads: 750,
    tags: ["Campus Safety", "Night Escort", "Security"],
    linkUrl: "#",
    featured: true
  },
  {
    id: "res-10",
    title: "Zero Tolerance Harassment Reporting Procedures",
    category: "Safety",
    description: "A completely confidential, student-guided reporting pathway for addressing harassment, stalking, bullying, or discrimination.",
    readTime: "5 min read",
    downloads: 410,
    tags: ["Harassment", "Confidential", "Protection"],
    linkUrl: "#"
  },
  {
    id: "res-11",
    title: "Hostel Room Change & Maintenance Protocol",
    category: "Campus Life",
    description: "Timeline and criteria for switching hostel blocks, submitting air conditioning or plumbing tickets, and mess refund policies.",
    readTime: "4 min read",
    downloads: 1290,
    tags: ["Hostel", "Maintenance", "Mess"],
    linkUrl: "#"
  },
  {
    id: "res-12",
    title: "Technical & Behavioral Internship Resume Template",
    category: "Career",
    description: "ATS-friendly university standard resume templates curated with faculty and industry recruitment partners.",
    readTime: "5 min read",
    downloads: 3100,
    tags: ["Resume", "Internship", "Placement"],
    linkUrl: "#",
    featured: true
  },
  {
    id: "res-13",
    title: "Off-Campus Internship NOC & Credit Transfer Guide",
    category: "Career",
    description: "How to apply for No Objection Certificates (NOC) and verify that your summer internship fulfills your curriculum credit criteria.",
    readTime: "5 min read",
    downloads: 1650,
    tags: ["NOC", "Credits", "Internship"],
    linkUrl: "#"
  }
];
