export interface TriageResult {
  category: string;
  subcategory: string;
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  levelColor: string;
  priorityBadge: {
    label: string;
    bg: string;
    text: string;
    dot: string;
    border: string;
  };
  recommendedService: string;
  recommendedServiceId: string;
  expectedResponse: string;
  confidenceScore: number;
  reasoning: string[];
  suggestedAction: "guidance" | "recommend_support" | "create_case" | "immediate_escalation";
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  timestamp: string;
  quickReplies?: string[];
  triageData?: TriageResult;
  isUrgent?: boolean;
}

export const URGENT_KEYWORDS = [
  "suicide", "harm", "kill myself", "end my life", "assault", "weapon", "threatened", 
  "stalking", "danger", "unsafe", "physical violence", "abuse", "emergency"
];

export const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: "msg-init-1",
  sender: "bot",
  text: "Hey! I'm UniAssist 👋\n\nYou can tell me what's going on in your own words. I'll help you find the right university support without having to navigate multiple offices.",
  timestamp: "Just now",
  quickReplies: [
    "Academic pressure",
    "Financial & scholarships",
    "Wellbeing & stress",
    "Hostel / Campus life",
    "Career & placements",
    "Safety concern"
  ]
};

export function evaluateTriage(userHistory: string[], selectedSeverity?: string): TriageResult {
  const combinedText = userHistory.join(" ").toLowerCase();

  // 1. Check for immediate safety risk (Level 4)
  if (URGENT_KEYWORDS.some(kw => combinedText.includes(kw)) || combinedText.includes("safety") && combinedText.includes("urgent")) {
    return {
      category: "Safety & Security",
      subcategory: "Immediate Threat / Safety Concern",
      level: 4,
      levelLabel: "Level 4 — Immediate Safety Escalation",
      levelColor: "red",
      priorityBadge: {
        label: "CRITICAL — Immediate Escalation",
        bg: "bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
        border: "border-red-300"
      },
      recommendedService: "Campus Safety & Emergency Dispatch",
      recommendedServiceId: "campus-safety",
      expectedResponse: "Immediate (Under 5 minutes)",
      confidenceScore: 99,
      reasoning: [
        "Language indicated imminent safety risk or harassment concern",
        "Standard conversational triage bypassed to ensure student protection",
        "Direct emergency helpline and campus security dispatch triggered"
      ],
      suggestedAction: "immediate_escalation",
      summary: "High-priority safety concern flagged for immediate security and duty-counselor intervention."
    };
  }

  // 2. High severity / Level 3
  if (
    selectedSeverity === "I need help urgently" || 
    selectedSeverity === "I'm struggling to keep up" ||
    combinedText.includes("can't attend") ||
    combinedText.includes("burnout") ||
    combinedText.includes("panic attack") ||
    combinedText.includes("hopeless")
  ) {
    const isWellbeing = combinedText.includes("stress") || combinedText.includes("panic") || combinedText.includes("burnout") || combinedText.includes("overwhelm");
    
    return {
      category: isWellbeing ? "Wellbeing" : "Academic",
      subcategory: isWellbeing ? "Severe Stress & Burnout" : "Coursework Distress & Attendance",
      level: 3,
      levelLabel: "Level 3 — Priority Support",
      levelColor: "orange",
      priorityBadge: {
        label: "HIGH — Priority Support",
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "bg-orange-500",
        border: "border-orange-300"
      },
      recommendedService: isWellbeing ? "Student Wellbeing & Counseling Support" : "Academic Advising Center",
      recommendedServiceId: isWellbeing ? "wellbeing-counseling" : "academic-advising",
      expectedResponse: "Within 24 hours",
      confidenceScore: 94,
      reasoning: [
        `You indicated significant disruption to your day-to-day ${isWellbeing ? "emotional state" : "academic progress"}`,
        "You reported struggling to keep up with essential university commitments",
        "Direct human support with appointment scheduling is strongly recommended"
      ],
      suggestedAction: "create_case",
      summary: "Priority student case generated. Recommended human advisor outreach and calendar booking."
    };
  }

  // 3. Level 2 (Support recommended) - Default for "It's affecting my studies" or moderate issues
  if (
    selectedSeverity === "It's affecting my studies" || 
    combinedText.includes("exam") || 
    combinedText.includes("struggling") ||
    combinedText.includes("assignments") ||
    combinedText.includes("workload") ||
    combinedText.includes("fee")
  ) {
    const isFin = combinedText.includes("fee") || combinedText.includes("scholarship") || combinedText.includes("money");
    
    return {
      category: isFin ? "Financial" : "Academic",
      subcategory: isFin ? "Fee Installments & Deadlines" : "Exam & Workload Management",
      level: 2,
      levelLabel: "Level 2 — Support Recommended",
      levelColor: "yellow",
      priorityBadge: {
        label: "Support Recommended",
        bg: "bg-amber-50",
        text: "text-amber-800",
        dot: "bg-amber-500",
        border: "border-amber-300"
      },
      recommendedService: isFin ? "Financial Aid & Scholarship Office" : "Academic Advising Center",
      recommendedServiceId: isFin ? "financial-aid" : "academic-advising",
      expectedResponse: "Within 1-2 business days",
      confidenceScore: 91,
      reasoning: [
        "You mentioned difficulty managing coursework and upcoming examination pressure",
        "You indicated that the situation is impacting your regular academic pace",
        "Connecting with a designated university advisor will help plan workload mitigation"
      ],
      suggestedAction: "recommend_support",
      summary: "Support recommended with Academic Advising to create a custom study and extension plan."
    };
  }

  // 4. Level 1 - Informational / Guidance
  return {
    category: "General Support",
    subcategory: "University Information & Self-Service",
    level: 1,
    levelLabel: "Level 1 — General Guidance",
    levelColor: "green",
    priorityBadge: {
      label: "General Guidance",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      border: "border-emerald-300"
    },
    recommendedService: "Student Knowledge Base & Self-Service",
    recommendedServiceId: "registrar-office",
    expectedResponse: "Instant self-service resolution",
    confidenceScore: 88,
    reasoning: [
      "Your inquiry matches existing verified university guides and knowledge base articles",
      "No critical urgency or safety flags were detected in your submission",
      "Immediate self-service resolution is available without waiting in departmental queues"
    ],
    suggestedAction: "guidance",
    summary: "Instant guidance provided with links to relevant university portals and forms."
  };
}
