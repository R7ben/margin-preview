# Margin by Apes Together Strong

**Track:** Track 1 — Lifestyle
**Problem Statement:** Stress & Workload Manager

**Team:**
- Sapttaruben A/L Krishnan
- 

**Video Presentation:** [Unlisted YouTube Link — TBD]

**Presentation Slides:** [Public Link — TBD]

**Live Prototype:** [https://margin-preview-six.vercel.app/](https://margin-preview-six.vercel.app/)

**GitHub Repository:** [https://github.com/R7ben/margin](https://github.com/R7ben/margin)

*Access Note for Evaluators: To test the live prototype without cached state, please open the link in an incognito or private browser window. All data runs locally within the session.*

---

## 1. Project Overview

### 1.1 The Problem

**Root Causes:**

Students accept new academic, work, and social commitments without visibility into whether they have the *capacity* to handle them. Three specific failures in existing systems enable this:

1. **Rest is treated as leftover time, not a protected baseline.** After scheduling tasks, "free time" is what remains but free time ≠ recovered time. A student can be 0% booked and still be at 100% mental/physical load from accumulated stress. Existing tools optimize for hours available, not recovery needed.

2. **Workload is measured in a single dimension (hours), not across lived dimensions.** A student's week includes mental load (problem sets, exams), physical load (commute, work shifts), social load (group projects, obligations), time load (concurrent deadlines), and maintenance (errands, basic care). Tools that show only "you have 5 hours free" miss the full picture.

3. **Warning systems act *after* overcommitment, not before.** By the time a calendar shows "you're overbooked," the student has already said yes. The tool can't change the decision, it can only reflect the damage.

**Result:** Students burn out because they don't see the cost of a commitment until it's too late. By then, saying no is socially costly, and they've already overcommitted.

**Primary Research:** We surveyed 40 university students. 70% confirmed they had overcommitted this semester, and a further 22% weren't sure , meaning 92% either experienced overload or lacked visibility into whether they had. 80% didn't recognize the overload until midweek or later, by which point burnout was already the outcome for 58% of respondents.

### Stakeholders

- **Primary:** University students (especially 2nd+ year, juggling 3+ concurrent responsibility streams: coursework, part-time work, clubs, social).
- **Secondary:** Academic advisors, university wellness programs (seeking intervention tools).

### Existing Market & Why It Falls Short

Every competitor in this space falls into one of two camps:

- **Passive trackers** (MyStudyLife, Structured, Tiimo): Show workload after tasks are added. Useful for retrospective analysis but useless for preventing overcommitment.
- **Reactive optimizers** (Sunsama, Motion, Finch): Act on time/deadlines only, "you have a deadline Thursday, so defer Task X to Monday." But this doesn't account for recovery state. A student might defer a deadline and still be at 110% capacity from prior high-load days.

None protect recovery as a *non-negotiable baseline*, and none evaluate a *specific* task against a student's *actual* schedule and *actual* capacity state before the student commits to it.

### 1.2 Our Solution

**Margin is a recovery-first workload manager that makes the cost of a new task visible *before* you accept it.** Instead of showing "you have 5 hours free," Margin shows: *"Your recovery floor (sleep, decompression) is protected at 56 hours this week. You have 4 mental-load tasks due Thursday already. Adding this task would push Thursday to 98% capacity and break your recovery floor. You can still add it , the choice is yours , but you can see the cost first."*

Recovery is a fixed cost, not a luxury. Capacity is visible across dimensions (mental, physical, social, time, errands), not just hours. And the decision to overcommit is *yours*, made with full information, not made by default because you didn't see it coming.

### Core Features

| # | Core Feature | Description & Operational Value |
|---|---|---|
| 1 | **Recovery Floor as Protected Baseline** | Sleep and decompression subtracted first, available capacity is strictly what remains. |
| 2 | **Workload Visualizer (Multi-Category)** | Mental, Physical, Social, Time, and Errands load tracked separately, not folded into hours. |
| 3 | **Days at Risk Flagging** | Days that breach recovery capacity are proactively flagged with rebalancing suggestions. |
| 4 | **Quick Check ("Can I Afford This?")** | Natural-language query about a specific task, returns computed burnout-risk delta against your live schedule. |
| 5 | **Consequence Preview Modal** | Before adding a task, see before-and-after capacity impact with choice: Add Anyway, Reschedule, or See Impact. |
| 6 | **Category-Based Task Clustering** | Tasks grouped by load type within buckets, collapsible headers show combined hours for clarity. |
| 7 | **Import Fixed Commitments** | Upload your timetable (lectures, work shifts) so capacity is grounded in reality, not theory. |
| 8 | **Soft-Friction Task Entry** | No hard blocks. Cost is visible; choice remains with you. |
| 9 | **Weekly Reflection with Stress-Pattern Correlation** | End-of-week insight ties recovery floor breaches and mood trend into operational knowledge for next week. |
| 10 | **Speech-to-Text Input** | Audio input on task entry and chat for accessibility and ease of use. |

### Why This Works

Students stop accepting tasks blindly because they can *see and choose* the cost, not because an app blocks them (which just gets ignored). The distinction is critical: Margin respects student agency while making the invisible visible.

---

## 2. Ideation & Process

### 2.1 Ideas We Considered

#### Kept Capabilities & Product Inversions

| # | Idea / Feature | Strategic & Architectural Rationale | Evidence & Implementation |
|---|---|---|---|
| 1 | Recovery Floor as Protected Baseline | Core architectural inversion. Rest is subtracted *first* as a non-negotiable floor, making true remaining capacity visible. | Mentor-validated, live in build, primary real estate on Today view. |
| 2 | Workload Visualizer (Multi-Category) | Tracks Mental, Physical, Social, Time, and Errands load independently rather than folding energy into raw time. | Live and tested; multi-dimensional capacity breakdown rendered on client. |
| 3 | Days at Risk Flagging | Proactively identifies days breaching recovery floors and recommends rebalancing actions. | Live and tested; Thursday threshold breach successfully flagged in demo. |
| 4 | Quick Check ("Can I Afford This?") | Evaluates new task impact against live schedule before commitment, generating a burnout-risk delta. | Highlighted as load-bearing by mentors; live and verified. |
| 5 | Consequence Preview Modal | Intercepts task entry with before/after capacity impact while providing actionable choices. | Live in build; tested with 122.5-hour task triggering 100%+ red overcommit warning. |
| 6 | Category-Based Task Clustering | Groups tasks by load type within buckets (MUST-DO / MAINTENANCE / RECOVERY) with collapsible headers. | Live and tested; groups four Mental-load tasks into a unified header. |
| 7 | Import Fixed Commitments | Captures real constraints (lectures, work shifts) via timetable file upload to ground capacity in reality. | Live in build; 7 fixed schedule commitments successfully imported in demo. |
| 8 | Soft-Friction Task Entry | Exposes capacity cost clearly without hard-blocking, preserving student agency over final commitments. | Core product philosophy: "The choice remains yours, with the cost visible." Live. |
| 9 | Weekly Reflection & Stress Correlation | Synthesizes recovery floor breaches and mood trends into actionable forward-looking guidance. | Live in build; tracks recovery compliance, floor breaches, and mood trends. |
| 10 | Task "Easier Options" (Split/Defer/Find-Slot) | Offers lower-friction alternatives prior to hard entry to encourage proactive schedule adjustment. | Integrated into Consequence Preview modal flow. Live in build. |
| 11 | Recovery Planner (Auto-Suggest Blocks) | Auto-generates recovery blocks (physical break, screen-free wind-down) after 2+ consecutive heavy days. | Live in build; Protect/Edit/Lock-all batch controls verified. |
| 12 | Speech-to-Text Input | Provides voice input across task creation and chat interfaces to lower interaction friction. | Live and functional in build; improves task entry speed. |
| 13 | Cluster Map Popover *(Conditional)* | Icon button on Today view opening a modal with category tasks rendered as visual clusters. | Stretch goal; reuses existing category logic for low-risk visual enhancement. |

#### Dropped Ideas & Scope Cuts

| ID | Dropped Idea | Strategic & Scope Rationale | Decision Evidence |
|---|---|---|---|
| A | Margin Momentum (Gamification & Streaks) | Judges pattern-match streaks negatively; undercuts the core positioning that "recovery isn't a game." | Explicit cut based on Sept 7 mentor feedback to maintain product authority. |
| B | First-Launch Overlay (Full Onboarding Tutorial) | Engineering time better spent polishing Quick Check and Consequence Preview; replaced with a subtle trigger. | Substituted with lightweight "How Margin Works" prompt on initial interaction. |
| C | User Accounts & Cross-Session Persistence | Deferred to post-prototype build. Focuses build cycles on UI/interaction validation over database auth overhead. | Explicit scope discipline decision; state isolated strictly to browser session. |
| D | Google Calendar Full Sync | Avoids OAuth and API integration scope creep during build crunch; file upload provides equal validation. | Sept 7 mentor session recommendation; replaced with timetable file upload. |
| E | Advisor-Suggested Reframe | Proposed reframing Margin as a general decision tool; rejected because it weakened the recovery-first foundation. | Tested against system architecture and rejected to keep non-negotiable rest baseline. |
| F | Recovery Quality Self-Report | Morning check-in rating recovery efficacy; deprioritized to preserve low-friction core workflow. | Classified as non-essential stretch item; cut due to build timeline constraints. |

#### Decision Framework & Ideation Insights

- **Architecture-First Scope Filtering:** Every included capability directly enforces the recovery-first inversion. Concept reframes that diluted this position were rejected regardless of feature utility.
- **Proactive Risk Mitigation:** Eliminating gamification avoided critical evaluation risks where streak mechanics contradict wellness objectives.
- **Prototype Focus:** Complex infrastructure dependencies (OAuth, persistence databases) were deliberately exchanged for higher interaction polish on core pre-commitment workflows (Quick Check and Consequence Preview).

### 2.2 Ideation Boards

Our ideation happened mostly in a running WhatsApp thread alongside in-person mentor sessions and team meetups — not a single polished whiteboard session. The boards below are real screenshots from that process, in the order the thinking actually happened, including a feature we drafted in detail and then cut, and a live privacy self-correction mid-conversation.

| Board | Screenshot | What It Shows |
|---|---|---|
| **1. Early Brainstorm** — raw feature dump | https://drive.google.com/file/d/10PH753PoKIctO2ME3VZQd6M_OUTnYDI_/view?usp=sharing | Salmon Khan's initial brain-dump — dopamine/focus-mode mechanics, phone health-tracker integration, timetable upload, Google Calendar sync, and a "lifestyle balance wheel + deadline collision detector." Most of it didn't survive, but the timetable-upload and calendar-sync threads here became Import Fixed Commitments. |
| *(continued)* | https://drive.google.com/file/d/1B80un7jveiaZ6ZzXOfaUwM5dl4qlPFkX/view?usp=sharing | Meghan follows up proposing local screen-activity tracking (YouTube/Instagram/TikTok) to detect burnout or mindless drifting — this idea gets self-reversed 10 minutes later (see Board 2). |
| **2. A Real Privacy Self-Correction** | https://drive.google.com/file/d/15P_NjZ2u1X-l1HxCd6itWynkTZcwOLyk/view?usp=sharing | Meghan reverses her own screen-tracking idea, proposing instead "lightweight passive behavioral signals... without requiring users to manually document their entire day or compromising their privacy through continuous screen capture." Caught by the team itself, not a mentor — and foreshadows Stefan's later feedback on low-friction, privacy-respecting data collection. |
| **3. The Converged Pitch** | https://drive.google.com/file/d/1PgypDTch9o7uUuwf7sdjkzFZB5s1L_o1/view?usp=sharing | The moment scattered brainstorming became one product statement: "Margin is a recovery-first capacity planner... must feel supportive and intelligent, never judgmental, medical, or overly gamified." Nearly verbatim what shipped. Directly below it: the literal dev handoff prompt to build "MARGIN" as a mobile-first web app, with "I use this first" / "Ill run local then show yall." |
| **4. Feature Backlog** — including what we later cut | https://drive.google.com/file/d/1_IbqOnz7amvy9eKNcVd-5KPujuL0loWi/view?usp=sharing | A working planning doc showing gamification wasn't just considered and skipped — it was actively drafted: "Remove the weekly reflector and replace it with score streak," plus badges, achievement, and ranking. We built this out before cutting it after mentor feedback (Sept 7) confirmed our own instinct that it undercut the "recovery isn't a game" positioning. Also visible: real bug tracking and the pitch angle we prioritized. |
| **5. Supporting Research** — burnout as observable behavior | https://drive.google.com/file/d/1fvBn5VmMGJrwNU6KI5C1wbJBwRs7A7H1/view?usp=sharing | Before deciding what to track, we researched what burnout actually looks like physically and behaviorally — jaw clenching, shallow breathing, revenge bedtime procrastination — each cited to sources. This grounded our five-category load model in real symptomatology and is part of why we rejected invasive tracking (Board 2) in favor of a self-reported, low-friction check-in. |

#### Board 6: Affinity Diagram — Primary Research Themes (n=40)

**Method:** Clustered free-text survey responses ("What would've helped you realize earlier you were overloaded?") from our 40-student survey, cross-referenced against overcommitment/timing/consequence patterns.

| Theme | Response Share | What It Validates |
|---|---|---|
| "I wanted to SEE it, not just feel it" | 10 of 40 | Unprompted requests for visibility tools ("a scheduler," "a list of ongoing tasks so I can visibly see my current workload," "tracking daily time use earlier") — directly validates the Workload Visualizer. |
| "I only found out when it was too late" | 32 of 40 | Didn't recognize overload until mid-week or later — validates the "burnout without warning" framing at the core of the problem statement. |
| "Someone else noticed before I did" | 3 of 40 (recurring pattern) | "A friend's comment about my exhausted face," "when someone finally told me to slow down," "a reminder from someone" — students rely on external cues, not self-monitoring, validating a proactive system flag (Days at Risk) over passive tracking. |
| "Uncertainty is itself the problem" | 9 of 40 said "Not sure" | Combined with the 28 who confirmed overload, 92% either experienced it or couldn't rule it out — direct evidence of the visibility gap Margin solves. |

**Chart Preview:** [Chart](https://drive.google.com/file/d/1kAvrNvbi4LFvvFNiplbFeDQBzEM2UfZX/view?usp=sharing)

**Data link:** [Full survey responses](https://docs.google.com/spreadsheets/d/1ZS2FUt6SuVzEhZqlFxVxtfVktdq01nd4yVZC0ff5zD4/edit?usp=sharing)

### 2.3 Mentor Consultation

**Mentorship Window:** September 7–9, 2026

#### Session 1: September 7, 2026 — Khor Jia Quan (Stefan)

| Feedback Area | Specific Input | What Was Changed | Status & Rationale |
|---|---|---|---|
| Core Value Proposition | Feature-rich ≠ differentiated. Clearly articulate what makes Margin unique and valuable. | Repositioned product as recovery-first rather than task-manager-plus. Every feature maps directly to "recovery is a non-negotiable baseline." | ✓ Fully Addressed — value proposition clarity is critical for evaluation. |
| Prototype Clarity | Prototype currently obscures core selling points (behavioral analytics, capacity insights). Bring these to the forefront. | Promoted Days at Risk, Recovery Floor, and capacity breakdown to primary UI real estate. Reframed Quick Check around "Can I afford this?" | ✓ Fully Addressed — ensures evaluators immediately encounter the core product differentiation. |
| User Experience & Friction | Avoid overly burdensome daily questionnaires. Keep friction low and provide explicit privacy coverage. | Implemented soft-friction entry (no hard blocks), a streamlined two-question mood check-in with optional expansion, and a dedicated privacy policy page. | ✓ Fully Addressed — protects user agency while gathering essential capacity telemetry. |

#### Session 2: September 9, 2026 — Jarod Tan

| Feedback Area | Specific Input | What Was Changed | Status & Tradeoff Rationale |
|---|---|---|---|
| Overall UI/UX Flow | Make the application more intuitive and easier for end users to navigate. | Built Consequence Preview modal for decision clarity and streamlined Weekly Reflection. Refined navigation across Today, Planner, and Reflect views. | Partial — core flows stabilized; non-critical visual polish deferred. |
| Layout & Hierarchy | Reduce unnecessary visual complexity. Prominently highlight deadlines, task statuses, and productivity metrics. | Deferred. Trade-off made 24 hours prior to deadline to prioritize functional verification over cosmetic alignment. | ✗ Deferred — visual hierarchy gaps acknowledged; scope shifted to feature completeness. |
| Navigation & Flow | Refine movement between daily schedule views and weekly planning overviews. | Implemented seamless Week/Day toggle logic and smooth transitions between Show Full Week and Back to Lock In. | ✓ Fully Addressed — ensures fluid navigation across core planning screens. |
| Notifications & AI Prompts | Ensure AI output and suggestions are clear, concise, and immediately understandable. | Grounded Quick Check in plain-language burnout risk scores. Simplified Consequence Preview modal and actionable suggestions in Protect This Week. | ✓ Fully Addressed — replaced complex algorithm output with natural-language feedback. |
| UI Element Consistency | Standardize buttons, labels, icons, and interactive components across all screens. | Deferred. Comprehensive visual standardization pass required 2-3 dedicated build hours, which were reallocated to end-to-end functional testing. | ✗ Deferred — acknowledged gap; functional integrity prioritized over uniform styling. |
| End-User Focus | Adapt interface elements specifically for student users rather than raw technical metrics. | Translated system variables into student-centric concepts (Recovery Floor, Days at Risk, "Can I afford this?"). Some technical tags remain. | Partial — core metrics user-focused; minor internal taxonomy retained. |
| Speech-to-Text (STT) | Implement STT capability to convert voice inputs directly into actionable task data. | Implemented. Live and functional in build. Accessible via microphone input on task entry and chat interfaces. | ✓ Fully Addressed. |

---

## 3. Design & Prototype

**Live Prototype:** [Deployment](https://margin-preview-six.vercel.app/)

**How to Access:** Open the link in an incognito/private window to verify it loads without cached state. All user data is browser-session-only; refresh clears everything.

### 3.1 Key Screens & User Journey

| Screen & Focus | UI Visual & Layout Context | Interaction & Behavioral Flow |
|---|---|---|
| **Screen 1: Onboarding** *(Live Capacity Calculation)* | Recovery Floor setup with sleep and decompression sliders; Live Calculation circle showing 56% available, 94 hrs comfortable.[Screen 1](https://drive.google.com/file/d/1HYMkqzj5gYd1k5jyhThJtGZwP0sng3hO/view?usp=sharing) | Before adding any tasks, the student sets non-negotiable recovery (sleep: 7 hrs, decompression: 1 hr). Margin immediately calculates available capacity: 168 total hours − 56 recovery floor − 18 fixed commitments = 94 hours available. Recovery is locked in first; everything else competes for what's left. |
| **Screen 2: Today Dashboard** *(Capacity at a Glance)* | Mood check-in (Drained/Okay/Good/Energized), week capacity bar chart by day, Days at Risk callout for Thursday flagged HIGH RISK with 15.5H scheduled. [Screen 2](https://drive.google.com/file/d/1f6x9RgRt7zui3OSiJUWyPgKsgorFNZdp/view?usp=sharing) | Student lands on Today with a two-part mood check. Week capacity is visualized: each day shows mental/physical/social/time load stacked. Thursday is immediately flagged as HIGH RISK because it breaches the recovery floor. No hidden warnings; the cost is visible. |
| **Screen 3: Quick Check Modal** *("Can I Afford This?")* | Modal with two inputs: "What are you being asked to do?" and "Ask about your week," returning a burnout risk score with delta.[Screen 3](https://drive.google.com/file/d/1P5auNTTlWuIRXpwkVotNO7imrtFWnYZq/view?usp=sharing) | Student types a specific task. Margin reads their actual schedule and recovery state, queries Gemini, and returns a concrete answer with before/after burnout risk. The student sees the cost before committing. |
| **Screen 4: Consequence Preview Modal** *(Task Addition Cost)* | Modal showing before/after capacity impact. Circle gauge showing capacity shift, breakdown of the load added.[Screen 4](https://drive.google.com/file/d/1XFvHCNEjBT3qbLff5PG8C7ugVw5rSHZw/view?usp=sharing) | When adding a task that pushes capacity high, a modal intercepts with before/after gauges. Buttons: Add Anyway (soft-friction), Reschedule, See Impact. No hard block; the cost is just visible. |
| **Screen 5: Today's Lock In** *(Category-Based Clustering)* | Tasks grouped by category. MUST-DO bucket with collapsed header "Mental load · 3 tasks · 13.5 hrs" with task chips underneath. MAINTENANCE bucket with ungrouped single tasks.[Screen 5](https://drive.google.com/file/d/11FeOpdAs18R-ABwcXub_3MjJXguHxK4P/view?usp=sharing) | Tasks are grouped by category when 2+ share the same load type. One click expands/collapses the group. Reduces cognitive load of reading flat rows; clarifies the pattern immediately. |
| **Screen 6: Weekly Reflection** *(Stress Pattern & Next Week)* | Reflection summary: Recovery Maintained, Floor Breaches, Mood Trend, Next Week Insight. [Screen 6](https://drive.google.com/file/d/1fjE01NIXcLYFZGqtR7jj5OMcduPq9QYv/view?usp=sharing) | End-of-week screen correlates recovery floor breaches with mood trend, staging next week's starting point. Pattern-aware planning, not just tracking. |
| **Screen 7: Planner View** *(Full Week Overview)* | All tasks for the week organized by day. Fixed commitments and flexible tasks shown with load category icons. [Screen 7](https://drive.google.com/file/d/1iYewFXJRc0xw6hTOoaC8XFXGI7FtNAeP/view?usp=sharing) | Full week view gives strategic overview. Drag-to-reschedule or use "Easier Options" (split into smaller blocks, defer something, find a slot) to rebalance without hard entry friction. |
| **Screen 8: Recovery Planner** *(Auto-Suggested Blocks)* | Proactive suggestions after high-load days. Buttons: Protect, Edit, Lock All. [Screen 8](https://drive.google.com/file/d/1MXFvBM1UoLs8i6o0KoKgGPiqmzaeFtvE/view?usp=sharing) | After 2+ consecutive high-load days, Margin proactively suggests specific recovery blocks with type, time slot, and reasoning. Recovery is scheduled, not aspirational. |

### 3.2 Prototype Philosophy

Every screen reinforces one core principle: **Recovery is a non-negotiable baseline, capacity is visible before commitment, and the choice remains with the student.**

No hard blocks. No hidden warnings. Just cost and choice, side by side.

---

## 4. What Makes It Different

| Core Capability | Value Proposition | MyStudyLife | Structured | Tiimo | Sunsama | Motion | Finch | Fabulous | **Margin** |
|---|---|---|---|---|---|---|---|---|---|
| Multi-Dimensional Capacity | Tracks mental, physical, social, time, and errand load separately rather than raw hours. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Protected Recovery Baseline | Treats rest as a non-negotiable floor subtracted *before* allocating work. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Days at Risk Flagging | Proactively alerts when planned schedule breaches minimum recovery thresholds. | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Pre-Commitment Consequence Check | Reveals the exact capacity cost of a task *before* accepting it. | ✗ | ✗ | ✗ | Partial | Partial | ✗ | ✗ | **✓** |
| Live Schedule Cost Evaluation | Assesses task impact against actual calendar constraints, not generic estimates. | ✗ | ✗ | Partial | ✗ | ✗ | ✗ | ✗ | **✓** |
| Soft-Friction Task Entry | Informs users of overcommitment risks without hard-blocking task creation. | ✗ | ✗ | ✗ | Partial | ✗ | ✗ | ✗ | **✓** |
| Fixed Commitment Import | Syncs lectures, work shifts, and non-negotiable events for realistic baseline availability. | ✓ | ✓ | Partial | ✗ | ✓ | ✗ | ✗ | **✓** |

**Key Insight:** Every competitor is either passive (tracks/reflects but doesn't act) or acts on time/deadlines alone. Margin is the only one where the action is driven by a recovery-capacity signal, not just a calendar signal — the difference between protecting *time* and protecting *recovery capacity as a non-negotiable baseline*.

---

## 5. Technical Architecture & Feasibility

### Tech Stack

| Layer | Technology Choice | Rationale | Constraints & Tradeoffs |
|---|---|---|---|
| **Frontend** | React 19 + Vite + TypeScript | Fast dev loop; TypeScript catches state-shape bugs in a capacity-calculation-heavy app. | Monolithic Home.tsx holding all screen components (speed tradeoff for the build window). |
| **Styling / UI** | Tailwind CSS v4 + shadcn/ui (new-york style) | Provides component primitives without needing to build a custom design system under time pressure. | — |
| **Routing** | wouter | Lightweight alternative to React Router; the application has too few screens to justify a full router setup. | — |
| **Backend** | Express | Proxies the Gemini API call server-side so the API key is not exposed to the client. | Running as a Vercel serverless function. |
| **AI** | Google Gemini (free tier) | Powers the "Quick Check" feature's natural-language burnout reasoning. | Server-side proxy migration completed to prevent client-side key exposure. |
| **Database** | None | Deliberate scope cut; prototype phase focuses on UI and interaction validation rather than infrastructure. | All state is browser-session only (no cross-session history, multi-device support, or real user accounts). |
| **Hosting** | Vercel | Free tier with zero-config GitHub deployments. | Serverless cold-starts and function timeouts during the Gemini API roundtrip present a live risk. |

**System Architecture Diagram:**
[System Architecture](https://drive.google.com/file/d/1q2hq3ELls_8B05EADAlSwfK4jOSJ6kfb/view?usp=sharing)

Margin is a stateless, client-side-first prototype. All capacity calculations (Recovery Floor, Days at Risk, Consequence Preview, category clustering) run locally in the browser for real-time performance and privacy. The backend exists only to proxy Gemini API calls, keeping the API key secure. Refresh resets all state; this is intentional. A production version would add cross-session persistence and user accounts.

### Build Plan & Scope

#### Confirmed Features (Priority Order)

| # | Feature | Core Description | Implementation Status |
|---|---|---|---|
| 1 | Recovery Floor as Protected Baseline | Subtracts sleep and decompression first; available work capacity is calculated strictly from remaining energy/time. | **Live & Tested** |
| 2 | Workload Visualizer | Tracks Mental, Physical, Social, Time, and Errands loads separately instead of folding them into standard hours. | **Live & Tested** |
| 3 | Days at Risk Flagging | Proactively flags days breaching recovery thresholds, offering targeted rebalancing suggestions. | **Live & Tested** |
| 4 | Quick Check ("Can I Afford This?") | Natural-language parser evaluating candidate tasks against live schedule data to output computed burnout risk deltas. | **Live & Tested** |
| 5 | Consequence Preview Modal | Task-entry intercept showing before-and-after capacity impact with options to Add Anyway, Reschedule, or See Impact. | **Built & Integrated** |
| 6 | Category-Based Task Clustering | Groups tasks by load type within buckets (MUST-DO / MAINTENANCE / RECOVERY) with collapsible headers showing combined hours. | **Live & Tested** |
| 7 | Import Fixed Commitments | File upload interface for fixed timetables (lectures, work shifts); explicitly tagged for future full GCal sync. | **Live** |
| 8 | Soft-Friction Task Entry | Displays cost impact explicitly without hard-blocking tasks, maintaining user agency over final decisions. | **Live** |
| 9 | Weekly Reflection & Stress Correlation | Synthesizes recovery breaches and mood trends into forward-facing operational insights for the upcoming week. | **Built** |

#### Conditional Scope (Time-Permitting Stretch Goal)

**Cluster Map Popover:** A static popover triggered via a small header icon on Today's Lock In. Reuses existing category grouping logic to present tasks as visual load clusters (excludes complex force-directed graph calculations).

#### Explicitly Cut Scope

| Feature Cut | Strategic Rationale |
|---|---|
| Margin Momentum (Gamification / Streaks) | Undercuts the "recovery isn't a game" product positioning. Judges pattern-match streaks negatively; focusing on core visibility provides higher strategic value. |
| First-Launch Overlay (Full Onboarding Tutorial) | Substituted with a lightweight, auto-triggered "How Margin Works" prompt on first interaction to allocate dev cycles to Quick Check and Consequence Preview. |
| User Accounts & Cross-Session Persistence | Deferred to post-prototype build. Prototype phase validates UI/interaction flow without needing database auth flows. State lives strictly in browser memory. |
| Google Calendar Full Sync | Replaced with simple timetable file upload. Avoids calendar API authentication and OAuth scope creep during deadline crunch. |

#### Strategic Takeaway & Prototype Boundary

Margin ships as a single-session, single-user prototype designed to validate one core premise: **recovery-first capacity management works, and students change their behavior when costs are visible prior to commitment.**

- **Scope Discipline:** Every feature included directly reinforces pre-commitment capacity visibility.
- **Deliberate Choices:** Every cut reflects explicit feedback from mentor sessions (Sept 7–9) to maximize polish and core value delivery over feature breadth.
