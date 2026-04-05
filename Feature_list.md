# EngPrep — Complete Product Specification
## Every Page · Every Feature · Every Use Case
*Build-ready. Prioritized. Nothing left vague.*

---

# TABLE OF CONTENTS

1. Landing Page
2. Authentication (Sign Up / Log In)
3. Onboarding Flow
4. Challenges Library
5. Contextual DSA Workspace
6. PR Review Workspace (Spot the Bug)
7. The War Room (Incident + Architecture + Tech Debt)
8. System Design Simulator
9. User Dashboard
10. Progress & Readiness Report
11. CLI Sync & Setup Page
12. Pricing Page
13. Company-Specific Tracks
14. Behavioral Interview Coach
15. Admin / Content Management (Internal)
16. Global Components & Systems

---

# PAGE 1 — LANDING PAGE
**URL:** `/`
**Goal:** Convert a skeptical engineer into a sign-up in under 60 seconds.
**Tone:** Dark, premium, developer-native. Feels like Vercel meets Linear.

---

## Section 1.1 — Navigation Bar

**Features:**
- Logo left: `engprep` in monospace font with a blinking terminal cursor
- Nav links: `Challenges` · `War Room` · `System Design` · `Pricing`
- Right side: `Log In` (ghost button) + `Start Free` (filled green button)
- Sticky on scroll, background blurs slightly (backdrop-filter) as user scrolls down
- On mobile: hamburger menu, full-screen overlay nav

**Use Cases:**
- First-time visitor navigates directly to Pricing or Challenges
- Returning user hits Log In quickly from any scroll position
- Mobile user accesses full nav without layout breaking

---

## Section 1.2 — Hero Block

**Features:**
- **Headline:** `Stop reversing binary trees. Start engineering.`
- **Sub-headline:** `The only interview platform built for how software actually works — incidents, PRs, system failures, and real tradeoffs.`
- **CTA Buttons:** `Start Free` (primary) + `See How It Works` (ghost, scrolls to demo)
- **CLI Install Box:** A mock terminal below the headline showing:
  ```
  $ npm install -g engprep
  ✓ engprep installed (v2.1.0)
  $ engprep pull war-room-42
  ✓ Incident bundle downloaded → ./engprep/incidents/war-room-42/
  ```
  One-click copy button on the command. On copy: button changes to `Copied ✓` for 2 seconds.
- **Animated background:** Faint grid lines with occasional "data pulse" animations — like a monitoring dashboard heartbeat. Not distracting, adds depth.
- **Social proof ticker:** Small line below CTAs — `Joined by 4,200+ engineers from Google, Stripe, Amazon, Vercel`

**Use Cases:**
- Engineer lands from a Reddit/HN post about "anti-LeetCode platform" — headline validates their frustration immediately
- Developer sees CLI command, immediately understands this is a tool for them, not a toy
- Visitor clicks copy on `npm install -g engprep` before even reading further — the CLI is the hook

---

## Section 1.3 — The Problem Statement

**Features:**
- Header: `You've been practicing the wrong thing.`
- Two-column layout — left: what they're doing now, right: what actual jobs require
  | What LeetCode tests | What your job actually is |
  |---|---|
  | Reverse a linked list in O(n) | Debug why checkout is failing for 12% of users |
  | Find the kth largest element | Review a PR that will cause a memory leak |
  | Implement BFS from memory | Design a system that won't crash at 10M users |
- Small label below: `Both matter. Only one of them actually gets you hired AND makes you a better engineer.`
- **Not a knock on DSA** — important framing. We include DSA, just with real context.

**Use Cases:**
- Engineer who's been grinding LeetCode for 3 months and still failing interviews reads this and feels seen
- Mid-senior engineer who hates LeetCode understands this isn't just another problem bank

---

## Section 1.4 — Feature Showcase (Interactive Tabs)

**Features:**
- 4 tabs: `Contextual DSA` · `PR Review` · `War Room` · `System Design`
- Default tab: War Room (most novel, most impressive)
- Each tab shows an animated mockup of that workspace
- **War Room tab mockup:**
  - Shows a fake incident dashboard: CPU chart spiking, error rate climbing, Redis cache miss counter going up in real-time (CSS animated numbers)
  - Caption: `"ENG-911: Checkout failing. Redis hit rate dropped from 94% to 31% at 14:32. A deploy shipped at 14:28. You have 20 minutes."`
  - A blinking cursor in a response field below
- **PR Review tab mockup:**
  - Shows GitHub-style diff with red/green lines
  - One line highlighted with a comment bubble saying "this will cause an N+1 query"
- **DSA tab mockup:**
  - Shows a Jira-style ticket: `ENG-402: Payment system double-billing customers. Find the duplicate transaction ID.`
  - Code editor below with pytest output panel
- **System Design tab mockup:**
  - Shows drag-and-drop nodes (Load Balancer → App Servers → Database)
  - Database node glowing red with label `CRASHED: 10K req/s`

**Use Cases:**
- Visitor wants to understand the product before signing up — tabs let them self-select the feature most relevant to their level
- SDE III sees War Room tab, immediately understands the senior-level positioning
- SDE I sees DSA tab with Jira context, prefers it over abstract LeetCode framing

---

## Section 1.5 — Role Tracks

**Features:**
- Header: `Built for where you are. Designed for where you're going.`
- 3 cards, side by side:
  - **SDE I (Entry):** Contextual DSA + PR Review basics + War Room Level 1 + Behavioral
  - **SDE II (Mid):** All of above + Architecture Autopsy + System Design fundamentals + Company tracks
  - **SDE III (Senior):** All of above + Tech Debt Tribunal + Advanced system design + Staff-level War Room scenarios
- Each card has a `Explore Track →` button linking to filtered Challenges page
- Visual indicator: a "difficulty gradient" bar under each card (green → amber → red)

**Use Cases:**
- New grad lands on the page, clicks SDE I card, immediately knows this is relevant to them
- Senior engineer switching companies selects SDE III track
- User doesn't know their level — small `Not sure? Take the 3-minute assessment →` link below the cards

---

## Section 1.6 — The War Room Demo (Key Differentiator)

**Features:**
- Full-width dark section with a live-feeling incident scenario
- Header: `"Any AI can pass a coding test. Only you can own the incident."`
- A compressed but interactive incident scenario embedded in the page:
  - Shows: timestamp log, 3 fake metrics (latency, error rate, cache hit rate)
  - 3 multiple choice options for "What's your first action?"
  - On selection: immediate feedback — correct/incorrect with a 2-sentence explanation
  - CTA below: `Practice full War Room scenarios →` (links to sign-up)
- **This is a free, no-login taste of the product** — highest conversion tool on the page

**Use Cases:**
- Skeptical visitor tries the demo, gets it right, feels smart and capable → converts
- Visitor gets it wrong, reads explanation, thinks "I need to get better at this" → converts
- Developer screenshots this and shares on Twitter → viral loop

---

## Section 1.7 — Social Proof

**Features:**
- Header: `What engineers are saying` (styled to look like Reddit/HN comments, not corporate quotes)
- Each testimonial formatted as a Reddit comment card:
  - Username (u/backend_dev_nyc), subreddit tag (r/cscareerquestions), upvote count (847)
  - Quote: `"Finally. An interview tool that doesn't make me feel like I'm studying for a math competition."`
- 6 testimonials in a 2-column masonry grid
- A "Source: Reddit · r/cscareerquestions" attribution below each
- Small note: `Real quotes. No made-up corporate testimonials.`

**Use Cases:**
- Developer trusts Reddit more than any polished marketing copy — this format converts them
- Someone googling "LeetCode alternatives Reddit" finds this framing familiar
- User about to bounce reads a quote that matches their exact frustration and reconsiders

---

## Section 1.8 — Pricing Preview

**Features:**
- Minimal 2-column comparison: Free vs Pro
- Free: "Start today, no card needed"
- Pro: `$179/yr` with `or $29/mo` beneath it
- 3 bullet points each (not full pricing table — that's on /pricing)
- Primary CTA: `See full comparison →` → goes to /pricing
- Secondary CTA: `Start Free →` → goes to /signup

---

## Section 1.9 — Footer

**Features:**
- Left: Logo + tagline `Real engineering. Real interviews. Real growth.`
- Links: Product (Challenges, War Room, System Design, Pricing) · Company (About, Blog, Careers) · Legal (Privacy, Terms)
- Right: GitHub link + Twitter/X link
- Newsletter signup: `Get one real engineering scenario every week — free.` + email input + Subscribe button
- Bottom bar: `© 2026 EngPrep · Made for engineers, by engineers`

---

---

# PAGE 2 — AUTHENTICATION
**URL:** `/signup` · `/login`
**Goal:** Frictionless entry. No dark patterns.

---

## Section 2.1 — Sign Up Page

**Features:**
- Left panel: rotating "did you know" cards showing War Room snippets (keeps engineers engaged while filling form)
- Right panel: sign-up form
  - **Continue with GitHub** (primary — developers prefer this, pre-fills name + avatar)
  - **Continue with Google** (secondary)
  - Divider: `or`
  - Email + Password fields
  - `Create Account` button
- Below form: `Already have an account? Log in →`
- Terms: `By signing up you agree to our Terms and Privacy Policy` (small, not aggressive)
- **No phone number. No credit card. No "verify your humanity" checkbox on first step.**

**Use Cases:**
- Developer signs up with GitHub in 2 clicks — fastest path
- User without GitHub uses email — no friction
- Returning user lands on signup accidentally — sees "Log in" link immediately

---

## Section 2.2 — Log In Page

**Features:**
- Same layout as sign-up, reversed messaging
- `Forgot password?` link next to password field
- `Remember me` checkbox (30-day session)
- Error states: specific messages — `No account found with this email` vs `Incorrect password` (not generic "invalid credentials")
- On successful login: redirect to Dashboard (or to the page they came from if they were redirected mid-session)

---

---

# PAGE 3 — ONBOARDING FLOW
**URL:** `/onboarding`
**Goal:** In 4 steps, give the user a personalized track and their first "win" in under 5 minutes.
**Trigger:** Runs once after first sign-up. Skippable but gently discouraged.

---

## Step 3.1 — Role Selection

**Features:**
- Header: `Where are you in your career?`
- 3 large clickable cards with icons:
  - `Entry Level (0–2 yrs)` — SDE I
  - `Mid Level (2–5 yrs)` — SDE II
  - `Senior (5+ yrs)` — SDE III
- Single-select. Clicking a card auto-advances to next step (no "Next" button needed).
- Skip link bottom right: `Skip and explore on my own →`

---

## Step 3.2 — Target Company (Optional)

**Features:**
- Header: `Targeting a specific company?`
- Company logo grid: Google, Meta, Amazon, Apple, Microsoft, Stripe, Airbnb, Notion, Linear, Vercel + `Other` + `Not sure yet`
- Multi-select allowed (max 3)
- This populates "Company-specific" tags on challenge cards throughout the product
- If `Not sure yet` selected: skips company-specific content but keeps all other features active

---

## Step 3.3 — Interview Timeline

**Features:**
- Header: `When is your interview?`
- Options:
  - `Within 2 weeks` → "Sprint Mode" — surfaces highest-impact challenges first
  - `1–2 months` → "Steady Prep" — balanced daily schedule
  - `3+ months` → "Deep Build" — full curriculum order
  - `Just exploring` → unlocks everything, no guided path
- This setting determines the order of challenges in their dashboard queue

---

## Step 3.4 — First Challenge (Immediate Win)

**Features:**
- Header: `Let's start. This takes 8 minutes.`
- Presents one carefully chosen challenge based on their level:
  - SDE I: A short Contextual DSA problem (easy, solvable, confidence-building)
  - SDE II: A PR Review with a clear N+1 query bug
  - SDE III: A War Room incident (low complexity, fast resolution)
- User completes it (or partially completes it)
- Completion triggers: confetti animation + `+50 XP` toast notification + redirect to Dashboard

**Use Cases:**
- New user feels immediate progress — not overwhelmed by a library of 300 problems
- The "first win" is engineered to be achievable in under 10 minutes, regardless of level
- Even a partial attempt creates a history record and gives the dashboard something to show

---

---

# PAGE 4 — CHALLENGES LIBRARY
**URL:** `/challenges`
**Goal:** Let the user find exactly what they need to practice, right now.

---

## Section 4.1 — Page Header

**Features:**
- Title: `Challenges`
- Subtitle: `${X} problems across ${Y} real engineering scenarios`
- A search bar: full-text search across title, tags, and description — results appear inline, no page reload
- Right of search: `Random Challenge` button — picks one within their current filters

---

## Section 4.2 — Sidebar Filters

**Features:**
- **Track Filter:** SDE I / SDE II / SDE III (multi-select)
- **Type Filter:** Contextual DSA · PR Review · War Room · System Design · Behavioral
- **Company Filter:** Google · Meta · Amazon · Stripe · Airbnb · Other (populated from their onboarding selection, but changeable)
- **Topic Filter:** Arrays & Hashing · Trees & Graphs · Databases · Caching · Queues · Concurrency · Networking · Auth & Security · Observability
- **Status Filter:** Not Started · In Progress · Completed · Needs Review
- **Estimated Time:** < 15 min · 15–30 min · 30–60 min
- `Clear All Filters` link at top of sidebar
- Filter state persists in URL query params (shareable filtered views)

---

## Section 4.3 — Challenge Card List

**Features:**
- Default view: card list (not table, not grid) — each card shows:
  - **Type badge:** color-coded pill (DSA = blue, PR Review = amber, War Room = red, System Design = purple, Behavioral = teal)
  - **Title:** `ENG-402: Payment system is double-billing customers`
  - **Company tags:** small logos (Google, Stripe) if applicable
  - **Estimated time:** `~20 min`
  - **Level:** SDE I / II / III dot indicator
  - **Status:** Not Started / In Progress / Completed checkmark
  - **CLI hover reveal:** On hover, a terminal-style overlay slides up from the bottom of the card: `$ engprep pull 402` with a one-click copy button
- **Pagination:** 20 per page, or infinite scroll (user setting in preferences)
- **Sort options:** Newest · Most Popular · Highest Rated · Estimated Time ↑ · Recommended (personalized)

---

## Section 4.4 — Featured / Pinned Section

**Features:**
- At top of list (above filters): `Recommended for you` strip — 3 horizontally scrollable cards based on their weak areas (from Dashboard analysis)
- `This week's War Room` — one featured incident scenario, pinned for 7 days
- After completing 5 challenges: `Your next milestone` card appears — `Complete 3 more PR Reviews to unlock Stripe company track`

---

## Section 4.5 — Challenge Detail Preview

**Features:**
- Clicking a card opens a **right-side drawer** (not a new page) with:
  - Full title and description
  - Difficulty rating (1–5 stars, crowd-sourced from completions)
  - Topics covered
  - Estimated time
  - `Start Challenge` button → opens workspace
  - `Pull via CLI` code block
  - `How others solved this` (locked for free users — Pro feature)
  - Comments/discussion count: `14 engineers discussed this`
- Drawer can be closed with ESC or clicking outside

---

---

# PAGE 5 — CONTEXTUAL DSA WORKSPACE
**URL:** `/challenges/dsa/:id`
**Goal:** Make DSA feel like real work, not a math test.

---

## Section 5.1 — Top Bar

**Features:**
- Left: Challenge ID + title (`ENG-402: Payment system double-billing`)
- Center: Timer (starts on challenge open, can be paused) — shown as `14:32` counting up
- Right: `Save Progress` · `Submit` · `Switch to CLI Mode` (Pro) · `Exit` (with unsaved-changes warning)
- Mode indicator: `Web Mode` (free) or `CLI Mode` (Pro) — clearly labeled

---

## Section 5.2 — Left Panel: The Jira Ticket

**Features:**
- Header styled exactly like a Jira ticket — ticket ID, reporter name, timestamp, priority badge
- **Business context description:** Written as a real engineering ticket, not an abstract problem statement
  - Example: `"Our finance team flagged that 3 customers were charged twice for the same order in the last 24 hours. Engineering traced it to the transaction log. The array below is a sample of transaction IDs from our database. Some IDs appear twice due to a race condition in our payment processor. Find and return the duplicate transaction ID so we can issue refunds."`
- **Acceptance criteria section:** Written as real ticket ACs:
  - `Given a list of transaction IDs, return the one that appears more than once`
  - `Must run in O(n) time — this runs on every checkout`
  - `Must handle up to 10M transaction IDs`
- **Hints accordion:** Collapsed by default. 3 progressive hints:
  - Hint 1: `Think about what data structure lets you check membership in O(1)`
  - Hint 2: `A hash set can track what you've seen. What happens when you see something twice?`
  - Hint 3: `Floyd's cycle detection also works here if you want O(1) space`
  - Each hint costs `-5 XP` to unlock (shown before unlocking)
- **Related incidents tab:** `This pattern caused [real companies]'s outage in [year]` — links to real postmortems

---

## Section 5.3 — Right Panel: Code Editor

**Features:**
- Monaco editor (same engine as VS Code)
- Language selector: Python (default) · JavaScript · TypeScript · Go · Java · Rust
- Line numbers, syntax highlighting, bracket matching, autocomplete
- **Test Cases panel** (below editor, collapsible):
  - Pre-written test cases shown as pytest-style output
  - Run button: `▶ Run Tests` — output appears in terminal-style panel:
    ```
    ========================= test session starts ==========================
    test_payment.py::test_basic PASSED                                [33%]
    test_payment.py::test_large_input PASSED                          [66%]
    test_payment.py::test_edge_case FAILED                           [100%]
    ========================== 1 failed in 0.34s ===========================
    ```
  - Execution time shown: `Ran in 0.34s · Your solution: O(n) time, O(n) space`
- **Hidden test cases:** On submit, 3 additional hidden tests run (edge cases the user didn't see)
- **Code diff on re-submit:** If user submits a second time, shows a diff from their previous attempt

---

## Section 5.4 — CLI Mode (Pro Only)

**Features:**
- When toggled: code editor grays out and shows:
  ```
  CLI Mode active.
  Run your solution locally and push when ready.
  
  $ engprep push 402
  Waiting for submission...
  ```
- User runs the challenge in their own terminal with their own IDE, editor, debugger
- `engprep push` command submits their local solution to the platform
- Results appear in real-time in the web panel via websocket
- **Why this is premium:** It's the only way to practice exactly how you'll work on the job

---

## Section 5.5 — Post-Submit Panel

**Features:**
- **Pass state:** Green checkmark + `All tests passed · +75 XP earned`
  - Shows: time taken, space/time complexity (user-declared, not auto-detected), comparison: `Faster than 68% of submissions`
  - `See community solutions` (Pro) · `Try harder version` · `Next challenge →`
- **Fail state:** Red with specific failing test case shown + expected vs actual output
  - `View hint` button (costs 5 XP) · `Try again` · `See solution` (after 3 attempts or 30 min)
- **Explanation panel:** Always shown after pass or after solution viewed — explains the real-world connection: `This is the pattern that caused Stripe's double-charge incident in 2022. Here's their postmortem.`

---

---

# PAGE 6 — PR REVIEW WORKSPACE (SPOT THE BUG)
**URL:** `/challenges/pr/:id`
**Goal:** Make engineers practice the skill that matters at mid-senior level: reading someone else's code under pressure.

---

## Section 6.1 — Incident Context Panel (Left)

**Features:**
- Styled like a Sentry error dashboard — dark, monitoring-tool aesthetic
- Shows:
  - **Error log box:** `[WARN] 2026-04-03 14:31:22 | Memory usage at 89% | Service: user-notifications`
  - **Stack trace excerpt:** (abbreviated, not full — user has to find the source in the diff)
  - **Alert timeline:** Sparkline chart showing when the error started (CSS animated)
  - **Context:** `A junior engineer opened this PR 2 hours ago. The CI pipeline passed. But this error started 40 minutes after their last deploy. Find the bug.`
- Tabs: `Error Log` · `Context` · `Acceptance Criteria`

---

## Section 6.2 — GitHub-Style Diff (Right)

**Features:**
- Full GitHub PR diff UI — red lines (removed), green lines (added), unchanged lines (gray)
- Line numbers on both sides (old file / new file)
- File tabs at top if multiple files changed
- **Click-to-comment:** User clicks any line number → a comment box opens inline:
  - Text area: `Describe the bug and how to fix it`
  - Submit button: `Leave Review Comment`
  - After submit: comment appears as a thread under that line (like real GitHub)
- **Highlight mode:** User can also drag-select multiple lines to comment on a block
- **The bug is never highlighted** — user must find it themselves
- Files that are irrelevant to the bug are included (noise, like real PRs)

---

## Section 6.3 — Review Submission

**Features:**
- Bottom bar: `Submit Review` button — only active after at least one comment is left
- On submit: evaluation panel slides up from bottom:
  - **Did you find the bug?** — Yes / Partially / No
  - If yes: `+100 XP · Correct line identified · Comment quality: Strong`
  - Comment quality rubric (AI-evaluated against a rubric): Identified the bug · Explained root cause · Suggested a fix · No false positives
  - **The actual bug revealed** with explanation: `The infinite loop on line 47 occurs because the while condition never becomes false when the user has 0 notifications. This will spin forever and consume 100% of CPU for that user.`
- `See how a senior engineer would comment this PR` (Pro feature — shows a model senior review of the full diff)

---

## Section 6.4 — Difficulty Modes

**Features:**
- Easy: Bug is in a single file, introduced in < 5 lines of changes
- Medium: Bug spans 2 files, requires understanding data flow between them
- Hard: Bug is architectural — the code is correct but the pattern is wrong (e.g., synchronous call in async context, missing idempotency key)
- War Room variant: PR Review given with active incident — `the deploy shipped 10 minutes ago and production is already failing, find the bug faster`

---

---

# PAGE 7 — THE WAR ROOM
**URL:** `/challenges/war-room/:id`
**Goal:** Test and build engineering judgment — the skill AI cannot replace.
**This is the signature feature. It should feel like a NASA control room, not a quiz.**

---

## Section 7.1 — Briefing Screen (Pre-Incident)

**Features:**
- Full-screen dark overlay before the incident starts
- Header: `INCIDENT INCOMING`
- Shows: Incident ID, Severity (P0/P1/P2), Affected system, Expected time to resolution
- 3-second countdown before the incident dashboard loads
- `Ready? Begin →` button to skip countdown
- **Objective clearly stated:** `Your job: diagnose the root cause, determine first action, and write your incident response plan.`

---

## Section 7.2 — Incident War Room Dashboard

**Features:**
- **Top strip:** Incident timer counting up (pressure mechanism) + Severity badge + `ENG-911` ID
- **Left panel — Live Metrics (simulated, animated):**
  - CPU usage: sparkline chart, currently normal or spiking
  - Memory: gauge
  - Error rate: % counter, color-coded (green/amber/red based on threshold)
  - Latency (p50/p95/p99): line chart
  - Cache hit rate: percentage
  - Active connections: number
  - All values animate subtly — this is not static. Numbers fluctuate like a real dashboard.
  - **The bug is visible in the metrics** — e.g., cache hit rate dropped at exactly the same time as a deploy
- **Center panel — Error Log:**
  - Scrollable, monospace, dark background
  - Log lines timestamped, filterable by level (ERROR / WARN / INFO)
  - Specific log lines contain the clues — user must read carefully
  - `CTRL+F` search works inside the log panel
- **Right panel — System Context:**
  - Architecture diagram of the affected system (simplified, SVG)
  - Recent deploys list: what shipped and when
  - On-call roster (flavor text): `Primary: You. Backup: nobody, it's Saturday.`
  - Runbook links (locked for this scenario — simulate real-world missing docs)

---

## Section 7.3 — Response Panel

**Features:**
- Pinned bottom panel (always visible)
- Three tabs:
  - **Diagnose:** `What is the root cause? (required)`
    - Text area with a structured template:
      ```
      Root cause: ___
      Evidence: ___
      Time of origin: ___
      ```
  - **First Action:** `What do you do RIGHT NOW? (required)`
    - Multiple choice (3–5 options) — user selects and writes a 1-sentence justification
    - No "obviously wrong" options — all choices are defensible, some are better
  - **Incident Plan:** `Write your remediation steps (optional but scored)`
    - Free text — 3–5 bullet points expected
    - AI-evaluated against a rubric
- `Submit Response` button — disabled until Diagnose and First Action are filled

---

## Section 7.4 — Post-Response Evaluation

**Features:**
- Full-screen result panel:
  - **Diagnosis score:** Did they identify the correct root cause? Partial credit for identifying the right system (cache) even if not the exact trigger
  - **First Action score:** Was their first action correct, acceptable, or wrong? Explanation of why rollback beats debugging in a P0 scenario.
  - **Speed bonus:** If resolved under target time, +25 XP speed bonus
  - **Model response:** Shows what a senior SRE would have done — step by step
  - **Real postmortem link:** `This scenario is based on Cloudflare's 2023 cache invalidation incident. Read the actual postmortem →`
- XP + badges awarded
- `Debrief this scenario with AI` (Pro) — chat interface to ask "what if I had done X instead?"

---

## Section 7.5 — Architecture Autopsy Mode

**URL:** `/challenges/autopsy/:id`
**Trigger:** SDE II/III track challenges of type `Architecture Autopsy`

**Features:**
- No active incident — system is running fine TODAY
- Left panel: Full system architecture diagram (interactive SVG, pan + zoom)
  - Nodes: services, databases, caches, load balancers, queues
  - Edges: request flows with approximate req/s labels
  - User can click any node to see its config: `PostgreSQL 13 · Single primary · No read replicas · 500GB storage`
- Center panel: Scenario brief
  - `"This system handles 500K users today. Your company just announced a Series B. You're going to 5M users in 6 months. What fails first?"`
- Response panel: User identifies and ranks failure points
  - Select a node → click `Flag as failure point` → classify as `Bottleneck / SPOF / Security risk / Data loss risk`
  - Write a 2-sentence justification for each flag
- Evaluation: Did they catch the right failure points? Shown ranked by severity with explanations.

---

## Section 7.6 — Tech Debt Tribunal Mode

**URL:** `/challenges/tribunal/:id`
**Trigger:** SDE III track challenges of type `Tech Debt Tribunal`

**Features:**
- Left panel: A backlog of 10–14 tech debt items (styled like Jira)
  - Each item has: title, age (`3 months old`), severity label, estimated fix effort (S/M/L/XL)
  - Example items:
    - `DEBT-01: Hardcoded API key in config.yml (3 months old)`
    - `DEBT-02: User search query takes 4.2s on tables > 1M rows`
    - `DEBT-03: No retry logic on payment webhook handler`
    - `DEBT-04: Test suite has 34% flake rate`
    - `DEBT-05: Auth tokens don't expire`
- User's task:
  - Drag items to rank (drag-and-drop reorder list)
  - Mark top 3 as `This Sprint`
  - Write a 1-sentence PM-friendly explanation for each selected item: `Why this matters in plain English`
  - Estimate blast radius of the worst unfixed item: `If we don't fix DEBT-05 this quarter, what happens?`
- Evaluation:
  - Security issues (hardcoded key, non-expiring tokens) should rank top — if they don't, score penalized
  - PM-friendly explanations graded on clarity, not technicality
  - Model response shown with reasoning

---

---

# PAGE 8 — SYSTEM DESIGN SIMULATOR
**URL:** `/challenges/system-design/:id`
**Goal:** Turn system design from a whiteboard exercise into an interactive simulation with real feedback.

---

## Section 8.1 — Problem Brief

**Features:**
- Left panel — Design brief styled as a product requirements doc:
  - `"Design a URL shortener. Expected scale: 100M URLs, 10B redirects/month, 99.99% uptime required."`
  - **Non-functional requirements listed explicitly:** Read-heavy (100:1 read/write), low latency (< 50ms p99), globally distributed
  - **Constraints:** `You have 1 hour. You will be asked to justify every decision.`
- Below brief: `Guiding questions` (collapsible):
  - `How many URLs will you store?`
  - `What happens if the database goes down?`
  - `How do you handle a celebrity link that gets 10M clicks in 1 hour?`

---

## Section 8.2 — Design Canvas

**Features:**
- Center: infinite canvas (pan + zoom) with grid background
- **Left palette — draggable components:**
  - Infrastructure: Load Balancer · CDN · API Gateway · Rate Limiter
  - Compute: App Server · Worker · Cron Job · Serverless Function
  - Storage: PostgreSQL · MySQL · MongoDB · Cassandra · S3 · HDFS
  - Cache: Redis · Memcached
  - Queue: Kafka · RabbitMQ · SQS
  - Other: DNS · Firewall · Auth Service · Search (Elasticsearch)
- **Drag to canvas:** Components snap to grid. Auto-labeled with their name.
- **Connect components:** Click source → click target → arrow drawn with a label input (`REST · 10K req/s`)
- **Component config panel:** Click any component on canvas → right panel shows config options:
  - For PostgreSQL: `Single / Primary + Replica / Sharded` selector
  - For Redis: `Standalone / Cluster` selector
  - For Load Balancer: `Round Robin / Least Connections / IP Hash` selector
- **Undo/redo:** CMD+Z / CMD+Y
- **Save draft:** Auto-saves every 30 seconds

---

## Section 8.3 — Traffic Simulation

**Features:**
- Top bar: `▶ Run Traffic Simulation` button
- On click: animated data flow begins
  - Dashed lines pulse along arrows (direction of traffic)
  - Each component shows a live fake metric: `CPU 34%` · `Memory 2.1GB` · `Queue depth: 0`
- **Stress test mode:** `Spike to 10x traffic` button
  - All metrics escalate
  - If no cache: Database node turns amber then red → `CRASHED: 50K req/s → DB cannot handle this`
  - If no rate limiter: API Gateway turns red → `DDOS: 1M req/s — no rate limiting configured`
  - If single DB with no replica: `SPOF: Database is down, all writes failing`
- **Crash animations:** Node turns red, shakes slightly, shows crash reason in a badge
- **Healing:** User can add missing components without resetting — simulation adapts

---

## Section 8.4 — AI Hints System

**Features:**
- Hint panel on the right (collapsed by default)
- Context-aware hints triggered by the simulation:
  - After DB crash: `Hint: Relational databases struggle above ~5K writes/s. Consider adding a write-through cache or sharding your DB.`
  - After no CDN for URL redirects: `Hint: URL redirects are read-heavy and globally distributed. A CDN can serve cached redirects in < 5ms without hitting your app servers.`
- Hints are shown as cards, one at a time, not dumped all at once
- User can dismiss hints or `Tell me more →` which opens a sidebar with a 200-word explanation + diagram

---

## Section 8.5 — Submission & Evaluation

**Features:**
- `Submit Design` button → opens evaluation flow:
  - **Completeness check:** Does the design have all required components for the stated scale?
  - **Failure mode check:** Does it have a SPOF? Is the DB a bottleneck?
  - **Tradeoff justification:** User writes 3 tradeoff decisions they made (e.g., `I chose Cassandra over PostgreSQL because...`)
  - **Score breakdown:** Scalability · Reliability · Efficiency · Clarity of tradeoffs
- Model solution shown after submission: a canonical design with annotations explaining every decision
- `Compare my design vs model` — overlay view showing differences

---

---

# PAGE 9 — USER DASHBOARD
**URL:** `/dashboard`
**Goal:** Answer the engineer's core anxiety: "Am I actually getting better? Am I ready yet?"

---

## Section 9.1 — Header

**Features:**
- `Good morning, [Name]` with current local time
- Today's recommended challenge (1 card, auto-selected based on weakest area + interview timeline)
- `Continue where you left off` — last in-progress challenge with progress bar

---

## Section 9.2 — Readiness Score

**Features:**
- Large circular progress ring: `78% SDE II Ready`
- Broken into 4 components with sub-scores:
  - Coding (DSA) — `85%`
  - Code Review (PR) — `72%`
  - Incident Response (War Room) — `61%`
  - System Design — `70%`
- Each sub-score is a clickable link → goes to Challenges filtered by that type
- Below the ring: `Your weakest area: Incident Response. We recommend 3 more War Room scenarios.`
- Readiness score updates after every completed challenge

---

## Section 9.3 — Activity Graph (GitHub-style)

**Features:**
- 52-week grid of days, each cell = one day
- Cell color intensity = number of challenges completed that day (5 levels: none → very active)
- Hover on cell: tooltip showing `April 3 · 3 challenges completed · +225 XP`
- Streak counter: `🔥 7-day streak` (shown only if streak is active)
- Streak break recovery: if streak broken by 1 day, `Freeze` option (1 freeze per month, Pro feature)
- Month labels above the grid

---

## Section 9.4 — XP & Level System

**Features:**
- Current XP bar: `4,820 / 6,000 XP → Level 12`
- Level name per tier (engineer-flavored):
  - Level 1–5: `Intern`
  - Level 6–10: `Junior`
  - Level 11–15: `Mid`
  - Level 16–20: `Senior`
  - Level 21+: `Staff`
- Recent XP log: `+75 XP — DSA: ENG-402 completed · 2 hours ago`

---

## Section 9.5 — CLI Sync Status

**Features:**
- Terminal-style widget:
  ```
  engprep CLI · v2.1.0
  ● Connected · Last sync: 2 minutes ago
  Machine: MacBook Pro (work)
  Pending pushes: 0
  ```
- `Reconnect` button if disconnected
- Link to CLI Setup page

---

## Section 9.6 — Upcoming Milestones

**Features:**
- 3 cards showing next unlockable content:
  - `Complete 2 more PR Reviews → Unlock Stripe company track`
  - `Reach Level 14 → Unlock Staff-level War Room scenarios`
  - `Complete your first System Design → Unlock Architecture Autopsy mode`
- These create forward momentum and give free users a taste of Pro content

---

## Section 9.7 — Weekly Summary Email Opt-In

**Features:**
- Small card: `Get your weekly progress report by email — what you completed, what to do next, and one free War Room scenario.`
- Toggle on/off
- Preview: `Last week: 8 challenges · +600 XP · Readiness: 74% → 78%`

---

---

# PAGE 10 — PROGRESS & READINESS REPORT
**URL:** `/progress`
**Goal:** Deep analytics on strengths, weaknesses, and trajectory.

---

## Section 10.1 — Overall Trajectory

**Features:**
- Line chart: Readiness score over time (30/60/90 day views)
- Overlaid events: `Started DSA track` · `Completed War Room set 1`
- Projection line (dotted): `At current pace, you'll be 90% ready by May 15`

---

## Section 10.2 — Breakdown by Type

**Features:**
- Radar chart: 5 axes — DSA · PR Review · War Room · System Design · Behavioral
- Filled area shows current scores, faint outer ring shows SDE II target benchmark
- Clicking an axis → filters the challenge library to that type

---

## Section 10.3 — Weakness Identifier

**Features:**
- Header: `Where to focus next`
- Algorithm: looks at last 20 submissions, identifies:
  - Topic with highest failure rate
  - Topic with least attempts (ignored, probably important)
  - Time taken vs benchmark (if consistently slow on trees & graphs)
- Output: `You're great at hash maps and arrays. You've avoided trees & graphs — 0 attempts. This appears in 40% of SDE II interviews. Start here →`

---

## Section 10.4 — Submission History

**Features:**
- Table: Date · Challenge · Type · Score · Time Taken · XP Earned
- Sortable columns
- Expandable rows: click to see submitted answer + feedback received
- Export as CSV (Pro)

---

---

# PAGE 11 — CLI SYNC & SETUP
**URL:** `/cli`
**Goal:** Get Pro users running `engprep` in their terminal within 5 minutes.

---

## Section 11.1 — Installation

**Features:**
- OS auto-detected (shown: `Detected: macOS`)
- OS tabs: macOS · Linux · Windows
- One-command install block per OS:
  - macOS/Linux: `npm install -g engprep`
  - Windows: `winget install engprep`
- Verification command: `engprep --version` → expected output shown
- Common errors section: expandable accordion
  - `Permission denied` → fix shown
  - `Command not found after install` → fix shown

---

## Section 11.2 — Authentication

**Features:**
- `engprep login` command shown
- On run: opens browser to `/cli/auth` → one-click OAuth → token returned to CLI
- Token stored locally at `~/.engprep/config.json`
- Status check: `engprep status` shows connection state

---

## Section 11.3 — CLI Command Reference

**Features:**
- Table: Command · Description · Example
  | Command | Description | Example |
  |---|---|---|
  | `engprep pull <id>` | Download challenge bundle | `engprep pull 402` |
  | `engprep push <id>` | Submit your solution | `engprep push 402` |
  | `engprep list` | See your challenge queue | `engprep list --type dsa` |
  | `engprep status` | Check connection + sync status | `engprep status` |
  | `engprep open <id>` | Open challenge in browser | `engprep open 402` |
  | `engprep next` | Pull next recommended challenge | `engprep next` |
- Copy button on every command

---

## Section 11.4 — Challenge Bundle Contents

**Features:**
- Explains what gets downloaded when you `engprep pull`:
  ```
  ./engprep/challenges/402/
  ├── README.md        # Jira ticket + problem description
  ├── starter.py       # Starter code with type hints
  ├── test_402.py      # pytest test file (run locally)
  ├── context.json     # Metadata (type, level, topics)
  └── assets/          # Any supporting files (logs, diagrams)
  ```
- For War Room incidents:
  ```
  ./engprep/incidents/war-room-42/
  ├── INCIDENT.md      # Full incident brief
  ├── logs/            # Fake log files to grep through
  ├── metrics.json     # Metrics data for the incident window
  └── architecture.svg # System diagram
  ```

---

---

# PAGE 12 — PRICING PAGE
**URL:** `/pricing`
**Goal:** Make $179/yr feel like the most obvious financial decision of the year.

---

## Section 12.1 — Value Framing (Above the Plans)

**Features:**
- Header: `$179 once. One job offer. $30,000+ salary increase. Do the math.`
- Sub: `Or don't pay at all. The free tier is genuinely useful.`

---

## Section 12.2 — Plan Comparison

**Features:**
- **Free — SDE Starter**
  - Unlimited DSA challenges (web mode)
  - PR Review challenges (5/month)
  - War Room: Level 1 only (3/month)
  - System Design: view-only demo
  - Community discussion access
  - CLI: install only (no push/pull)
  - `Start for free →`

- **Pro — $179/yr** (highlighted, emerald border glow)
  - Badge: `Most popular`
  - Everything in Free, plus:
  - CLI pull + push (practice in your own terminal)
  - Unlimited PR Review + War Room
  - System Design simulator (full)
  - Architecture Autopsy + Tech Debt Tribunal
  - Behavioral interview coach
  - All company tracks (Google, Meta, Amazon, Stripe, Airbnb)
  - AI debrief on War Room (chat to unpack your response)
  - Readiness score with trajectory
  - Community solutions + senior engineer model answers
  - Streak freeze (1/month)
  - CSV export
  - `Start Pro →`

- **Monthly — $29/mo**
  - Same as Pro
  - For sprint preppers: `"I have an interview in 3 weeks"`
  - Cancel anytime
  - `Start monthly →`

---

## Section 12.3 — Feature Comparison Table

**Features:**
- Full table: rows = features, columns = Free / Monthly / Annual
- Locked features show 🔒 icon (not ✗ — less aggressive)
- Hover on 🔒 shows tooltip: `This is a Pro feature. Upgrade to unlock.`

---

## Section 12.4 — Anti-LeetCode FAQ

**Features:**
- Accordion FAQ, 6 questions:
  1. `Why shouldn't I just use LeetCode?`
     → `Use LeetCode if you want to pass an OA filter. Use EngPrep if you want to become a better engineer and pass the full loop.`
  2. `Do FAANG companies still ask LeetCode questions?`
     → `Yes. We cover contextual DSA too. The difference: we teach you why the pattern matters, not just how to memorize it.`
  3. `What makes the War Room different from a case study?`
     → `Case studies are hypothetical and evaluated subjectively. Our War Rooms are based on real incidents, scored against an objective rubric.`
  4. `Is this for junior or senior engineers?`
     → `Both. SDE I track builds fundamentals. SDE III track prepares for staff-level judgment questions.`
  5. `What if I'm not targeting FAANG?`
     → `Startup interviews increasingly favor real-world formats. Our PR Review and War Room formats are exactly what Stripe, Linear, and Vercel use.`
  6. `Can I use this alongside LeetCode?`
     → `Absolutely. Many users do 30 min LeetCode + 30 min EngPrep daily. We're not competing — we're completing.`

---

## Section 12.5 — Reddit-Style Testimonials

**Features:**
- 4 testimonials in Reddit comment format (see Landing Page Section 1.7 for format)
- Specific to conversion objections:
  - One about price: `"$179 felt steep until I realized I'd paid $300 for one mock interview on HelloInterview"`
  - One about War Room: `"The incident scenarios are what sold me. Nothing else has this."`
  - One about CLI: `"The fact that I can do it in my own terminal changed everything"`
  - One about level: `"I'm a 7-year engineer. Finally something that doesn't insult my intelligence"`

---

---

# PAGE 13 — COMPANY-SPECIFIC TRACKS
**URL:** `/tracks/:company`
**Goal:** Give users a targeted sprint prep experience for a specific company's interview format.

---

## Section 13.1 — Track Overview Page

**Features:**
- Company logo + header: `Google Engineering Interview Track`
- What to expect at this company: interview rounds, format, typical time, known quirks
- Curated challenge list filtered to this company's known patterns
  - Each challenge tagged `[Google - Known Format]` or `[Google - Community Reported]`
- Estimated completion time for full track: `~40 hours of focused prep`
- `Start Track →` button

**Available tracks (launch):** Google · Meta · Amazon · Stripe · Airbnb
**Planned:** Netflix · Apple · Notion · Linear · Vercel

---

## Section 13.2 — Company-Specific War Room

**Features:**
- Each company track includes 2–3 War Room scenarios flavored for that company
- Google: `A Bigtable replication lag is causing search staleness for 3% of queries`
- Stripe: `A double-charge bug is hitting 0.1% of payment intents — how do you triage?`
- Amazon: `An S3 presigned URL is expiring too fast and blocking file uploads`
- These are not generic — they reference the real tech stack of the company

---

---

# PAGE 14 — BEHAVIORAL INTERVIEW COACH
**URL:** `/behavioral`
**Goal:** Help engineers practice the 30–40% of the interview they always under-prepare for.

---

## Section 14.1 — Question Bank

**Features:**
- 60+ behavioral questions grouped by theme:
  - Conflict & disagreement · Leadership · Failure & learning · Ambiguity · Impact · Cross-functional
- Each question tagged with which companies ask it most
- Example: `Tell me about a time you disagreed with your tech lead. [Meta, Google - Very Common]`

---

## Section 14.2 — STAR Response Builder

**Features:**
- User selects a question
- Structured input form:
  - `Situation` field (2–3 sentences)
  - `Task` field (what were you responsible for?)
  - `Action` field (what did YOU specifically do?)
  - `Result` field (measurable outcome)
- Word count guidance per section
- `Preview full answer` — assembles all 4 fields into a flowing paragraph

---

## Section 14.3 — AI Feedback

**Features:**
- After submitting a STAR response: AI evaluates against rubric:
  - Is the impact quantified? (`Helped the team` vs `Reduced deploy time by 40%`)
  - Is the action specific to the user, not the team?
  - Is it concise enough for a 2-minute verbal delivery?
- Feedback shown inline with suggested rewrites per section
- `Rewrite with suggestions applied` button — generates an improved version
- User can accept/reject each suggestion

---

## Section 14.4 — Story Bank

**Features:**
- Users build a personal "story bank" — 5–10 polished STAR responses they can adapt
- Each story tagged by which questions it can answer: `[Can answer: disagreement, leadership, ambiguity]`
- CLI: `engprep behavioral list` shows their story bank in terminal

---

---

# PAGE 15 — ADMIN / CONTENT MANAGEMENT (Internal)
**URL:** `/admin` (internal only, not linked publicly)

---

## Section 15.1 — Challenge Editor

**Features:**
- Rich text editor for Jira ticket body
- Code block editor for starter code + test cases
- Tag manager: type, level, company, topics
- Preview mode: see exactly how it renders in each workspace
- Publish / Draft / Archive status
- Difficulty rating (manually set, then updated by crowd-sourced data)

---

## Section 15.2 — Analytics Dashboard

**Features:**
- Total signups / MAU / DAU
- Conversion rate: free → paid
- Most attempted challenges (by count and completion rate)
- Drop-off points: which challenge types have lowest completion rates
- Average session length
- CLI usage: what % of Pro users actually use CLI

---

## Section 15.3 — User Management

**Features:**
- Search users by email
- View individual user's progress, XP, submission history
- Issue manual XP / badge awards
- Manage refunds / plan changes
- Ban / suspend accounts

---

---

# PAGE 16 — GLOBAL COMPONENTS & SYSTEMS

---

## 16.1 — Navigation (Authenticated)

**Features:**
- Left sidebar (desktop) or bottom tab bar (mobile):
  - Dashboard · Challenges · War Room · System Design · Behavioral · Progress · CLI · Settings
- Persistent XP counter in sidebar: `4,820 XP · Level 12`
- Notification bell: `3 new` (new challenges in your company track, streak reminder, milestone reached)
- Avatar + dropdown: Profile · Settings · Billing · Log Out

---

## 16.2 — Notification System

**Types of notifications:**
- `🔥 Your streak is at risk — complete a challenge before midnight`
- `✅ New Google track challenges added (8 new)`
- `🎯 You're 90% of the way to Level 13`
- `📬 Your weekly summary is ready`
- `💡 Based on your weak areas, we recommend: Architecture Autopsy #14`

---

## 16.3 — XP & Reward System

**XP values:**
- DSA challenge (pass first try): +75 XP
- DSA challenge (pass with hints): +50 XP
- PR Review (correct bug): +100 XP
- War Room (correct diagnosis + first action): +150 XP
- System Design (submitted): +125 XP
- Behavioral (submitted STAR response): +50 XP
- Daily login: +10 XP
- 7-day streak bonus: +100 XP

---

## 16.4 — Settings Page (`/settings`)

**Features:**
- **Profile:** Name · Avatar (upload or initials) · GitHub username · LinkedIn URL
- **Preferences:** Email notifications toggle · Weekly summary toggle · Streak reminders
- **Track:** Change SDE level · Change target company · Change interview timeline
- **Display:** Dark mode / Light mode / System
- **CLI:** View/revoke CLI token · Download CLI
- **Billing:** Current plan · Upgrade/downgrade · Invoice history · Cancel subscription
- **Account:** Change email · Change password · Delete account (with confirmation modal)

---

## 16.5 — Mobile Responsiveness Rules

**Workspace pages (DSA, PR Review, War Room, System Design):**
- On mobile: full-screen single panel, tab navigation between Context / Code / Output
- Code editor on mobile uses Monaco's touch-optimized mode
- PR Review on mobile: diff view scrollable horizontally, comments tap-to-open

**System Design Simulator:**
- Mobile: view-only mode (cannot drag-and-drop efficiently on touch)
- Banner shown: `For the best System Design experience, use a desktop browser or the CLI.`

---

## 16.6 — Error States & Empty States

**Every page has defined states for:**
- `Loading` — skeleton screens (not spinners) — content shape is visible while loading
- `Empty` — e.g., `No challenges match these filters. Try clearing a filter →`
- `Error` — e.g., `Something went wrong. Your progress was saved. Refresh and try again.`
- `Offline` — banner: `You're offline. Your work is saved locally and will sync when you reconnect.`
- `Rate limited` — `You've submitted 3 times in the last 5 minutes. Wait 2 minutes before trying again.`

---

*End of EngPrep Product Specification*
*Version 1.0 — April 2026*
*Total pages: 16 · Total features: 180+*