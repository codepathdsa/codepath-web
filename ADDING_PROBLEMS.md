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
Use standard Markdown (`##`, `###`, `**bold**`, `*italic*`).

For beautiful formatting, we have built-in classes:
- **Callout box:** `<div className="callout"><p>Text</p></div>`
- **Warning box:** `<div className="callout warning"><p>Text</p></div>`
- **Insight box:** `<div className="insight"><div className="insight-label">Tip</div><p>Text</p></div>`
- **Complexity Table:** Just use a standard HTML `<table>` with `className="complexity-table"`.

### Step 3: Add to the Dashboard Roadmap
For the problem to appear on the global Practice Tree on the homepage:
1. Open up `app/data.ts`.
2. Find the correct topic bucket inside the `ROADMAP` array.
3. Add your problem to the `problems_list`:
```javascript
{ num: '121', name: 'Best Time to Buy and Sell Stock', diff: 'E', slug: 'best-time-to-buy-stock' }
```

That's it! Next.js will dynamically compile and render the article to the exact CodePath design system, injecting syntax highlighting, and layout scaffolding automatically.
