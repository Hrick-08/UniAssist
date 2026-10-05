const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const TOKEN_STORAGE_KEY = "uniassist_token";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail));
    this.status = status;
    this.detail = detail;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage failures (private mode, etc.)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ?? body;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/* ---------------------------------- Types -------------------------------- */

export interface Resource {
  title: string;
  url: string;
}

export interface CategoryOut {
  slug: string;
  name: string;
  team_name: string;
  description: string;
}

export interface CategoryDetail extends CategoryOut {
  guidance: string;
  resources: Resource[];
}

export interface Guidance {
  message: string;
  resources: Resource[];
}

export interface EscalationContact {
  name: string;
  phone: string;
  available: string;
  description: string;
}

export interface TriageResponse {
  id: string;
  level: 1 | 2 | 3 | 4;
  level_label: string;
  priority: string;
  action: string;
  category: CategoryOut;
  secondary_category: CategoryOut | null;
  recommended_team: string;
  expected_response: string | null;
  topics: string[];
  reasons: string[];
  confidence: number;
  engine: string;
  guidance: Guidance;
  escalation_contacts: EscalationContact[];
  case_reference: string | null;
  created_at: string;
}

export type CaseStatus = "received" | "assigned" | "appointment_scheduled" | "resolved";
export type ContactMethod = "email" | "phone" | "in_app";

export interface TimelineStep {
  key: "received" | "assigned" | "appointment" | "resolved";
  label: string;
  state: "done" | "current" | "upcoming" | "skipped";
}

export interface CaseEventOut {
  kind: string;
  message: string;
  actor_name: string | null;
  created_at: string;
}

export interface AppointmentOut {
  id: string;
  case_reference: string;
  team_name: string;
  starts_at: string;
  ends_at: string;
}

export interface CaseSummary {
  reference: string;
  status: CaseStatus;
  priority: 1 | 2 | 3 | 4;
  priority_label: string;
  category: CategoryOut;
  assigned_team: string;
  escalated: boolean;
  respond_by: string | null;
  created_at: string;
  timeline: TimelineStep[];
}

export interface CaseOut extends CaseSummary {
  description: string;
  expected_response: string | null;
  events: CaseEventOut[];
  appointments: AppointmentOut[];
}

export interface Slot {
  starts_at: string;
  ends_at: string;
}

export interface Availability {
  category: string;
  team_name: string;
  timezone: string;
  slots: Slot[];
}

export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  student_number: string | null;
  role: "student" | "staff" | "admin";
  category: CategoryOut | null;
}

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: UserOut;
}

/* -------------------------------- Endpoints ------------------------------- */

export const api = {
  categories: {
    list: () => request<CategoryDetail[]>("/categories"),
    get: (slug: string) => request<CategoryDetail>(`/categories/${slug}`),
  },
  triage: {
    create: (data: { message: string; category_hint?: string | null }) =>
      request<TriageResponse>("/triage", { method: "POST", body: JSON.stringify(data) }),
    get: (id: string) => request<TriageResponse>(`/triage/${id}`),
  },
  cases: {
    create: (data: {
      triage_id: string;
      contact_name?: string | null;
      student_number?: string | null;
      preferred_contact?: ContactMethod;
      contact_detail?: string | null;
      description?: string | null;
    }) => request<CaseOut>("/cases", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<CaseSummary[]>("/cases"),
    get: (reference: string) => request<CaseOut>(`/cases/${encodeURIComponent(reference)}`),
  },
  appointments: {
    available: (category: string) =>
      request<Availability>(`/appointments/available?category=${encodeURIComponent(category)}`),
    create: (data: { case_reference: string; starts_at: string }) =>
      request<AppointmentOut>("/appointments", { method: "POST", body: JSON.stringify(data) }),
  },
  auth: {
    register: (data: {
      email: string;
      password: string;
      full_name: string;
      student_number?: string | null;
    }) => request<TokenOut>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<TokenOut>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<UserOut>("/auth/me"),
  },
};
