# Adding New Practice Problems to CodePath

CodePath now runs entirely on **MDX** (Markdown with React Support). You no longer need to copy and paste hundreds of lines of raw HTML to add a new problem to the platform.

### Step 1: Create the MDX File
1. Go to `content/problems/`
2. Create a new file with the slug of your problem (e.g., `best-time-to-buy-stock.mdx`).
3. Top the file with the required **Frontmatter**:
```yaml
---
title: "#121. Best Time to Buy and Sell Stock"
difficulty: "Easy"
topics: ["Arrays", "Math", "Two Pointers"]
readTime: "4 min read"
approaches: 2
companies: ["Google", "Amazon", "Microsoft"]
acceptance: "~53% acceptance"
leetcode_url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
---
```

### Step 2: Write the Editorial
Use standard Markdown (`##`, `###`, `**bold**`, `*italic*`). Next.js is now configured to automatically handle advanced elements seamlessly:

1. **Code Blocks:** Use triple backticks (e.g., ` ```python `). These automatically receive a dark theme, `highlight.js` syntax coloring, the language title, and a "Copy" button!
2. **Complexity Tables:** Simply use markdown tables (`| Col 1 | Col 2 |`). They are automatically styled as beautiful `.complexity-table` components!
3. **Premium Content:** Want to hide the optimal approach for non-users? Just wrap that section of the MDX with `<Premium>...</Premium>`. Guests will see a blurred teaser and a login CTA, while authenticated users will read it normally.
4. **Callout Boxes:**
   - `<div className="callout"><p>Text</p></div>`
   - `<div className="callout warning"><p>Text</p></div>`
   - `<div className="insight"><div className="insight-label">Tip</div><p>Text</p></div>`

### Step 3: Add to the Dashboard Roadmap
For the problem to appear on the global Practice Tree on the homepage:
1. Open up `app/data.ts`.
2. Find the correct topic bucket inside the `ROADMAP` array.
3. Add your problem to the `problems_list`:
```javascript
{ num: '121', name: 'Best Time to Buy and Sell Stock', diff: 'E', slug: 'best-time-to-buy-stock' }
```

That's it! Next.js will dynamically compile and render the article to the exact CodePath design system, injecting syntax highlighting, and layout scaffolding automatically.

---

### Step 4: Structuring Tags and Roadmaps

**Should you use a Database (like Supabase) or the Markdown Frontmatter for tracking problem tags?**

**Answer: Use the MDX Markdown Frontmatter.**

Because this is a content-driven application (like a blog or documentation tool), defining the tags and taxonomy directly inside each problem's Markdown `---` frontmatter is vastly superior:
1. **Version Control:** When you update an explanation or change the difficulty of a problem, the tag change is natively tracked in your Git commits.
2. **Performance:** `gray-matter` processes tags instantly at compilation (build) time or static generation, without imposing latency from database round-trips.
3. **Easier Authoring:** You don't have to keep a database entry synced. If the `.mdx` file exists, the tags exist right inside it.

Supabase is already active but should exclusively be reserved for tracking **user-state**: their progress (e.g., ticking the "Solved" button on a specific problem), managing user sessions via OAuth, and checking if they bought a premium subscription so you can unlock the `<Premium>` tag barrier. Keep content metadata inside the markdown, and user actions inside the database!
