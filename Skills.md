---
name: engprep-design-system
description: >
  Use this skill when building ANY page, component, or UI for the EngPrep
  application. It defines the complete visual language, interaction patterns,
  spacing system, typography rules, animation principles, and component
  library for the product. Triggers on any request to build/style/design
  a page or component in the EngPrep codebase. Do NOT use generic shadcn/ui
  defaults or Tailwind utility soup — implement this design language precisely.
---

# EngPrep Design System
### Distilled from Modal, Vercel/Geist, and original UX research.
### Not a copy of either. A third thing entirely.

---

## 1. PHILOSOPHY — READ THIS FIRST

EngPrep must feel like it was built by engineers who have taste, not by a design agency
that works for engineers. The difference:

- **Agency for engineers:** grid lines everywhere, neon green on black, terminal aesthetic
  pushed to parody. Looks like a hackathon project.
- **Engineers with taste:** restraint. Every element earns its place. The dark background
  is not a theme, it's a statement. The code blocks feel like VS Code because VS Code
  is what the user lives in. The motion is surgical — one well-timed animation beats
  ten decorative ones.

**The three words that govern every decision: Precise. Terse. Alive.**

- **Precise:** pixel-perfect spacing, deliberate type hierarchy, nothing approximate.
- **Terse:** no decorative elements that don't earn their place. If removing it doesn't
  hurt the layout or communication, remove it.
- **Alive:** the UI responds to the user. Hover states feel physical. Data updates feel
  real-time. The product has a pulse.

---

## 2. COLOR SYSTEM

### Base Palette (CSS custom properties — define in :root)

```css
:root {
  /* Backgrounds — layered from deepest to lightest */
  --bg-base:      #0a0a0a;   /* page background — near-true black, not pure */
  --bg-surface:   #111111;   /* cards, panels, modals */
  --bg-raised:    #1a1a1a;   /* hover states, selected items, inset areas */
  --bg-overlay:   #222222;   /* dropdowns, tooltips, popovers */

  /* Borders — always low-opacity, never heavy lines */
  --border-subtle:  rgba(255,255,255,0.06);  /* default card borders */
  --border-default: rgba(255,255,255,0.10);  /* hover state borders */
  --border-strong:  rgba(255,255,255,0.18);  /* focused inputs, active states */

  /* Text — three tiers only */
  --text-primary:   #f0f0f0;   /* headlines, active labels, key data */
  --text-secondary: #888888;   /* body copy, descriptions, timestamps */
  --text-tertiary:  #555555;   /* placeholders, disabled, de-emphasized */
  --text-inverse:   #0a0a0a;   /* text on light/accent backgrounds */

  /* Brand accent — EngPrep green */
  --accent:         #22c55e;   /* primary action, success, active */
  --accent-dim:     #16a34a;   /* hover on accent elements */
  --accent-ghost:   rgba(34,197,94,0.10);  /* subtle tint backgrounds */
  --accent-border:  rgba(34,197,94,0.25);  /* accent-adjacent borders */

  /* Semantic colors */
  --color-error:    #ef4444;
  --color-warning:  #f59e0b;
  --color-info:     #3b82f6;
  --color-success:  #22c55e;  /* same as accent */

  /* Semantic backgrounds (very subtle tints) */
  --bg-error:   rgba(239,68,68,0.08);
  --bg-warning: rgba(245,158,11,0.08);
  --bg-info:    rgba(59,130,246,0.08);
  --bg-success: rgba(34,197,94,0.08);

  /* Semantic borders */
  --border-error:   rgba(239,68,68,0.25);
  --border-warning: rgba(245,158,11,0.25);
  --border-info:    rgba(59,130,246,0.25);
  --border-success: rgba(34,197,94,0.25);

  /* Challenge type colors — used for badges/tags */
  --type-dsa:     #3b82f6;   /* blue */
  --type-pr:      #f59e0b;   /* amber */
  --type-war:     #ef4444;   /* red */
  --type-design:  #8b5cf6;   /* purple */
  --type-behavioral: #14b8a6; /* teal */
}
```

### Color Rules

1. **Never use pure #000000 or #ffffff** — they feel digital and harsh.
   Use --bg-base and --text-primary instead.
2. **The accent (green) appears in maximum 2 places per screen** — primary CTA and
   one status indicator. More than 2 = diluted, less meaningful.
3. **Background layers must have meaningful contrast**:
   base → surface = +10 lightness. surface → raised = +10 lightness.
   This creates depth without heavy borders.
4. **Borders are always rgba, never solid colors** — they feel lighter and more refined.
5. **Type colors are a strict 3-tier system** — never create a 4th.

---

## 3. TYPOGRAPHY

### Font Stack

```css
:root {
  --font-sans: 'Geist', 'Inter', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
}
```

**Why Geist:** Modal and Vercel both use it. It's the clearest signal of "developer
tool that cares about craft." It's free, well-hinted, and has an excellent mono variant.
Import from Google Fonts or self-host.

### Type Scale

```css
/* Scale — use these exact sizes, no in-between values */
--text-xs:   11px;   /* labels, badges, timestamps, legal */
--text-sm:   13px;   /* secondary body, descriptions, hints */
--text-base: 15px;   /* primary body copy */
--text-lg:   17px;   /* lead text, card titles */
--text-xl:   20px;   /* section subheadings */
--text-2xl:  26px;   /* section headings */
--text-3xl:  34px;   /* page headings */
--text-4xl:  46px;   /* hero headlines */
--text-5xl:  62px;   /* landing page hero only */

/* Line heights */
--leading-tight:  1.2;   /* headings */
--leading-normal: 1.5;   /* body */
--leading-loose:  1.7;   /* long-form descriptions */

/* Letter spacing */
--tracking-tight: -0.03em;  /* large headings only */
--tracking-normal: 0em;
--tracking-wide:  0.06em;   /* ALL CAPS labels, tags */
--tracking-wider: 0.1em;    /* STATUS, INCIDENT, LEVEL labels */
```

### Typography Tokens — Apply these, not raw sizes

```css
.t-hero {        /* Landing hero only */
  font-size: var(--text-5xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.t-heading {     /* Page headings */
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.t-subheading {  /* Section headings */
  font-size: var(--text-2xl);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

.t-section-label {  /* "STEP 01 / FEATURES / METRICS" */
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.t-body {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.t-mono {        /* All code, CLI commands, IDs */
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
}
```

### Typography Rules

1. **Headlines never wrap to more than 2 lines** — tighten copy before breaking layout.
2. **Body copy color is always --text-secondary**, never --text-primary.
   Primary is for data, labels, and headings only.
3. **ALL CAPS is reserved for section labels and status badges** — never use for body,
   headings, or CTA buttons.
4. **Monospace for anything the user will type or run** — ticket IDs, CLI commands,
   code, timestamps, metrics.
5. **Font-weight 400/500/600 only** — no 300 (too thin on dark), no 700 (too heavy).

---

## 4. SPACING SYSTEM

### Scale (4px base unit)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Spacing Principles

- **Internal padding (within a component):** --space-4 to --space-6
- **Between related components:** --space-3 to --space-4
- **Between sections:** --space-16 to --space-24
- **Card padding:** 20px (compact) or 24px (default) or 32px (spacious)
- **Page max-width:** 1120px. Centered. Side padding 24px mobile, 40px desktop.
- **Column grid:** 12 columns, 24px gutter

**The Modal principle:** sections breathe. There is more whitespace than you think you
need. When in doubt, add 20% more space between sections. Dense = amateur.

---

## 5. BORDER RADIUS

```css
--radius-sm:   4px;   /* tags, badges, small code blocks */
--radius-md:   8px;   /* buttons, inputs, small cards */
--radius-lg:   12px;  /* cards, panels, modals */
--radius-xl:   16px;  /* large feature cards */
--radius-full: 9999px; /* pills, avatars, progress indicators */
```

**Rule:** border-radius should be consistent within a component family. A card at 12px
radius should have internal elements at 8px radius. Never mix 4px and 16px on siblings.

---

## 6. COMPONENT LIBRARY

### 6.1 — Buttons

```html
<!-- Primary — one per screen section maximum -->
<button class="btn-primary">Start Free</button>

<!-- Ghost — secondary actions, nav CTAs -->
<button class="btn-ghost">Read the docs</button>

<!-- Danger — destructive actions -->
<button class="btn-danger">Delete account</button>

<!-- Icon button — toolbar actions -->
<button class="btn-icon" aria-label="Copy command">
  <svg .../>
</button>
```

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 20px;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 150ms ease, transform 100ms ease, box-shadow 150ms ease;
  /* The signature: a very subtle inner glow on the button */
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn-primary:hover {
  background: var(--accent-dim);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 9px 19px;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
}
.btn-ghost:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
  background: var(--bg-raised);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}
.btn-icon:hover {
  background: var(--bg-raised);
  border-color: var(--border-default);
}
```

**Button rules:**
- Maximum 2 buttons per row (primary + ghost, never 2 primaries)
- CTA text is action verbs: "Start Free", "Pull Challenge", "Submit" — never "Click Here"
- Loading state: replace text with a 16px spinner, keep same dimensions, disable pointer
- Never use border-radius > radius-md on buttons — it reads as "startup landing page"

---

### 6.2 — Cards

**Three card variants — use each deliberately:**

```css
/* Default card — most panels, challenge items, feature sections */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color 200ms ease;
}
.card:hover {
  border-color: var(--border-default);
}

/* Interactive card — clickable items (challenge list, etc.) */
.card-interactive {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  cursor: pointer;
  transition: border-color 200ms ease, background 200ms ease, transform 150ms ease;
  position: relative;
  overflow: hidden;
}
.card-interactive:hover {
  border-color: var(--border-default);
  background: var(--bg-raised);
  transform: translateY(-1px);
}
/* The hover reveal — CLI command appears on card hover */
.card-interactive .cli-reveal {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 10px 16px;
  background: linear-gradient(to top, var(--bg-raised), transparent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--accent);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 200ms ease, transform 200ms ease;
}
.card-interactive:hover .cli-reveal {
  opacity: 1;
  transform: translateY(0);
}

/* Feature card — landing page feature showcase */
.card-feature {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  /* Signature subtle gradient on the top edge */
  background-image: linear-gradient(
    to bottom,
    rgba(255,255,255,0.03) 0%,
    transparent 60px
  );
}
```

---

### 6.3 — The CLI Block

**The signature component of EngPrep. Every instance should feel satisfying.**

```html
<div class="cli-block">
  <div class="cli-block__header">
    <span class="cli-block__dot cli-block__dot--red"></span>
    <span class="cli-block__dot cli-block__dot--yellow"></span>
    <span class="cli-block__dot cli-block__dot--green"></span>
    <span class="cli-block__title">Terminal</span>
  </div>
  <div class="cli-block__body">
    <div class="cli-block__line">
      <span class="cli-block__prompt">$</span>
      <span class="cli-block__command" id="cmd-1">npm install -g engprep</span>
    </div>
    <div class="cli-block__line cli-block__line--output">
      <span class="cli-block__output">✓ engprep installed (v2.1.0)</span>
    </div>
    <div class="cli-block__line">
      <span class="cli-block__prompt">$</span>
      <span class="cli-block__command">engprep pull war-room-42</span>
    </div>
    <div class="cli-block__line cli-block__line--output">
      <span class="cli-block__output">✓ Incident bundle downloaded</span>
    </div>
    <div class="cli-block__line">
      <span class="cli-block__prompt">$</span>
      <span class="cli-block__cursor"></span>
    </div>
  </div>
  <button class="cli-block__copy" onclick="copyCommand()" aria-label="Copy install command">
    <svg .../>
    <span>Copy</span>
  </button>
</div>
```

```css
.cli-block {
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  font-family: var(--font-mono);
}
.cli-block__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 14px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}
.cli-block__dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.cli-block__dot--red    { background: #ef4444; opacity: 0.7; }
.cli-block__dot--yellow { background: #f59e0b; opacity: 0.7; }
.cli-block__dot--green  { background: #22c55e; opacity: 0.7; }
.cli-block__title {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
.cli-block__body {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cli-block__line {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}
.cli-block__prompt {
  color: var(--accent);
  font-size: var(--text-sm);
  user-select: none;
}
.cli-block__command {
  color: var(--text-primary);
  font-size: var(--text-sm);
}
.cli-block__output {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding-left: 16px; /* aligns with command text */
}
/* The blinking cursor */
.cli-block__cursor {
  display: inline-block;
  width: 8px; height: 15px;
  background: var(--accent);
  opacity: 0.8;
  animation: cursor-blink 1.2s ease-in-out infinite;
}
@keyframes cursor-blink {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0; }
}
.cli-block__copy {
  position: absolute;
  top: 10px; right: 10px;  /* sits inside the header row */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.cli-block__copy:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}
/* After copy: show "Copied ✓" state */
.cli-block__copy.copied {
  color: var(--accent);
  border-color: var(--accent-border);
}
```

```js
function copyCommand() {
  const cmd = document.getElementById('cmd-1').textContent;
  navigator.clipboard.writeText(cmd).then(() => {
    const btn = document.querySelector('.cli-block__copy');
    const span = btn.querySelector('span');
    const original = span.textContent;
    btn.classList.add('copied');
    span.textContent = 'Copied ✓';
    setTimeout(() => {
      btn.classList.remove('copied');
      span.textContent = original;
    }, 2000);
  });
}
```

---

### 6.4 — Badges / Type Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  white-space: nowrap;
}

/* Challenge type badges */
.badge-dsa {
  background: rgba(59,130,246,0.12);
  color: #60a5fa;
  border: 1px solid rgba(59,130,246,0.20);
}
.badge-pr {
  background: rgba(245,158,11,0.12);
  color: #fbbf24;
  border: 1px solid rgba(245,158,11,0.20);
}
.badge-war {
  background: rgba(239,68,68,0.12);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.20);
}
.badge-design {
  background: rgba(139,92,246,0.12);
  color: #a78bfa;
  border: 1px solid rgba(139,92,246,0.20);
}
.badge-behavioral {
  background: rgba(20,184,166,0.12);
  color: #2dd4bf;
  border: 1px solid rgba(20,184,166,0.20);
}

/* Status badges */
.badge-new     { background: var(--bg-surface); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
.badge-active  { background: var(--accent-ghost); color: var(--accent); border: 1px solid var(--accent-border); }
.badge-done    { background: rgba(34,197,94,0.08); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }

/* Level dots (SDE track indicators) */
.level-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border-default);
}
.level-dot.active { background: var(--accent); }
```

---

### 6.5 — Inputs

```css
.input {
  width: 100%;
  padding: 9px 12px;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  -webkit-appearance: none;
}
.input::placeholder { color: var(--text-tertiary); }
.input:hover { border-color: var(--border-default); }
.input:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
}
/* Error state */
.input.error {
  border-color: var(--border-error);
  box-shadow: 0 0 0 3px rgba(239,68,68,0.06);
}
.input-error-msg {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: 5px;
}
```

---

### 6.6 — The Diff / Code Review Block

**Used in PR Review workspace. Must look exactly like GitHub PR diff — dark version.**

```css
.diff-block {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}
.diff-header {
  padding: 8px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.diff-line {
  display: flex;
  align-items: stretch;
  min-height: 22px;
}
.diff-line:hover { background: rgba(255,255,255,0.02); }
.diff-line.clickable { cursor: pointer; }
.diff-line.clickable:hover { background: rgba(59,130,246,0.06); }

.diff-num {
  min-width: 44px;
  padding: 0 8px;
  text-align: right;
  font-size: 11px;
  color: var(--text-tertiary);
  border-right: 1px solid var(--border-subtle);
  user-select: none;
  flex-shrink: 0;
}
.diff-sign {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
}
.diff-code {
  padding: 0 var(--space-3);
  flex: 1;
  white-space: pre;
  overflow-x: auto;
}

/* Removed line */
.diff-line.removed .diff-code  { background: rgba(239,68,68,0.08); }
.diff-line.removed .diff-sign  { color: #f87171; }
.diff-line.removed .diff-num   { background: rgba(239,68,68,0.05); }

/* Added line */
.diff-line.added .diff-code    { background: rgba(34,197,94,0.08); }
.diff-line.added .diff-sign    { color: #4ade80; }
.diff-line.added .diff-num     { background: rgba(34,197,94,0.05); }

/* Comment thread below a line */
.diff-comment {
  border-left: 3px solid var(--color-info);
  background: var(--bg-raised);
  padding: var(--space-3) var(--space-4);
  margin: 4px 0;
}
.diff-comment-input {
  width: 100%;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--text-primary);
  resize: vertical;
  min-height: 60px;
  outline: none;
}
.diff-comment-input:focus { border-color: var(--border-strong); }
```

---

### 6.7 — Metrics / Dashboard Cards

**Used in War Room, Dashboard, Progress page. Should feel like a live monitoring tool.**

```css
.metric-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}
.metric-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.metric-value {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}
.metric-sub {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: 4px;
}
/* Status variants */
.metric-card.status-normal  { border-color: var(--border-subtle); }
.metric-card.status-warning { border-color: var(--border-warning); background: var(--bg-warning); }
.metric-card.status-critical {
  border-color: var(--border-error);
  background: var(--bg-error);
  animation: pulse-danger 2s ease-in-out infinite;
}
@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%       { box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
}
/* Live number animation — for animated metrics */
.metric-value.animating {
  transition: color 300ms ease;
}
```

---

## 7. MOTION & ANIMATION SYSTEM

**The Modal principle:** motion is *evidence of responsiveness*, not decoration.
Every animation has a job. If the job is "look cool", remove it.

### Timing Tokens

```css
--duration-instant: 80ms;   /* immediate feedback — copy button, toggle */
--duration-fast:   150ms;   /* hover states, focus rings */
--duration-normal: 250ms;   /* card transitions, panel slides */
--duration-slow:   400ms;   /* page transitions, modal opens */

--ease-default:  cubic-bezier(0.16, 1, 0.3, 1);   /* smooth out — most UI */
--ease-enter:    cubic-bezier(0.0, 0.0, 0.2, 1);   /* elements entering */
--ease-exit:     cubic-bezier(0.4, 0.0, 1, 1);     /* elements leaving */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1); /* confirmation, success */
```

### Animation Catalog

**1. The Fade-Slide-In (page sections as user scrolls)**
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fade-up 400ms var(--ease-default) both;
}
/* Stagger children with animation-delay */
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
```
*Apply via IntersectionObserver — add .animate-in class when element enters viewport.*

**2. The Live Number (metrics that update in real-time)**
```js
function animateNumber(el, from, to, duration = 600) {
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
```

**3. The Typing Effect (CLI output, terminal lines)**
```js
function typeText(el, text, speed = 35) {
  el.textContent = '';
  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed + Math.random() * 20); // slight jitter = human
    }
  };
  type();
}
```

**4. The Hover Lift (interactive cards)**
```css
.card-interactive {
  transition: transform 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
```
*Note: only 2px lift. More = toyish. Less = imperceptible.*

**5. The CLI Reveal (on challenge card hover)**
```css
/* Defined in 6.2 card-interactive — the gradient overlay with the CLI command */
```

**6. The Pulse-In (success / completion)**
```css
@keyframes pulse-in {
  0%   { transform: scale(0.85); opacity: 0; }
  60%  { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}
.success-icon {
  animation: pulse-in 400ms var(--ease-bounce) both;
}
```

**7. The Incident Flash (War Room — critical status)**
```css
/* See metric-card.status-critical above — uses pulse-danger */
/* Additionally: the header INCIDENT badge */
@keyframes incident-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.badge-incident-live {
  animation: incident-pulse 1.5s ease-in-out infinite;
  background: var(--bg-error);
  color: var(--color-error);
}
```

**8. The Dot Grid Background (landing page hero)**
```css
.dot-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 28px 28px;
}
/* Subtle pulse animation on the dots — makes the hero feel alive */
@keyframes grid-breathe {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.7; }
}
.dot-grid { animation: grid-breathe 6s ease-in-out infinite; }
```

### Animation Rules

1. **Respect prefers-reduced-motion:** wrap all non-essential animations in
   `@media (prefers-reduced-motion: no-preference) { ... }`
2. **No duration over 500ms** for UI feedback. Over 500ms = the user is waiting.
3. **Transform and opacity only** — never animate width, height, top, left, or margin.
   Those cause layout reflows and jank.
4. **One animation per interaction event** — hover = one thing moves. Don't cascade 4
   simultaneous transitions on a single hover.

---

## 8. LAYOUT PATTERNS

### 8.1 — The Feature Tab Section (Landing Page)

**Pattern from Modal: centered heading, below it switchable tabs, below that a large
visual panel that changes based on selected tab.**

```
[Small label: "WHAT YOU CAN PRACTICE"]
[Large heading]
[Description text, max-width 560px, centered]

[Tab row: DSA · PR Review · War Room · System Design]
          ↑ active tab has a bottom border in --accent color

[Visual panel — full width, aspect-ratio: 16/7]
  Dark background, rendered preview of the active workspace
  Changes with a cross-fade (opacity transition on exit, then enter)
```

Tab transition rule: **cross-fade, 200ms, no slide** — slides make it feel like a slideshow.
Cross-fade feels like a content switch, which is what it is.

### 8.2 — The Two-Panel Workspace Layout

**Used in DSA, PR Review, War Room.**

```
[Top bar — challenge ID, timer, actions]  height: 48px

[Left panel 38%]       [Right panel 62%]
 Context / Ticket       Editor / Diff / Canvas
 Scrollable             Has internal sub-panels

[Bottom bar — submit, hints, status]     height: 52px
```

The split ratio is intentional: context should feel like a sidebar, not half the screen.
Left panel scrolls independently. Right panel has its own scroll context.

On resize below 1024px: panels stack. Left panel collapses to a drawer (slides from left).

### 8.3 — The Bento Grid (Feature Showcase)

**Asymmetric grid of feature cards. NOT equal columns.**

```
[Wide card — 2/3 width]    [Tall card — 1/3 width]
"The War Room"             "PR Review"
Full mock dashboard        GitHub diff preview

[Medium card — 1/2]        [Medium card — 1/2]
"CLI-native"               "System Design"
Terminal block             Mini canvas preview
```

Rules: Never more than 4 cards in one bento. Never all cards the same size.
The wide card should be the SIGNATURE feature (War Room).

### 8.4 — The Stat/Metric Row

**Used in landing page social proof, dashboard. 4 numbers in a row.**

```
[4820 XP]      [78% Ready]       [23-day streak]    [12 solved]
 ↑ mono font    ↑ with ring       ↑ with flame icon   ↑
 [label below]  [label below]     [label below]       [label below]
```

Rule: numbers animate up from 0 when the section enters viewport. 800ms duration.
Makes the metrics feel earned and real.

---

## 9. INTERACTION PATTERNS

### 9.1 — The CLI Hover Reveal
On challenge cards: when user hovers, a gradient fade-up reveals the CLI command
at the bottom of the card. The command is already in the DOM, just opacity: 0.
On hover of the card → CLI reveal opacity goes to 1 + translateY(0).
This is the single most "EngPrep-native" interaction in the product.

### 9.2 — The One-Click Copy
Every CLI command, ticket ID, and code block has a copy icon (top right).
On click: icon changes to checkmark, text changes to "Copied ✓", reverts after 2s.
The button never moves or resizes — just content swap.

### 9.3 — The Inline Hint Reveal
In DSA workspace: hints are numbered (1 of 3). Clicking "Show Hint" reveals hint 1,
fades it in from opacity 0 + translateY(8px). The next hint button appears below.
User feels they're progressing, not getting answers dumped on them.

### 9.4 — The Line-Click Comment (PR Review)
In diff view: any line can be clicked. On click, an inline comment textarea appears
below that line, inserted into the DOM — not a modal, not a sidebar.
The textarea opens with a 200ms height animation (max-height: 0 → max-height: 200px).
Submit collapses the textarea and shows the comment inline.
This is exactly how GitHub's code review feels. Muscle memory for engineers.

### 9.5 — The Tab Switching (Challenge types, Workspace panels)
Tab underline slides from old active tab to new active tab.
Use a CSS pseudo-element positioned absolutely, transition: left and width.
Do NOT use individual bottom-borders per tab — the sliding underline reads as precision.

```css
.tabs { position: relative; display: flex; gap: 0; border-bottom: 1px solid var(--border-subtle); }
.tab {
  padding: 10px 16px;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 150ms ease;
  white-space: nowrap;
}
.tab.active { color: var(--text-primary); }
.tabs__indicator {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: var(--accent);
  transition: left 200ms var(--ease-default), width 200ms var(--ease-default);
  border-radius: 2px 2px 0 0;
}
```

### 9.6 — The Live Metric Tick (War Room Dashboard)
Metrics update every 3–8 seconds with a subtle flash.
Update sequence: old value fades (opacity 0.5), new value animates in (opacity 1).
Color of value changes based on threshold (normal → warning → critical).
Numbers always use animateNumber() — never jump.

### 9.7 — The Toast Notification
XP gains, successful submissions, streak milestones → toast from bottom-right.
Toast enters: translateX(0) from translateX(100%). Exits: translateX(110%).
Max 1 toast visible at a time. Queue subsequent toasts.

```css
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 12px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  display: flex; align-items: center; gap: var(--space-3);
  font-size: var(--text-sm);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 1000;
  animation: toast-in 300ms var(--ease-default) both;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
.toast-xp { border-left: 3px solid var(--accent); }
.toast-error { border-left: 3px solid var(--color-error); }
```

---

## 10. SPECIFIC PAGE PATTERNS

### Landing Hero
- Background: --bg-base with .dot-grid overlay (opacity: 0.5)
- Very subtle radial gradient centered on the hero text: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.06), transparent)`
- This creates the faintest green glow at the top — exactly the Modal "bloom" effect
- Headline: .t-hero, max 2 lines, --text-primary
- Under headline: a horizontal line `<hr>` style separator 40px wide, accent color — a design signature
- CLI block: max-width 480px, centered, below the CTAs

### Challenge List Items
- Always card-interactive
- Left: type badge + title
- Right: estimated time + level dots + status
- On hover: CLI reveal from bottom ("$ engprep pull 402")
- On click: right-side drawer slides in (translateX from 100%)

### War Room Dashboard
- The metrics strip at top: 5 metric-cards in a row, auto-grid
- The critical metric card pulses with pulse-danger
- Log panel: monospace, dark, auto-scrolls to bottom like a real terminal
- Scrollbar: thin, accent-colored: `scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;`

### Pricing Cards
- Free: standard .card, slightly dimmer
- Pro: .card with `border-color: var(--accent-border)` and the subtle green bloom:
  `box-shadow: 0 0 0 1px var(--accent-border), 0 4px 24px rgba(34,197,94,0.08);`
- Annual toggle: pill-style toggle, not a checkbox
- Crossed-out Free features: `text-decoration: line-through; color: var(--text-tertiary);`
  Never use ✗ icons — they read as aggressive

---

## 11. WHAT NOT TO DO

These patterns make the product look AI-generated or agency-made:

1. **No purple gradients** on any background. This is the telltale AI design cliché.
2. **No glassmorphism** (backdrop-filter: blur). It looks dated and is a performance cost.
3. **No heavy drop shadows** — `box-shadow: 0 20px 40px rgba(0,0,0,0.5)` on every card
   makes things look like a SaaS template.
4. **No border-radius > 16px on cards** — it makes products look like mobile apps.
5. **No color gradients on buttons** — solid accent color only.
6. **No "animated gradient border"** CSS tricks — overdone in 2024.
7. **No skeleton loaders that pulse with a shimmer** on every element —
   one skeleton animation per page, not 20 different shimmer effects.
8. **No icons for every list item** — text-only lists are cleaner and more confident.
9. **No hero video backgrounds** — too heavy, no control over what plays.
10. **No emoji in UI** — use SVG icons or CSS shapes. Emoji render inconsistently
    across OS and feel casual in a professional tool.

---

## 12. IMPLEMENTATION CHECKLIST

Before shipping any component or page, verify:

- [ ] Background color is from the defined stack (not a custom hex)
- [ ] Text color is one of the 3 tiers (primary / secondary / tertiary)
- [ ] Font family is --font-sans or --font-mono (never system-ui directly)
- [ ] Spacing values are from the 4px scale (not arbitrary px)
- [ ] All interactive elements have hover + focus + active states
- [ ] Focus states use box-shadow rings (not outline: auto)
- [ ] Animated elements respect prefers-reduced-motion
- [ ] Only transform/opacity are transitioned (never layout properties)
- [ ] CLI commands and code use --font-mono
- [ ] Green accent appears ≤2 times per screen section
- [ ] Card borders are rgba (not solid colors)
- [ ] Any live/metric numbers use animateNumber() on update
- [ ] Mobile layout tested at 375px, 768px, 1024px, 1440px

---

*EngPrep Design System v1.0 — April 2026*
*Distilled from: Modal.com, Vercel/Geist, original UX research.*
*Not a copy. A synthesis.*