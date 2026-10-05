import pypandoc

readme = r"""# UniRoute — Intelligent Student Support Triage & Routing

> **Tell us what's wrong. We'll get you to the right support.**

UniRoute is a student-support triage and routing prototype for the ServiceNow event.

The goal is simple: students should **not have to figure out which university department to contact**. They describe their problem in natural language, UniRoute identifies the relevant support area, determines the urgency, and chooses the most appropriate next action.

Depending on the severity, UniRoute can either:

- answer the student immediately with relevant guidance/resources,
- recommend human support and create a ServiceNow-style case,
- schedule an appointment for non-urgent support,
- or escalate immediately when there is a serious safety concern.

---

## 1. Problem Statement

A mid-sized university has a student wellbeing crisis it cannot fully see:

- Mental-health referrals are increasing.
- Support is fragmented across multiple departments.
- Students may wait weeks before receiving an appointment.
- Students often do not know **where to go** for a particular problem.
- The same student may need multiple support teams.

### The core problem

```text
Student has a problem
        ↓
Doesn't know where to go
        ↓
Contacts the wrong department / searches multiple places
        ↓
Gets redirected
        ↓
More waiting + fragmented support
```

### UniRoute's solution

```text
Student describes the problem
        ↓
        Triage
        ↓
Category + urgency + intent
        ↓
Recommended action
        ↓
┌──────────────────────────────────────────────┐
│                                              │
├─ Low / informational → Instant guidance      │
├─ Moderate support → Create case              │
├─ Appointment needed → Case + appointment     │
└─ Safety concern → Immediate escalation       │
        ↓
ServiceNow case / support workflow
```

---

# 2. Core Product Idea

UniRoute acts as the **single front door for university support**.

The student does not need to know whether their issue belongs to:

- Academic Services
- Student Wellbeing
- Financial Aid
- Accommodation
- Campus Life
- Career Services
- Safety / Harassment Support
- Social / Personal Support
- Administrative Services

They simply explain what is happening.

### Example

Student says:

> "I've been struggling with coursework and missing classes because I'm feeling overwhelmed."

UniRoute can identify:

```text
Category: Academic + Wellbeing
Urgency: Level 3 — Priority Support
Recommended team: Student Wellbeing
Secondary support: Academic Advisor
Action: Create case + recommend human support
```

The important principle is:

> **UniRoute should route the student based on their need, not force the student to understand the university's internal structure.**

---

# 3. Support Categories

## 🎓 Academic

Typical issues:

- Can't understand subjects
- Falling grades
- Assignment pressure
- Attendance problems
- Exam stress
- Faculty / academic issues

Possible routing:

```text
Academic Advisor
Faculty Support
Academic Services
Exam / Assessment Team
```

---

## 💰 Financial

Typical issues:

- Fee problems
- Scholarship queries
- Financial difficulty
- Emergency financial assistance

Possible routing:

```text
Finance Office
Financial Aid
Scholarship Team
Student Emergency Support
```

---

## 🧠 Wellbeing

Typical issues:

- Stress
- Anxiety-like concerns
- Feeling overwhelmed
- Loneliness
- Burnout
- Difficulty coping

Possible routing:

```text
Student Wellbeing Services
Counselling / Human Support
Student Support Groups
```

### Important safety rule

UniRoute **must not diagnose mental-health conditions**.

It should identify the student's support need and route them appropriately.

For example, do not say:

> "You have anxiety."

Instead say:

> "It sounds like you may benefit from speaking with the Student Wellbeing team."

---

## 🏠 Accommodation / Campus Life

Typical issues:

- Hostel problems
- Roommate issues
- Food / mess complaints
- Transportation
- Campus facilities

Possible routing:

```text
Accommodation Team
Campus Facilities
Transport Team
Student Affairs
```

---

## 🛡️ Safety / Harassment

Typical issues:

- Bullying
- Harassment
- Discrimination
- Threats
- Unsafe situations

These cases should have **special escalation rules**.

Possible routing:

```text
Safety / Student Protection Team
University Escalation Team
Emergency / Security Contact
```

Do not treat a serious safety report like an ordinary support ticket.

---

## 💼 Career

Typical issues:

- Internship doubts
- Placement concerns
- Resume help
- Career direction
- Skill-development resources

Possible routing:

```text
Career Services
Placement Cell
Career Advisor
Skill Development Team
```

---

## 👥 Social / Personal

Typical issues:

- Relationship problems
- Family-related difficulties
- Social isolation
- Peer conflicts

Possible routing:

```text
Student Support
Wellbeing Services
Student Affairs
```

---

## 🏛️ Administrative

Typical issues:

- ID card
- Documents
- Fees
- Registration
- Certificates
- University procedures

Possible routing:

```text
Registrar
Student Administration
Finance
Documentation / Records Team
```

---

# 4. The Big Differentiator — Don't Just Classify, Determine Urgency

UniRoute should not stop at:

> "This is a wellbeing issue."

It should answer:

> **"What should happen next?"**

We use four triage levels.

---

## 🟢 Level 1 — General Guidance

The problem is low-risk and can be answered immediately.

### Example

> "I'm confused about which electives to choose."

### System response

```text
Category: Academic
Urgency: Level 1

Action:
Provide information / resources

No case required.
```

The chatbot can answer directly using the university's knowledge base.

### Goal

**Resolve the issue during the conversation whenever possible.**

---

# 🟡 Level 2 — Support Recommended

The student likely needs support, but there is no indication of immediate danger.

### Example

> "I've been struggling with coursework and missing classes."

### System response

```text
Category: Academic
Urgency: Level 2

Action:
Recommend Academic Advisor / Student Support

Offer:
- relevant resources
- support contact
- optional case creation
```

A case can be created if the student wants human follow-up.

---

# 🟠 Level 3 — Priority Support

The student appears to need timely human intervention.

### Example

> "I've been feeling extremely overwhelmed and can't keep up with anything."

### System response

```text
Category: Wellbeing
Urgency: Level 3 — Priority

Action:
Create support case
+
Prioritize human support
+
Provide relevant immediate resources
+
Offer / schedule an appointment
```

Example:

```text
CASE #STU-1042

Category:
Student Wellbeing

Priority:
HIGH

Assigned Team:
Student Wellbeing Services

Expected Response:
Within 24 hours

Appointment:
[ Schedule Appointment ]
```

---

# 🔴 Level 4 — Immediate Safety Concern

If the student indicates immediate danger, self-harm, violence, threats, or another serious safety concern:

### DO NOT continue normal chatbot questioning.

Instead:

```text
This sounds like something that needs
immediate human help.

Please contact the university's emergency /
safety support team immediately.
```

Then show the university's configured emergency/support options.

### Important

The prototype should demonstrate that Level 4 cases:

- bypass normal routing,
- are escalated immediately,
- receive the highest priority,
- provide emergency/safety contact options,
- do not rely on chatbot diagnosis.

---

# 5. Decision Engine

The high-level decision logic is:

```text
                Student message
                       │
                       ▼
              Understand intent
                       │
                       ▼
              Identify category
                       │
                       ▼
              Determine urgency
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Level 1      Level 2/3     Level 4
          │            │            │
          ▼            ▼            ▼
    Give guidance   Create case   Immediate
    / resources     / support     escalation
                       │
                       ▼
               Appointment needed?
                    /       \
                  YES        NO
                   │          │
                   ▼          ▼
             Schedule      Case tracking
             appointment
```

---

# 6. Example Routing Rules

The prototype does not need a complicated ML model.

A simple rule-based or mocked intelligent triage layer is enough for the hackathon.

Example:

```javascript
if (mentionsSafetyRisk(message)) {
    urgency = "LEVEL_4";
    action = "IMMEDIATE_ESCALATION";
}

else if (mentionsSevereDistress(message)) {
    urgency = "LEVEL_3";
    action = "CREATE_CASE_AND_PRIORITIZE";
}

else if (needsHumanSupport(message)) {
    urgency = "LEVEL_2";
    action = "RECOMMEND_SUPPORT";
}

else {
    urgency = "LEVEL_1";
    action = "PROVIDE_GUIDANCE";
}
```

Category detection can similarly map keywords/intents:

```javascript
academic
→ Academic Services

fees / scholarship
→ Financial Services

stress / overwhelmed / burnout
→ Student Wellbeing

hostel / roommate
→ Accommodation

bullying / harassment / threat
→ Safety & Harassment

internship / placement / resume
→ Career Services

relationship / family / peer conflict
→ Social & Personal

documents / certificate / registration
→ Administrative
```

### Production vision

For a production implementation, this layer can be replaced or enhanced with:

- ServiceNow AI / Now Assist
- intent classification
- knowledge retrieval
- confidence scoring
- policy-based routing
- SLA rules
- human-in-the-loop review

The hackathon prototype only needs to demonstrate the workflow convincingly.

---

# 7. Student-Side Flow

## Screen 1 — Home

```text
Not sure where to go?

Just tell us what's on your mind.

[ Describe your situation... ]

OR

[ Academic ]
[ Financial ]
[ Wellbeing ]
[ Accommodation ]
[ Safety ]
[ Career ]
[ Social ]
[ Administrative ]
```

---

## Screen 2 — Triage

Show the system processing the request:

```text
Analyzing your request...

✓ Understanding your concern
✓ Identifying key topics
✓ Assessing urgency
✓ Finding the right support team
✓ Preparing recommendation
```

This makes the triage concept visible to the judge.

---

## Screen 3 — Triage Result

Example:

```text
We've understood your situation.

Category:
Student Wellbeing

Priority:
HIGH

Recommended Team:
Student Wellbeing Services

Expected Response:
Within 24 hours

Why?
✓ Stress-related concern detected
✓ Difficulty attending classes
✓ Human support recommended

[ Continue to Request Support ]
```

---

## Screen 4 — Support Request

Keep the form short.

```text
Name
Student ID
Preferred contact method
Short description

[ Submit Request ]
```

Do not ask the student to repeat information they already provided.

---

## Screen 5 — Case Created

```text
✓ Your support request has been created

Case:
STU-1042

Category:
Student Wellbeing

Priority:
High

Assigned To:
Student Wellbeing Services

Expected Response:
Within 24 hours

[ Track My Case ]
```

---

## Screen 6 — Case Tracking

```text
STU-1042

✓ Request received
✓ Assigned
● Appointment
○ Resolved
```

The student always knows what is happening next.

---

# 8. Instant Resolution vs Case Creation

This is one of the most important product decisions.

### 🟢 Simple problem

```text
Student:
"How do I apply for a bonafide certificate?"

UniRoute:
"Here's how you can apply..."

[ Application Guide ]
```

No case needed.

---

### 🟡 Moderate problem

```text
Student:
"I'm struggling with my assignments."

UniRoute:
"Here are some resources.
Would you like to speak with an academic advisor?"

[ Get Support ]
```

Case is optional.

---

### 🟠 Serious support need

```text
Student:
"I've been overwhelmed for weeks and can't attend classes."

UniRoute:
"This may benefit from timely human support."

[ Create Priority Case ]
[ Schedule Appointment ]
```

Case + appointment.

---

### 🔴 Immediate safety concern

```text
Student:
"I'm in immediate danger."

UniRoute:
"This needs immediate human help."

[ Emergency / Safety Support ]
[ Contact University Security ]
```

Immediate escalation.

---

# 9. Appointment Scheduling

For Level 2/3 cases where an appointment is appropriate:

```text
Student Wellbeing Services

Choose a time:

Monday
10:00 AM
11:30 AM
2:00 PM

Tuesday
9:30 AM
1:00 PM
3:30 PM

[ Confirm Appointment ]
```

After confirmation:

```text
✓ Appointment scheduled

Case:
STU-1042

Date:
Tuesday, 2:00 PM

Team:
Student Wellbeing Services
```

For the hackathon, these can be mocked time slots.

---

# 10. Admin / Support Team Side

The admin dashboard gives university staff a unified view.

## Admin Dashboard

Show:

```text
Total Requests
124

High Priority
28

Average Response Time
18h

Resolved
96
```

Useful sections:

- Dashboard
- Cases
- Triage Queue
- My Team
- Reports
- Knowledge Base
- Settings

---

# 11. Triage Queue

Admins can see incoming requests:

```text
STU-1042   Wellbeing      HIGH
STU-1041   Academic       MEDIUM
STU-1039   Financial      LOW
STU-1037   Student Life   MEDIUM
```

Filters:

```text
[ All ]
[ High Priority ]
[ Unassigned ]
[ Wellbeing ]
[ Academic ]
[ Financial ]
```

---

# 12. Case Details

When an admin opens a case:

```text
CASE #STU-1042

Student:
Tanveer

Category:
Student Wellbeing

Priority:
HIGH

Original Request:
"I've been feeling very stressed..."

Detected Topics:
Stress
Exams
Attendance

Triage Result:
Wellbeing

Confidence:
95%

Assigned Team:
Student Wellbeing Services
```

Actions:

```text
[ Assign to Me ]
[ Assign to Team ]
[ Update Status ]
[ Schedule Appointment ]
```

---

# 13. Analytics / Intelligence

The admin side can also surface patterns.

Example:

```text
Wellbeing Requests
       ↑
       │        ╭───╮
       │     ╭──╯   ╰──╮
       │  ╭──╯         ╰──
       └────────────────────→ Time
```

Useful insights:

- Wellbeing requests increased by 40%.
- Exam stress is a common concern.
- Average response time.
- Number of high-priority cases.
- Most common support categories.
- Unresolved cases.
- Cases approaching SLA.

This directly supports the university's need to **see the wellbeing crisis earlier**.

---

# 14. ServiceNow Connection

The student experience should be simple.

Behind the scenes:

```text
                    UniRoute
                       │
                       ▼
                Triage Engine
                       │
                       ▼
               Routing Rules
                       │
                       ▼
                ServiceNow
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    Wellbeing       Academic       Financial
       Team           Team           Team
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 Case + SLA
                       │
                       ▼
              Student Tracking
```

ServiceNow can represent the operational backend:

- Case management
- Assignment
- Routing
- Priority
- SLA
- Notifications
- Appointment workflow
- Knowledge base
- Reporting

---

# 15. Key Value Proposition

### Before UniRoute

```text
12 departments
      ↓
Student doesn't know where to go
      ↓
Wrong contact
      ↓
Redirection
      ↓
Longer wait
```

### After UniRoute

```text
One entry point
      ↓
Natural-language problem
      ↓
Automatic triage
      ↓
Correct routing
      ↓
Right level of support
      ↓
Case + appointment when needed
      ↓
Trackable resolution
```

---

# 16. What Makes UniRoute Different?

### 1. One front door

Students don't need to understand university bureaucracy.

### 2. Triage, not just classification

We determine **what should happen next**, not just which department owns the issue.

### 3. Instant resolution when possible

Simple questions should not become unnecessary tickets.

### 4. Human support when needed

More serious issues create cases and can trigger appointments.

### 5. Safety-first escalation

Serious safety concerns bypass ordinary chatbot flows.

### 6. Closed-loop visibility

Students can track their request from creation to resolution.

### 7. Institutional intelligence

Aggregated case data helps university leaders identify emerging patterns.

---

# 17. Hackathon MVP

Because the build time is approximately **1 hour**, do NOT attempt to build the entire production system.

The demo should focus on one polished happy path.

### Must-have

- [x] Student landing page
- [x] Natural-language problem input
- [x] Category detection
- [x] Four urgency levels
- [x] Recommendation screen
- [x] Case creation
- [x] Appointment scheduling mock
- [x] Case tracking
- [x] Admin queue
- [x] Admin case details

### Nice-to-have

- [ ] Analytics dashboard
- [ ] Knowledge base
- [ ] Notifications
- [ ] Multiple appointments
- [ ] Real ServiceNow API integration
- [ ] AI/LLM integration

---

# 18. Recommended Demo Story

Use this exact scenario during the presentation:

> "I'm a student. Exams are approaching, I've been extremely stressed, and I've started missing classes. But I don't know whether I should contact my faculty, academic office, or wellbeing team."

Then demonstrate:

```text
Student enters problem
        ↓
UniRoute analyzes
        ↓
Category = Wellbeing
Priority = High
        ↓
Recommends Student Wellbeing Services
        ↓
Student submits request
        ↓
Case STU-1042 created
        ↓
Appointment scheduled
        ↓
Student tracks case
```

Then switch to the admin view:

```text
Admin receives STU-1042
        ↓
Sees triage information
        ↓
Sees priority = HIGH
        ↓
Assigns to Wellbeing Team
        ↓
Case is tracked through resolution
```

### Closing line

> **"UniRoute doesn't ask students to understand the university. It understands the student and connects them to the right support."**

---

# 19. Team of 6 — One-Hour Execution Plan

| Person | Responsibility |
|---|---|
| 1 | Student home + category UI |
| 2 | Chat / natural-language input + triage flow |
| 3 | Triage logic + urgency rules |
| 4 | Case creation + appointment flow |
| 5 | Admin dashboard + queue |
| 6 | Integration + ServiceNow story + presentation |

### Time split

**0–5 min:** Lock UX and demo story

**5–35 min:** Parallel development

**35–45 min:** Connect screens

**45–52 min:** Visual polish + test demo

**52–60 min:** Presentation rehearsal

---

# 20. Design Direction

Recommended visual language:

- Dark navy background
- Emerald / green primary accent
- Clean cards
- Large readable typography
- Minimal borders
- Clear urgency colors
- Simple icons
- Smooth transitions
- Student-friendly language

### Urgency colors

```text
🟢 Level 1 — General Guidance
🟡 Level 2 — Support Recommended
🟠 Level 3 — Priority Support
🔴 Level 4 — Immediate Safety Concern
```

Do not make the UI look like a medical diagnosis dashboard. It is a **student support routing system**.

---

# 21. Success Metrics

If this were deployed, measure:

### Student experience

- Time to find correct support
- Self-service resolution rate
- Student satisfaction
- Drop-off rate

### Operational efficiency

- Average time to assignment
- Average response time
- Cases resolved within SLA
- Wrong-routing rate

### Wellbeing visibility

- Number of wellbeing requests
- High-priority wellbeing cases
- Common concerns
- Emerging trends
- Repeat support requests

### Target outcome

> **Reduce the time between a student asking for help and reaching the right human support.**

---

# 22. Final Product

## UniRoute

### Intelligent Student Support Triage & Routing

**Input:**  
What is happening to the student?

**Processing:**  
Category + urgency + intent + routing

**Output:**  
The right response at the right time.

```text
                 ┌─────────────────┐
                 │     STUDENT     │
                 └────────┬────────┘
                          │
                    "What's wrong?"
                          │
                          ▼
                 ┌─────────────────┐
                 │    UNIROUTE     │
                 │                 │
                 │ Triage + Route  │
                 └────────┬────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          Guidance      Case       Escalation
             │            │            │
             │       Appointment       │
             │            │            │
             └────────────┼────────────┘
                          ▼
                    SERVICENOW
                          │
                          ▼
                  SUPPORT TEAM
                          │
                          ▼
                       STUDENT
```

> **One student. One front door. The right support.**
