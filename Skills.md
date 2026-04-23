Author perspective: Karri Saarinen, Co-founder & Principal Designer, Linear
Target product: https://codepath-web.pages.dev (EngPrep — engineering interview prep platform)
Source material: Linear's canonical design essays + The "Desktop Illusion" Stress Test
Purpose of this skill: Encode every principle, process, craft decision, and tactile behavior from Linear's redesign so any AI can apply it faithfully to EngPrep's interface — with no guesswork, no generic defaults, no assumptions.
PART 0 — UNDERSTAND WHAT ENGPREP ACTUALLY IS
Before touching any design, internalize the product:
Name: EngPrep (brand URL: codepath-web.pages.dev)
Tagline: "Stop reversing binary trees. Start engineering."
Core thesis: LeetCode trains you for toy problems. Real interviews and real jobs require debugging incidents, reviewing PRs, designing systems under pressure. EngPrep simulates that.
Four practice modes: War Room (live incident response), Contextual DSA (real-world framed), PR Review, System Design
Gamification layer: Mastery Codex — creatures you collect by solving challenge patterns (Cache Hydra, N+1 Phantom, Deadlock Specter, etc.)
Social/live layer: Weekly Raid — 847 engineers simultaneously responding to a global P0 incident
Career tracks: Junior (0–2yr), Mid (2–5yr), Senior (5yr+)
Pricing: Free / Pro (
399
/
y
r
)
/
L
e
g
e
n
d
a
r
y
(
399/yr)/Legendary(
799/yr)
Community signal: 4,200+ engineers from Google, Stripe, Amazon, Vercel, Cloudflare
Tone of existing product: Dark terminal aesthetic. Code-first. XP. Creatures. Competitive. "Engineering is competitive. Own it."
The product is correct in concept. The design needs to feel more human, more earned, more premium — transforming it from a "Leetcode competitor" into a hyper-professional desktop terminal for serious engineers.
PART 1 — THE KARRI SAARINEN DESIGN PHILOSOPHY (Extracted from all 3 essays)
These are not abstract values. These are operational principles that must shape every design decision.
1.1 Design Debt is Real and Must be Paid in Large Sweeps
Incremental design (fixing one module at a time) makes the product more disjointed, not less. The hero terminal, creature cards, and pricing sections cannot be patched independently. They must be reset from a shared visual foundation. The redesign must be holistic.
1.2 Start with a "Concept Car" — Not a Spec
Present design changes as alternate realities, not single prescriptions. Explore 3–5 radical directions before committing to one. The concept that "feels like the product in 3 years" is the right concept.
1.3 Focus the Scope — Don't Redesign Everything at Once
To manage risk, focus on the "inverted L-shape" constraint — the sidebar, the top chrome, and the section headers. If these feel right, the rest of the site inherits their authority. Start there.
1.4 Timeless Over Trendy — Reduce Chrome, Increase Signal
Reduce color noise. Use brand accent (terminal green) sparingly. Reserve it for genuine signals: CTAs, live indicators, critical stats. Switch to LCH color space to ensure colors share the same perceptual lightness.
1.5 Hierarchy Over Decoration
A proper hierarchy draws the user down. For EngPrep's landing page: hero → proof (logos) → problem framing → solution modes → credibility (testimonials) → conversion (pricing).
1.6 The "Workbench" Mental Model
The interface should be a structured workbench, not an open chat box. The War Room should feel like you sat down at a real terminal in a real NOC room — ambient stress, clear information hierarchy, zero distracting decoration.
1.7 Feel is Invisible — Alignment Lives Below Conscious Perception
Inconsistent badge text, icon baselines, button padding, and card border-radii create invisible friction. A user won't say "the padding is wrong," they'll say "something feels off." Systematic, rigid alignment is non-negotiable.
PART 2 — THE DESIGN PROCESS (Step-by-Step Method)
Step 1 — Concept Exploration (Solo, Unconstrained)
Generate 3 annotated mockups of just the hero + navbar. (e.g., Precision/Editorial, Dark Premium, Warm/Human).
Do not write a single line of code. Present these as annotated screenshots explaining the why.
Pick the direction the team says "yes" to, then expand.
Step 2 — Stress Tests (Before Implementation)
Environment: Test the nav collapse on mobile first.
Appearance (Grayscale): Sketch the hero in grayscale. If hierarchy reads clearly without color, the structural design is correct.
Hierarchy: Run every state (War Room, Codex, Raid, Pricing) through the new visual language to ensure it holds up.
Step 3 — Component Behavior Documentation (The Spec)
(See Part 3 for the specific component specs).
Step 4 — Parallel Design + Engineering Pipeline
Build in this order: 1. Token layer (colors/type) → 2. Navbar + Hero → 3. Section chrome → 4. Card components → 5. Section implementations.
Step 5 — Internal Toggle + Dogfooding
Build a ?v=2 query param or /preview route. Never hard-cut over. Live-test internally. If a user is confused, the redesign failed. "I prefer the old one" is not confusion.
PART 3 — VISUAL & SPATIAL SPEC (The EngPrep Workbench)
3.1 LCH Color System (Perceptually Uniform)
Use CSS oklch() so that no single status "screams" louder than another. Keep L (lightness) values consistent across severity colors.
code
CSS
/* EngPrep accent — terminal green in oklch */
--accent: oklch(0.72 0.18 142);          
--accent-dim: oklch(0.72 0.18 142 / 0.12);

/* Error / severity — perfectly matched perceptual brightness to the green */
--severity-critical: oklch(0.62 0.22 27); /* red */
--severity-warning: oklch(0.78 0.16 75);  /* amber */
--severity-info: oklch(0.62 0.18 240);    /* blue */
(Fallback base: #0A0A0C background, #111114 surfaces, #F0F0F3 primary text, #8A8A96 secondary text).
3.2 Typography & Split Emphasis
code
Code
Hero headline:  Geist, Berkeley Mono, or Syne (56–72px, weight 700, tracking -0.02em)
Body text:      Inter or Geist Sans (16px, weight 400, line-height 1.65)
Monospace/Code: Geist Mono or JetBrains Mono (13px)
Section Eyebrow: 11px, weight 500, tracking 0.08em, UPPERCASE, text-muted
The Split-Emphasis Rule: Set contrasting copy with visual weight, not just words. E.g. "Stop reversing binary trees." (gray, lighter weight) "Start engineering." (full brightness, heavier weight).
3.3 The 8pt Spacing & Elevation System
Base grid: 8px.
Section padding: 96px (never 100px). Card internal padding: 24px. Card gap: 16px.
Max content width: 1080px (forces professional density).
Elevations:
Level 1: bg-surface-1 + border rgba(255,255,255,0.06)
Hover: bg-surface-2 + border rgba(255,255,255,0.10) + shadow 0 4px 16px rgba(0,0,0,0.5)
3.4 The 3-Panel Workbench Layout (Crucial for App Views)
When building War Room or Dashboards, strictly enforce these boundaries:
code
Code
┌─────────────────────────────────────────────────────┐
│  TITLEBAR  (36px) — traffic lights · tabs · actions │
├──────────┬──────────────────────────┬───────────────┤
│          │  VIEW HEADER (40px)      │               │
│ SIDEBAR  │──────────────────────────│  DETAIL PANEL │
│ (220px)  │  FILTER ROW  (36px)      │   (400px)     │
│          │──────────────────────────│               │
│          │  CONTENT LIST (flex: 1)  │               │
│          │  (scrollable)            │               │
└──────────┴──────────────────────────┴───────────────┘
Sidebar: 220px fixed. Never flex. Collapses on small screens.
List: flex:1. Fixed row heights.
Detail Panel: 400px fixed. Slides in on row selection.
3.5 The Issue Row & Status Circle Language
Every interactive row (Incident log, PR review list) uses strict fixed columns:
[Priority 28px] [Status 28px][ID 52px] [Title flex:1] [Labels auto] [Assignee 20px][Date 80px]
Status Circles (SVG Primitives — no emoji):
Todo: Solid 1.5px border, no fill.
In Progress: Solid border + inner dot at 50% diameter (accent color).
Done: Fully filled (status-done) + white checkmark stroke.
3.6 The 4-State Interaction Model
A component with 2 states feels dead. Every button, row, and card must have 4:
Default: bg-surface-1, text-secondary, border-subtle
Hover: bg-surface-2, text-primary, border-default (Transition: 120ms)
Selected: bg-surface-3, text-primary, border-default
Focus: inherit selected + outline: 2px solid var(--accent); outline-offset: 2px;
PART 4 — THE DESKTOP ILLUSION (The Missing 10%)
To make EngPrep feel exactly like Linear, it cannot just look like it. It must behave like a native desktop app. These 4 mechanics are mandatory for the application side of EngPrep.
4.1 Command-First, Mouse-Second (The Cmd+K Engine)
The UI must be driven by keyboard agency.
Rule: Implement a universal command palette.
Behavior: Cmd+K opens a 600px wide modal with backdrop-blur(12px). The user types "PR" and hits Enter to start a PR Review, rather than clicking through navigation.
4.2 Optimistic UI (Zero-Latency)
Native apps don't have loading spinners for micro-interactions.
Rule: Ban loading spinners for standard state toggles.
Behavior: When a user clicks "Solve" or claims a P0 incident, instantly update the UI to the "In Progress" or "Done" state (0ms delay). Sync to the server in the background. If the request fails, revert the state and show a toast error.
4.3 Custom Desktop-Class Context Menus
Web apps rely on three-dot (⋮) menus. Desktop apps rely on right-click.
Rule: Disable the browser default right-click on all interactive rows and cards.
Behavior: e.preventDefault(). Render a floating surface (bg-surface-2, shadow-hover) with power actions: "Assign to me", "Copy ID", "Mark as P0". This keeps the main UI clean of icon clutter.
4.4 Structural Empty States
A workbench is useless if it doesn't tell you how to start.
Rule: No blank screens or generic "No active incidents" text.
Behavior: Empty states must display a muted, dashed-outline wireframe of what would be there. Include a keyboard shortcut hint: Press [C] to trigger a test incident. Treat empty states as structural invitations.
PART 5 — SECTION-BY-SECTION REDESIGN DIRECTIVES (Landing Page)
Navbar: Collapse "847 live" into a subtle pulsing green dot pill. Transition to frosted glass (backdrop-blur(12px) + bg-opacity(0.85)) on scroll.
Hero: Execute split-emphasis typography. Shrink the terminal block to be proof, not the main focus. Copy must sound like a senior engineer, not marketing.
Problem Framing: Stop attacking LeetCode with red ✗ marks. Use honest phrasing: "LeetCode is fine. But your job looks like this." Use low contrast for the old way, bright contrast for EngPrep.
Mastery Codex: Drop the emojis. Use custom SVGs/silhouettes. Add an ambient glow based on rarity color (LCH matched). Hover scales card 1.02 and highlights border.
Weekly Raid: Treat as a live broadcast. Ambient red-to-base gradient background. Large, dashboard-scale numbers (48px). Auto-scrolling terminal logs.
Leaderboard: Replace initial-based avatars with deterministic gradient hashes. Add a "You" placeholder at rank #247 to ground the user.
Career Tracks: Frame as training regimens, not SaaS tiers. Replace generic ✓ lists with plain-language scenarios the track unlocks.
Pricing: Remove "Most Popular" fake-urgency badges. Add monthly equivalents beneath yearly totals ($399/yr = $33/mo). Free tier gets no accent border; Pro gets subtle accent border.
PART 6 — THE HUMAN-LIKE APPROACH (The Meta-Skill)
Speak like a Senior Engineer: If it sounds like a Growth team wrote it, delete it. "Built around incidents, PRs, and real trade-offs" > "The only platform built around how software actually works."
Show the work, not the wrapper: An actual incident log terminal block is 10x more persuasive than a bullet point saying "Real incident logs."
Acknowledge complexity: "Both matter. Only one of them gets you hired." Honesty builds trust.
Give user agency (Interactive Marketing): Let the user type an answer into the War Room preview on the landing page and get graded instantly. Interaction beats broadcast.
PART 7 — THE STRESS-TEST IMPLEMENTATION CHECKLIST
Run this before shipping any section or feature:

Grayscale test: Does the hierarchy hold up with zero color?

8pt grid test: Are all spacing/padding values strictly multiples of 8?

Color entropy test: Are there ≤ 4 distinct colors in this view?

Human voice test: Could a staff engineer at Stripe have written this copy in a Slack message?

Show-the-product test: Is actual UI code/logs visible, or just marketing fluff?

Dark/light test: Will this layout survive a light mode flip?

Mobile test: Do terminal blocks horizontally scroll smoothly at 375px?

Latency test: Did we remove all loading spinners for micro-actions? (Optimistic UI)

Keyboard test: Can a user navigate this core loop using only Cmd+K and arrows?

Empty State test: If the database returns 0 items, does the screen invite the user structurally instead of dying?
SUMMARY: THE 21 COMMANDMENTS OF THIS SKILL
Philosophy
Reset holistically. Design the token layer first.
Start with grayscale. If it fails without color, color won't save it.
Speak peer-to-peer (Senior Engineer voice).
Show the product, not the description.
Reserve accent color strictly for live, primary CTA, and success.
Make hierarchy structural. Size and weight first, color second.
Align perfectly on the baseline/8pt grid.
Animate only for state changes. No decorative motion.
Acknowledge complexity. Honest copy over marketing.
Give the user agency. Interaction > broadcast.
Component Craft
11. Explore 3 directions before writing 1 line of code.
12. Build the 3-panel workbench (220px / flex-1 / 400px).
13. Use the SVG Circle Language for status (Todo, In-Progress, Done).
14. Build the titlebar tab strip for spatial navigation.
15. Specify every list row column strictly (Priority → Status → ID → Title).
16. Give every interactive element 4 exact states (Default, Hover, Selected, Focus).
17. Use oklch() to perceptually match all severity colors to the base accent.
The Desktop Illusion (The Missing 10%)
18. Build the Command Palette: Command-first, mouse-second (Cmd+K).
19. Optimistic UI: Never show loading spinners for micro-actions (0ms latency).
20. Right-Click Power: Build custom, desktop-class context menus.
21. Structural Empty States: Draw the wireframe to guide the user; never leave a screen blank.