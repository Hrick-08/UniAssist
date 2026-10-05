# Frontend Build Guide — UniRoute

## Overview
Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS v4. Two distinct portals: **Student Portal** and **Department/Admin Portal**.

## Tech Stack
- **Framework**: Next.js 16.3.8 (App Router)
- **React**: 19.2.8
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4 (+ @tailwindcss/postcss)
- **State**: React Context + useReducer (or Zustand)
- **Forms**: React Hook Form + Zod
- **HTTP**: Fetch (native) or Axios
- **Charts**: Recharts (admin analytics)
- **Date**: date-fns
- **Icons**: lucide-react
- **Testing**: Vitest + React Testing Library
- **Lint**: ESLint 9 + eslint-config-next

## Prerequisites
- Node.js 20+
- npm 10+ (or pnpm/yarn/bun)
- Backend API running (see backend/build.md)

## Project Structure
```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (student)/           # Student portal route group
│   │   │   ├── layout.tsx       # Student layout (navbar, providers)
│   │   │   ├── page.tsx         # Home / Landing
│   │   │   ├── chat/
│   │   │   │   └── page.tsx     # Problem input / chat
│   │   │   ├── triage/
│   │   │   │   ├── analysis/page.tsx    # Analyzing...
│   │   │   │   └── result/page.tsx      # Triage result
│   │   │   ├── case/
│   │   │   │   ├── create/page.tsx      # Support request form
│   │   │   │   └── appoint/page.tsx     # Appointment scheduling
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx             # My Requests list
│   │   │   │   └── [id]/page.tsx        # Case details
│   │   │   └── resources/page.tsx       # Knowledge base
│   │   │
│   │   ├── (admin)/             # Admin portal route group
│   │   │   ├── layout.tsx       # Admin layout (sidebar, header)
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── queue/page.tsx   # Triage queue
│   │   │   ├── cases/
│   │   │   │   └── [id]/page.tsx        # Admin case details
│   │   │   ├── team/page.tsx    # My Team
│   │   │   ├── reports/page.tsx # Analytics
│   │   │   ├── knowledge/page.tsx       # Knowledge base mgmt
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── api/                 # API route handlers (if needed)
│   │   ├── globals.css          # Tailwind imports + global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Redirect to student home
│   │
│   ├── components/
│   │   ├── ui/                  # Reusable base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CaseCard.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingState.tsx
│   │   │
│   │   ├── student/             # Student-specific composites
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── TriageAnalysis.tsx
│   │   │   ├── TriageResult.tsx
│   │   │   ├── CaseForm.tsx
│   │   │   ├── AppointmentPicker.tsx
│   │   │   ├── RequestList.tsx
│   │   │   └── CaseDetail.tsx
│   │   │
│   │   └── admin/               # Admin-specific composites
│   │       ├── DashboardCards.tsx
│   │       ├── QueueTable.tsx
│   │       ├── CaseDetailAdmin.tsx
│   │       ├── AnalyticsCharts.tsx
│   │       └── CategoryManager.tsx
│   │
│   ├── lib/
│   │   ├── api.ts               # API client + endpoints
│   │   ├── auth.ts              # Auth helpers (tokens, roles)
│   │   ├── utils.ts             # cn(), formatters, validators
│   │   ├── constants.ts         # Categories, priorities, colors
│   │   └── hooks/
│   │       ├── useTriage.ts
│   │       ├── useCases.ts
│   │       ├── useAppointments.ts
│   │       └── useAuth.ts
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   │
│   ├── types/
│   │   ├── api.ts               # API request/response types
│   │   ├── triage.ts
│   │   ├── case.ts
│   │   └── admin.ts
│   │
│   └── styles/
│       └── theme.css            # CSS variables for theming
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── vitest.config.ts
├── .env.example
└── Dockerfile
```

## Environment Variables
Create `.env.local`:
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Auth
NEXT_PUBLIC_AUTH_STORAGE_KEY=uniroute_auth

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_MOCK_APPOINTMENTS=true
```

## Installation
```bash
cd frontend
npm install
# or
pnpm install
# or
bun install
```

## Development Server
```bash
npm run dev
# Runs at http://localhost:3000
```

## Building for Production
```bash
# Type check + lint + build
npm run build

# Output: .next/ (standalone if configured)

# Preview production build locally
npm run start
```

## Linting & Type Checking
```bash
# Lint
npm run lint

# Type check (run separately)
npx tsc --noEmit
```

## Testing
```bash
# Unit + component tests
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

# 🎓 Student Portal Build Guide

## Route Group: `(student)`
All student routes live under `src/app/(student)/` with shared layout.

## Core Screens (MVP - 7 screens)

### 1. Home — `page.tsx`
**Purpose**: Single entry point for all support needs.
**Components**:
- `Navbar` (Home, My Requests, Resources)
- Hero: "Not sure where to go? Just tell us what's on your mind."
- Large chat input: "Describe what's happening..."
- Category cards grid (8 categories)

**State**: None (static + navigation)

### 2. Chat / Problem Input — `chat/page.tsx`
**Purpose**: Natural language problem description.
**Components**:
- `ChatInterface` with message history
- User message bubbles
- Bot response with typing indicator
- Suggested follow-ups (chips)
- "Submit / Continue" CTA

**State**:
- `messages: Message[]`
- `isLoading: boolean`
- `draftInput: string`

**API**: `POST /triage` (on submit)

### 3. Triage Analysis — `triage/analysis/page.tsx`
**Purpose**: Visual feedback that triage is running.
**Components**:
- `TriageAnalysis` with animated steps:
  - Understanding concern ✓
  - Identifying topics ✓
  - Assessing urgency ✓
  - Finding support team ✓
  - Preparing recommendation ✓

**State**: Poll `/triage/{id}` until complete, then redirect to result.

### 4. Triage Result — `triage/result/page.tsx`
**Purpose**: Show category, priority, recommended team, reasoning.
**Components**:
- `TriageResult` card with:
  - Category badge + icon
  - Priority badge (color-coded)
  - Recommended team
  - Expected response time
  - Reasoning checklist
- CTA: "Continue" → routes based on level

**Routing Logic**:
| Priority | Route |
|----------|-------|
| Level 1 | `/resources` (or stay with guidance) |
| Level 2 | `/case/create?level=2` |
| Level 3 | `/case/create?level=3` |
| Level 4 | `/safety-escalation` |

### 5. Create Case — `case/create/page.tsx`
**Purpose**: Minimal support request form (Level 2/3).
**Components**:
- `CaseForm` with fields:
  - Name (prefilled if logged in)
  - Student ID
  - Preferred contact (email/phone/in-app)
  - Short description (prefilled from triage)
- Submit button

**Validation**: Zod schema, required fields only.

**API**: `POST /cases` → returns case ID → redirect to appointment (L3) or requests (L2).

### 6. Appointment Scheduling — `case/appoint/page.tsx`
**Purpose**: Pick slot for Level 3 cases.
**Components**:
- `AppointmentPicker` with:
  - Team name header
  - Day groups with time slots (mock data for hackathon)
  - Radio selection
  - Confirm button

**State**: `selectedSlot: DateTime | null`

**API**: `POST /appointments` → redirect to `/requests`

### 7. My Requests — `requests/page.tsx`
**Purpose**: List all student cases with status timeline.
**Components**:
- `RequestList` with `CaseCard` per case
- Each card shows:
  - Case ID
  - Category icon + name
  - Priority badge
  - Timeline (received → assigned → appointment → resolved)
- Click → `/requests/[id]`

**API**: `GET /cases` (student's cases)

### 8. Case Details — `requests/[id]/page.tsx`
**Purpose**: Full case visibility.
**Components**:
- `CaseDetail` with:
  - Metadata (category, priority, team, expected response)
  - Full timeline with current step highlighted
  - Messages / notes from team

---

## Design System (Student)

### Theme
- **Primary**: Dark Navy (`#0f172a`) + Green (`#10b981`)
- **Background**: `slate-50` / `slate-900` (dark mode)

### Priority Colors
| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| 1 | Green | `#10b981` | Guidance, resolved |
| 2 | Yellow | `#f59e0b` | Support recommended |
| 3 | Orange | `#f97316` | Priority support |
| 4 | Red | `#ef4444` | Safety escalation |

### Category Icons/Colors
| Category | Icon | Color |
|----------|------|-------|
| Academic | 🎓 | `blue` |
| Financial | 💰 | `green` |
| Wellbeing | 🧠 | `purple` |
| Accommodation | 🏠 | `amber` |
| Safety | 🛡️ | `red` |
| Career | 💼 | `indigo` |
| Social | 👥 | `pink` |
| Administrative | 🏛️ | `gray` |

### Responsive Breakpoints
- Mobile: `< 640px` (primary target)
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

---

# 🏛️ Department/Admin Portal Build Guide

## Route Group: `(admin)`
All admin routes under `src/app/(admin)/` with sidebar layout.

## Auth & Access
- Separate login: `/admin/login`
- JWT with `role: "admin" | "staff"`
- Middleware protects `(admin)/*` routes
- Redirect to student portal if unauthorized

## Core Screens (MVP - 4 screens)

### 1. Dashboard — `page.tsx`
**Purpose**: High-level metrics + charts.
**Components**:
- `DashboardCards` grid:
  - Total Requests
  - High Priority
  - Avg Response Time
  - Resolved
- `AnalyticsCharts`:
  - Requests over time (line)
  - By category (bar/pie)
  - Priority distribution (donut)
  - Response time trend (line)

**API**: `GET /admin/dashboard`, `GET /admin/analytics`

### 2. Triage Queue — `queue/page.tsx`
**Purpose**: Manage incoming requests.
**Components**:
- `QueueTable` with columns:
  - Case ID
  - Category
  - Priority (colored badge)
  - Student (name/ID)
  - Submitted time
  - Status
  - Actions (Assign, Open)
- Filter bar: All / High / Unassigned / By Category
- Pagination

**API**: `GET /admin/queue?filter=...`

**Real-time**: WebSocket for new cases (optional for hackathon)

### 3. Admin Case Details — `cases/[id]/page.tsx`
**Purpose**: Full case management for staff.
**Components**:
- `CaseDetailAdmin` with sections:
  - Student info (name, ID, contact)
  - Category, Priority, Detected Topics
  - Triage reasoning + confidence
  - Assigned team
  - Action buttons:
    - Assign to Me
    - Assign to Team
    - Update Status
    - Schedule Appointment
  - Timeline (same as student + staff notes)

**API**: `GET /admin/cases/{id}`, `PATCH /admin/cases/{id}`

### 4. Analytics / Reports — `reports/page.tsx`
**Purpose**: Trends & insights for leadership.
**Components**:
- `AnalyticsCharts` extended:
  - Wellbeing requests trend (+40% indicator)
  - Most common concern
  - Highest growth category
  - Avg response by team
  - Heatmap: day/hour vs volume

---

## Design System (Admin)

### Layout
- Fixed left sidebar (260px desktop, collapsible mobile)
- Top header: user menu, notifications
- Content area: max-width `7xl`, centered

### Sidebar Navigation
| Item | Icon | Route |
|------|------|-------|
| Dashboard | LayoutDashboard | `/admin` |
| Cases | FolderOpen | `/admin/cases` |
| Triage Queue | ListTodo | `/admin/queue` |
| My Team | Users | `/admin/team` |
| Reports | BarChart3 | `/admin/reports` |
| Knowledge Base | BookOpen | `/admin/knowledge` |
| Settings | Settings | `/admin/settings` |

### Data Density
- Tables: compact rows, hover highlight
- Cards: dense metrics, minimal padding
- Charts: responsive, tooltip on hover

### Responsive
- Desktop/Laptop primary (≥ 1024px)
- Tablet: sidebar collapsible
- Mobile: not primary target (admin uses desktop)

---

## Shared Components (UI Library)

### Base Components (`src/components/ui/`)
```typescript
// Button.tsx - variants: primary, secondary, ghost, danger, success
// Card.tsx - compound: Card, CardHeader, CardContent, CardFooter
// Badge.tsx - variants: default, success, warning, danger, info
// Input.tsx - with label, error, helper text
// Modal.tsx - portal, focus trap, esc to close
// Timeline.tsx - vertical, steps with icons, current state
// CategoryCard.tsx - icon, name, count, onClick
// CaseCard.tsx - caseId, category, priority, timeline, onClick
// PriorityBadge.tsx - level 1-4, color + label
// Navbar.tsx - logo, links, user menu (student)
// Sidebar.tsx - nav items, collapsible, mobile drawer
// Toast.tsx - success, error, warning, info, auto-dismiss
// LoadingState.tsx - skeleton, spinner, progress steps
```

### Theme Implementation
```css
/* src/styles/theme.css */
:root {
  --navy-900: #0f172a;
  --navy-800: #1e293b;
  --green-500: #10b981;
  --green-600: #059669;
  /* priority colors */
  --priority-1: #10b981;
  --priority-2: #f59e0b;
  --priority-3: #f97316;
  --priority-4: #ef4444;
  /* category colors */
  --cat-academic: #3b82f6;
  --cat-financial: #10b981;
  --cat-wellbeing: #a855f7;
  --cat-accommodation: #f59e0b;
  --cat-safety: #ef4444;
  --cat-career: #6366f1;
  --cat-social: #ec4899;
  --cat-admin: #64748b;
}
```

---

## API Client (`src/lib/api.ts`)
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}

// Endpoints
export const api = {
  triage: {
    create: (data: TriageRequest) => request<TriageResponse>('/triage', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<TriageResult>(`/triage/${id}`),
  },
  cases: {
    list: () => request<Case[]>('/cases'),
    create: (data: CreateCaseRequest) => request<Case>('/cases', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<Case>(`/cases/${id}`),
  },
  appointments: {
    available: (teamId: string) => request<Slot[]>(`/appointments/available?team=${teamId}`),
    create: (data: CreateAppointmentRequest) => request<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    dashboard: () => request<DashboardStats>('/admin/dashboard'),
    queue: (filters: QueueFilters) => request<Case[]>(`/admin/queue?${new URLSearchParams(filters)}`),
    caseDetail: (id: string) => request<AdminCaseDetail>(`/admin/cases/${id}`),
    updateCase: (id: string, data: UpdateCaseRequest) => request<Case>(`/admin/cases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    analytics: () => request<AnalyticsData>('/admin/analytics'),
  },
};
```

---

## Docker Build
```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build
docker build -t uniroute-frontend .

# Run
docker run -d -p 3000:3000 --env-file .env.local uniroute-frontend
```

---

## Deployment Checklist
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `NEXT_PUBLIC_WS_URL` for real-time updates
- [ ] Build passes: `npm run build` (no TS errors, no lint errors)
- [ ] Tests pass: `npm run test`
- [ ] Environment variables set in hosting platform
- [ ] Static assets served via CDN (Vercel/Cloudflare/NGINX)
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Analytics/Monitoring connected (optional)

---

## Team Division (6 Members)

| Member | Screens | Components |
|--------|---------|------------|
| 1 | Home, Navbar, Category Cards | `Navbar`, `CategoryCard`, Hero |
| 2 | Chat, Triage Analysis | `ChatInterface`, `TriageAnalysis` |
| 3 | Triage Result, Level 1-4 States | `TriageResult`, `LevelGuidance`, `SafetyEscalation` |
| 4 | Case Create, Appointment | `CaseForm`, `AppointmentPicker` |
| 5 | My Requests, Case Details | `RequestList`, `CaseDetail`, `CaseCard` |
| 6 | Admin Dashboard, Queue, Case Details | `DashboardCards`, `QueueTable`, `CaseDetailAdmin`, `AnalyticsCharts` |

---

## Minimum Prototype (1 Hour)
Build these 10 screens in order:
1. Student Home
2. Chat / Problem Input
3. Triage Analysis
4. Triage Result
5. Create Case
6. Appointment Scheduling
7. My Requests
8. Admin Dashboard
9. Triage Queue
10. Admin Case Details

Use mock data for backend responses. Connect real API later.