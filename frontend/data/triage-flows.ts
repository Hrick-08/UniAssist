import type { TriageResponse } from "@/lib/api";

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
  // Present once the backend triage result is fetched; carried through so
  // downstream pages (recommendation, appointments) can call the real API.
  triageId?: string;
  caseReference?: string | null;
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

const LEVEL_META: Record<1 | 2 | 3 | 4, { levelColor: string; badge: TriageResult["priorityBadge"] }> = {
  1: {
    levelColor: "green",
    badge: { label: "General Guidance", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-300" }
  },
  2: {
    levelColor: "yellow",
    badge: { label: "Support Recommended", bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-300" }
  },
  3: {
    levelColor: "orange",
    badge: { label: "HIGH — Priority Support", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-300" }
  },
  4: {
    levelColor: "red",
    badge: { label: "CRITICAL — Immediate Escalation", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-300" }
  }
};

const SUGGESTED_ACTION: Record<string, TriageResult["suggestedAction"]> = {
  provide_guidance: "guidance",
  recommend_support: "recommend_support",
  create_case_and_prioritize: "create_case",
  immediate_escalation: "immediate_escalation"
};

/** Adapts the backend's TriageResponse into the shape the UI components expect. */
export function mapTriageResponse(response: TriageResponse): TriageResult {
  const level = response.level as 1 | 2 | 3 | 4;
  const meta = LEVEL_META[level] ?? LEVEL_META[1];

  return {
    category: response.category.name,
    subcategory: response.secondary_category?.name ?? response.topics[0] ?? response.category.description,
    level,
    levelLabel: `Level ${level} — ${response.level_label}`,
    levelColor: meta.levelColor,
    priorityBadge: { ...meta.badge, label: response.level_label },
    recommendedService: response.recommended_team,
    recommendedServiceId: response.category.slug,
    expectedResponse: response.expected_response ?? "Instant self-service resolution",
    confidenceScore: Math.round(response.confidence * 100),
    reasoning: response.reasons.length > 0 ? response.reasons : [response.guidance.message],
    suggestedAction: SUGGESTED_ACTION[response.action] ?? "recommend_support",
    summary: response.guidance.message,
    triageId: response.id,
    caseReference: response.case_reference
  };
}
