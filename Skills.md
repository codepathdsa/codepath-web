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
### Distilled from Modal.com — extracted directly, not approximated.
### Updated April 2026 with Modal-accurate colors.

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

> **CRITICAL — READ BEFORE WRITING ANY COLOR:**
> The accent green is **#62de61**, NOT Tailwind's green-500 (#22c55e).
> Modal's green is brighter, more electric, and reads far better on near-void dark backgrounds.
> The backgrounds are also darker than typical dark-mode UIs — near true-black, not charcoal.
> Section labels use **#ddffdc** (pale green text), not the full accent green.

### Base Palette (CSS custom properties — define in :root)

```css
:root {
  /* Backgrounds — layered from deepest to lightest */
  --bg-void:      #080808;   /* CLI blocks, code editors, deepest inset */
  --bg-base:      #0d0d0d;   /* page background — near-void, not pure black */
  --bg-surface:   #141414;   /* cards, panels, modals */
  --bg-raised:    #1c1c1c;   /* hover states, selected items, inset areas */
  --bg-overlay:   #252525;   /* dropdowns, tooltips, popovers */

  /* Borders — always low-opacity, never heavy lines */
  --border-faint:   rgba(255,255,255,0.05);  /* very subtle separators */
  --border-subtle:  rgba(255,255,255,0.08);  /* default card borders */
  --border-default: rgba(255,255,255,0.12);  /* hover state borders */
  --border-strong:  rgba(255,255,255,0.20);  /* focused inputs, active states */

  /* Text — three tiers only */
  --text-primary:   #efefef;   /* headlines, active labels, key data */
  --text-secondary: #8a8a8a;   /* body copy, descriptions, timestamps */
  --text-tertiary:  #4a4a4a;   /* placeholders, disabled, de-emphasized */
  --text-inverse:   #080808;   /* text on light/accent backgrounds */

  /* Brand accent — Modal-accurate green */
  /* ⚠️  This is #62de61 — brighter and more electric than Tailwind green-500 */
  --accent:         #62de61;   /* primary action, success, active — Modal's exact green */
  --accent-dim:     #4bc94a;   /* hover on accent elements */
  --accent-deep:    #09af58;   /* shadow end of gradient, deep states */
  --accent-ghost:   rgba(98,222,97,0.08);   /* subtle tint backgrounds */
  --accent-border:  rgba(98,222,97,0.22);   /* accent-adjacent borders */
  --accent-glow:    rgba(98,222,97,0.12);   /* featured card glow */

  /* Section label color — pale green, not full accent */
  /* Modal uses this for uppercase labels like "PROGRAMMABLE INFRA" */
  --label-green:    #ddffdc;

  /* Accent gradient — used in logo and hero accents */
  /* from: #bff9b4 → mid: #62de61 → to: #09af58 */

  /* Semantic colors */
  --color-error:    #ef4444;
  --color-warning:  #f59e0b;
  --color-info:     #3b82f6;
  --color-success:  #62de61;   /* same as accent */

  /* Semantic backgrounds (very subtle tints) */
  --bg-error:   rgba(239,68,68,0.08);
  --bg-warning: rgba(245,158,11,0.08);
  --bg-info:    rgba(59,130,246,0.08);
  --bg-success: rgba(98,222,97,0.08);

  /* Semantic borders */
  --border-error:   rgba(239,68,68,0.25);
  --border-warning: rgba(245,158,11,0.25);
  --border-info:    rgba(59,130,246,0.25);
  --border-success: rgba(98,222,97,0.22);

  /* Challenge type colors — used for badges/tags */
  --type-dsa:        #3b82f6;   /* blue */
  --type-pr:         #f59e0b;   /* amber */
  --type-war:        #ef4444;   /* red */
  --type-design:     #8b5cf6;   /* purple */
  --type-behavioral: #14b8a6;   /* teal */
}
```

### The Modal Green Gradient Ramp (for reference)

Modal's logo and accent elements use a full green gradient ramp:

```
#bff9b4  →  #80ee64  →  #62de61  →  #3dca5d  →  #18b759  →  #09af58
 lightest     light      PRIMARY     mid-dark     dark        deepest
```

Use `--accent` (#62de61) as the primary. Use `--accent-deep` (#09af58) for shadows,
glow effects, and the "deep" end of any gradient. Use `#bff9b4` or `#ddffdc` for
text on dark backgrounds where you need a pale green (section labels, success text).

### Color Rules

1. **Never use pure #000000 or #ffffff** — they feel digital and harsh.
   Use `--bg-base` and `--text-primary` instead.
2. **The accent green (#62de61) appears in maximum 2 places per screen** — primary CTA
   and one status indicator. More than 2 = diluted.
3. **Background layers must have meaningful contrast:**
   void → base → surface → raised → overlay. Each step is ~+7-8 lightness.
4. **Borders are always rgba, never solid colors** — they feel lighter and more refined.
5. **Type colors are a strict 3-tier system** — never create a 4th.
6. **Section labels use --label-green (#ddffdc)**, not --accent — it's more legible
   at small sizes and is Modal's actual pattern for uppercase section labels.
7. **CLI blocks and code editors use --bg-void (#080808)**, not --bg-base.
   The extra depth makes them feel embedded and distinct.

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
Import from Google Fonts or self-host. Inter is an acceptable fallback.

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
--tracking-tight:  -0.03em;  /* large headings only (20px+) */
--tracking-normal:  0em;
--tracking-wide:    0.06em;  /* ALL CAPS labels, tags */
--tracking-wider:   0.10em;  /* STATUS, INCIDENT, LEVEL labels */
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

.t-section-label {  /* "PROGRAMMABLE INFRA / STEP 01 / METRICS" */
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--label-green);  /* ← #ddffdc, not --accent */
}

.t-body {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.t-mono {        /* All code, CLI commands, IDs, metrics */
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
   code, timestamps, metrics values.
5. **Font-weight 400/500/600 only** — no 300 (too thin on dark), no 700 (too heavy).
6. **Section labels use --label-green, not --accent** — this is Modal's exact pattern.

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
--radius-sm:   4px;    /* tags, badges, small code blocks */
--radius-md:   7px;    /* buttons, inputs — Modal uses 7px not 8px */
--radius-lg:   12px;   /* cards, panels, modals */
--radius-xl:   16px;   /* large feature cards */
--radius-full: 9999px; /* pills, avatars, progress indicators */
```

**Rule:** border-radius should be consistent within a component family. A card at 12px
radius should have internal elements at 7px radius. Never mix 4px and 16px on siblings.

---

## 6. COMPONENT LIBRARY

### 6.1 — Buttons

```html
<!-- Primary — one per screen section maximum -->
<button class="btn-primary">Pull Challenge</button>

<!-- Ghost — secondary actions, nav CTAs -->
<button class="btn-ghost">Read the Docs</button>

<!-- Subtle — tertiary, low-emphasis actions -->
<button class="btn-subtle">View All</button>

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
  padding: 9px 18px;
  background: var(--accent);          /* #62de61 */
  color: var(--text-inverse);          /* #080808 */
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  border: none;
  border-radius: var(--radius-md);     /* 7px */
  cursor: pointer;
  transition: background 150ms ease, transform 100ms ease, box-shadow 150ms ease;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.20);
}
.btn-primary:hover {
  background: var(--accent-dim);       /* #4bc94a */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(98,222,97,0.22), inset 0 1px 0 rgba(255,255,255,0.20);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 18px;
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

.btn-subtle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 18px;
  background: var(--bg-raised);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.btn-subtle:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
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
- CTA text is action verbs: "Pull Challenge", "Submit", "Get Started" — never "Click Here"
- Loading state: replace text with a 16px spinner, keep same dimensions, disable pointer
- Never use border-radius > radius-md on buttons

---

### 6.2 — Cards

```css
/* Default card — most panels, challenge items, feature sections */
.card {
  background: var(--bg-surface);         /* #141414 */
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);        /* 12px */
  padding: var(--space-6);               /* 24px */
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
  color: var(--accent);                  /* #62de61 */
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 200ms ease, transform 200ms ease;
}
.card-interactive:hover .cli-reveal {
  opacity: 1;
  transform: translateY(0);
}

/* Accent card — featured / Pro plan / recommended item */
/* Modal-specific: top-edge gradient line + green glow */
.card-accent {
  background: var(--bg-surface);
  border: 1px solid var(--accent-border);   /* rgba(98,222,97,0.22) */
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 0 0 1px var(--accent-border), 0 4px 24px var(--accent-ghost);
  position: relative;
  overflow: hidden;
}
.card-accent::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.6;
}

/* Feature card — landing page feature showcase */
.card-feature {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);         /* 16px */
  padding: var(--space-8);                 /* 32px */
  background-image: linear-gradient(
    to bottom,
    rgba(255,255,255,0.025) 0%,
    transparent 64px
  );
}
```

---

### 6.3 — The CLI Block

**The signature component of EngPrep. The background is --bg-void (#080808), not --bg-base.**

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
  background: var(--bg-void);             /* #080808 — deeper than page bg */
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
  padding: 9px 14px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}
.cli-block__dot {
  width: 9px; height: 9px;
  border-radius: 50%;
}
.cli-block__dot--red    { background: #ef4444; opacity: 0.7; }
.cli-block__dot--yellow { background: #f59e0b; opacity: 0.7; }
.cli-block__dot--green  { background: var(--accent); opacity: 0.7; }  /* #62de61 */
.cli-block__title {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  font-family: var(--font-sans);
}
.cli-block__body {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cli-block__line {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}
.cli-block__prompt {
  color: var(--accent);          /* #62de61 */
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
  padding-left: 18px;
}
/* The blinking cursor */
.cli-block__cursor {
  display: inline-block;
  width: 7px; height: 14px;
  background: var(--accent);     /* #62de61 */
  opacity: 0.8;
  animation: cursor-blink 1.2s ease-in-out infinite;
}
@keyframes cursor-blink {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0; }
}
.cli-block__copy {
  position: absolute;
  top: 8px; right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
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
  border-radius: var(--radius-sm);        /* 4px */
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  white-space: nowrap;
}

/* Challenge type badges */
.badge-dsa {
  background: rgba(59,130,246,0.10);
  color: #60a5fa;
  border: 1px solid rgba(59,130,246,0.18);
}
.badge-pr {
  background: rgba(245,158,11,0.10);
  color: #fbbf24;
  border: 1px solid rgba(245,158,11,0.18);
}
.badge-war {
  background: rgba(239,68,68,0.10);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.18);
}
.badge-design {
  background: rgba(139,92,246,0.10);
  color: #a78bfa;
  border: 1px solid rgba(139,92,246,0.18);
}
.badge-behavioral {
  background: rgba(20,184,166,0.10);
  color: #2dd4bf;
  border: 1px solid rgba(20,184,166,0.18);
}

/* Status badges */
.badge-new    { background: var(--bg-raised); color: var(--text-tertiary); border: 1px solid var(--border-subtle); }
.badge-active { background: var(--accent-ghost); color: var(--accent); border: 1px solid var(--accent-border); }
.badge-done   { background: rgba(98,222,97,0.07); color: #80ee64; border: 1px solid rgba(98,222,97,0.15); }

/* Live incident badge — animated */
.badge-live {
  background: var(--bg-error);
  color: var(--color-error);
  border: 1px solid var(--border-error);
  animation: incident-pulse 1.5s ease-in-out infinite;
}
@keyframes incident-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* Level dots (SDE track indicators) */
.level-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border-default);
}
.level-dot.active { background: var(--accent); }   /* #62de61 */
```

---

### 6.5 — Inputs

```css
.input {
  width: 100%;
  padding: 9px 12px;
  background: var(--bg-void);              /* #080808 — deepest for inputs */
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);          /* 7px */
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

```css
.diff-block {
  background: var(--bg-void);             /* #080808 */
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
}
.diff-header {
  padding: 7px 14px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
}
.diff-line {
  display: flex;
  align-items: stretch;
  min-height: 20px;
}
.diff-line:hover { background: rgba(255,255,255,0.02); }
.diff-line.clickable { cursor: pointer; }
.diff-line.clickable:hover { background: rgba(59,130,246,0.05); }

.diff-num {
  min-width: 36px;
  padding: 0 8px;
  text-align: right;
  font-size: 10px;
  color: var(--text-tertiary);
  border-right: 1px solid var(--border-subtle);
  user-select: none;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: flex-end;
}
.diff-sign {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.diff-code {
  padding: 0 var(--space-3);
  flex: 1;
  white-space: pre;
  overflow-x: auto;
  display: flex; align-items: center;
}

/* Removed line */
.diff-line.removed .diff-code  { background: rgba(239,68,68,0.07); }
.diff-line.removed .diff-sign  { color: #f87171; }
.diff-line.removed .diff-num   { background: rgba(239,68,68,0.04); }

/* Added line — note: uses accent green (#62de61 family), not #22c55e */
.diff-line.added .diff-code    { background: rgba(98,222,97,0.06); }
.diff-line.added .diff-sign    { color: var(--accent); }
.diff-line.added .diff-num     { background: rgba(98,222,97,0.04); }

/* Comment thread */
.diff-comment {
  border-left: 3px solid var(--color-info);
  background: var(--bg-raised);
  padding: var(--space-3) var(--space-4);
  margin: 4px 0;
}
.diff-comment-input {
  width: 100%;
  background: var(--bg-void);
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

```css
.metric-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 13px 15px;
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
.metric-card.status-normal   { border-color: var(--border-subtle); }
.metric-card.status-warning  { border-color: var(--border-warning); background: var(--bg-warning); }
.metric-card.status-critical {
  border-color: var(--border-error);
  background: var(--bg-error);
  animation: pulse-danger 2s ease-in-out infinite;
}
@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%       { box-shadow: 0 0 0 4px rgba(239,68,68,0.08); }
}

/* Status value colors */
.metric-value.warn-c     { color: #fbbf24; }
.metric-value.critical-c { color: #f87171; }
.metric-value.success-c  { color: var(--accent); }   /* #62de61 */
```

---

## 7. MOTION & ANIMATION SYSTEM

**The Modal principle:** motion is *evidence of responsiveness*, not decoration.
Every animation has a job. If the job is "look cool", remove it.

### Timing Tokens

```css
--duration-instant: 80ms;    /* immediate feedback — copy button, toggle */
--duration-fast:   150ms;    /* hover states, focus rings */
--duration-normal: 250ms;    /* card transitions, panel slides */
--duration-slow:   400ms;    /* page transitions, modal opens */

--ease-default:  cubic-bezier(0.16, 1, 0.3, 1);    /* smooth out — most UI */
--ease-enter:    cubic-bezier(0.0, 0.0, 0.2, 1);    /* elements entering */
--ease-exit:     cubic-bezier(0.4, 0.0, 1, 1);      /* elements leaving */
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
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
```

**2. The Live Number (metrics that update in real-time)**
```js
function animateNumber(el, from, to, duration = 600) {
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
```

**3. The Typing Effect (CLI output)**
```js
function typeText(el, text, speed = 35) {
  el.textContent = '';
  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed + Math.random() * 20);
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

**5. The Pulse-In (success / completion)**
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

**6. The Dot Grid Background (landing page hero) — Modal's signature**
```css
.dot-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 24px 24px;           /* Modal uses 24px, not 28px */
  animation: grid-breathe 6s ease-in-out infinite;
}
@keyframes grid-breathe {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
}
```

**7. The Hero Green Bloom (landing page) — Modal's exact effect**
```css
/* Applied as a pseudo-element or overlay div on the hero section */
.hero-bloom {
  background: radial-gradient(
    ellipse 70% 50% at 50% 0%,
    rgba(98,222,97,0.07),               /* #62de61 at 7% opacity */
    transparent
  );
}
```

**8. The Accent Line (below hero headline) — Modal's design signature**
```css
.hero-accent-line {
  width: 36px;
  height: 2px;
  background: var(--accent);            /* #62de61 */
  margin: 16px auto;
  border-radius: 2px;
  opacity: 0.8;
}
```

### Animation Rules

1. **Respect prefers-reduced-motion:**
   ```css
   @media (prefers-reduced-motion: no-preference) {
     /* all non-essential animations here */
   }
   ```
2. **No duration over 500ms** for UI feedback.
3. **Transform and opacity only** — never animate width, height, top, left, or margin.
4. **One animation per interaction event** — hover = one thing moves.

---

## 8. LAYOUT PATTERNS

### 8.1 — The Feature Tab Section (Landing Page)

```
[Small label: "WHAT YOU CAN PRACTICE"]   ← color: --label-green (#ddffdc)
[Large heading]
[Description text, max-width 560px, centered]

[Tab row: DSA · PR Review · War Room · System Design]
          ↑ active tab has sliding underline in --accent (#62de61)

[Visual panel — full width, aspect-ratio: 16/7]
  Dark background (--bg-void), rendered workspace preview
  Changes with cross-fade (opacity 200ms, no slide)
```

### 8.2 — The Two-Panel Workspace Layout

```
[Top bar — challenge ID, timer, actions]  height: 48px

[Left panel 38%]       [Right panel 62%]
 Context / Ticket       Editor / Diff / Canvas
 Scrollable             Has internal sub-panels

[Bottom bar — submit, hints, status]     height: 52px
```

### 8.3 — The Bento Grid (Feature Showcase)

```
[Wide card — 2/3 width]    [Tall card — 1/3 width]
"The War Room"             "PR Review"

[Medium card — 1/2]        [Medium card — 1/2]
"CLI-native"               "System Design"
```

Never more than 4 cards. Never all the same size.

### 8.4 — The Stat/Metric Row

Numbers animate up from 0 when section enters viewport. 800ms duration.

---

## 9. INTERACTION PATTERNS

### 9.1 — The CLI Hover Reveal
On challenge cards: gradient fade-up reveals the CLI command at card bottom on hover.
Command is in DOM at `opacity: 0`. Hover → `opacity: 1` + `translateY(0)`.

### 9.2 — The One-Click Copy
Every CLI command has a copy icon. On click: icon → checkmark, text → "Copied ✓", reverts after 2s.

### 9.3 — The Inline Hint Reveal
Hints numbered (1 of 3). Each reveals with `opacity: 0 + translateY(8px)` → normal.

### 9.4 — The Line-Click Comment (PR Review)
Click any diff line → inline textarea appears below (height: 0 → 200px, 200ms).
Never a modal. Submit → textarea collapses → comment shows inline.

### 9.5 — The Sliding Tab Indicator

```css
.tabs { position: relative; display: flex; border-bottom: 1px solid var(--border-subtle); }
.tab {
  padding: 9px 16px;
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
  background: var(--accent);             /* #62de61 */
  transition: left 200ms var(--ease-default), width 200ms var(--ease-default);
  border-radius: 2px 2px 0 0;
}
```

### 9.6 — The Live Metric Tick (War Room)
Metrics update every 3–8s. Number always uses `animateNumber()` — never jumps.

### 9.7 — The Toast Notification

```css
.toast {
  position: fixed; bottom: 24px; right: 24px;
  padding: 11px 14px;
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
.toast-xp    { border-left: 3px solid var(--accent); }   /* #62de61 */
.toast-error { border-left: 3px solid var(--color-error); }
```

---

## 10. SPECIFIC PAGE PATTERNS

### Landing Hero
```
Background:  --bg-base (#0d0d0d)
Dot grid:    .dot-grid overlay, opacity 0.5, 24px spacing
Green bloom: radial-gradient ellipse 70% 50% at top, rgba(98,222,97,0.07)
Headline:    .t-hero, max 2 lines, --text-primary
Accent line: 36px wide, 2px tall, --accent color, centered below headline
CTAs:        btn-primary + btn-ghost side by side
CLI block:   max-width 480px, centered, --bg-void background
```

### Section Labels (Modal-exact pattern)
```
font-size: 11px
font-weight: 500
letter-spacing: 0.10em
text-transform: uppercase
color: --label-green (#ddffdc)   ← NOT --accent
margin-bottom: 8-12px
```

### War Room Dashboard
- Metrics strip: 5 metric-cards in a row
- Critical metric card uses `pulse-danger` animation
- Log panel: `--bg-void`, monospace, auto-scrolls
- Scrollbar: `scrollbar-width: thin; scrollbar-color: var(--border-default) transparent;`

### Pricing Cards
- Free: standard `.card`
- Pro: `.card-accent` — green border glow + top-edge line
- Annual toggle: pill-style toggle
- Crossed-out features: `text-decoration: line-through; color: var(--text-tertiary);`

---

## 11. WHAT NOT TO DO

1. **No purple gradients** on any background.
2. **No glassmorphism** (backdrop-filter: blur).
3. **No heavy drop shadows** on every card.
4. **No border-radius > 16px on cards**.
5. **No color gradients on buttons** — solid `--accent` (#62de61) only.
6. **No "animated gradient border"** CSS tricks.
7. **No skeleton shimmer on every element**.
8. **No icons for every list item**.
9. **No hero video backgrounds**.
10. **No emoji in UI** — use SVG icons or CSS shapes.
11. **Do NOT use #22c55e (Tailwind green-500)** — this is the wrong green.
    Always use `--accent: #62de61`.
12. **Do NOT use a gray section label color** — Modal uses `--label-green: #ddffdc`
    for uppercase section labels, not gray.

---

## 12. QUICK REFERENCE — COLOR TOKENS

```
BACKGROUNDS          HEX        USAGE
--bg-void            #080808    CLI blocks, code editors, deepest inset
--bg-base            #0d0d0d    Page background
--bg-surface         #141414    Cards, panels, modals
--bg-raised          #1c1c1c    Hover states, selected items
--bg-overlay         #252525    Dropdowns, tooltips

BORDERS              VALUE
--border-faint       rgba(255,255,255,0.05)
--border-subtle      rgba(255,255,255,0.08)   default card
--border-default     rgba(255,255,255,0.12)   hover
--border-strong      rgba(255,255,255,0.20)   focused

TEXT
--text-primary       #efefef    Headlines, data, active labels
--text-secondary     #8a8a8a    Body copy, descriptions
--text-tertiary      #4a4a4a    Placeholders, disabled
--text-inverse       #080808    Text on accent/light bg

ACCENT (Modal green ramp)
--accent             #62de61    PRIMARY — buttons, cursor, active states
--accent-dim         #4bc94a    Hover on accent elements
--accent-deep        #09af58    Shadow/glow deep end
--accent-ghost       rgba(98,222,97,0.08)
--accent-border      rgba(98,222,97,0.22)
--label-green        #ddffdc    Section labels (uppercase small text)
```

---

## 13. IMPLEMENTATION CHECKLIST

Before shipping any component or page, verify:

- [ ] `--bg-void` (#080808) used for CLI blocks and code editors (not --bg-base)
- [ ] `--accent` is #62de61, NOT #22c55e anywhere in the codebase
- [ ] Section labels use `--label-green` (#ddffdc), not --accent
- [ ] Background colors are from the defined stack (not custom hex)
- [ ] Text color is one of the 3 tiers (primary / secondary / tertiary)
- [ ] Font family is --font-sans or --font-mono
- [ ] Spacing values are from the 4px scale
- [ ] All interactive elements have hover + focus + active states
- [ ] Focus states use box-shadow rings (not outline: auto)
- [ ] Animated elements respect prefers-reduced-motion
- [ ] Only transform/opacity are transitioned
- [ ] Accent (#62de61) appears ≤2 times per screen section
- [ ] Card borders are rgba (not solid colors)
- [ ] Live metric numbers use animateNumber() on update
- [ ] btn-primary hover glow uses rgba(98,222,97,0.22), not the old rgba(34,197,94,0.25)
- [ ] Diff block "added" lines use rgba(98,222,97,0.06), not rgba(34,197,94,0.08)
- [ ] Mobile layout tested at 375px, 768px, 1024px, 1440px

---

*EngPrep Design System v2.0 — April 2026*
*Source: Modal.com direct extraction + original UX research.*
*Key change from v1.0: accent green #22c55e → #62de61. Added --bg-void, --label-green.*