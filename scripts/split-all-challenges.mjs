/**
 * split-all-challenges.mjs
 *
 * Splits every monolithic challenge file into one-file-per-challenge, then
 * generates a barrel index.ts for each type.
 *
 * Types handled:
 *   pr.ts   → lib/challenges/pr/<ID>.ts   + pr/index.ts
 *   war.ts  → lib/challenges/war/<ID>.ts  + war/index.ts
 *   sys.ts  → lib/challenges/sys/<ID>.ts  + sys/index.ts
 *   tech.ts → lib/challenges/tech/<ID>.ts + tech/index.ts
 *
 * Run: node scripts/split-all-challenges.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Config: one entry per challenge type ─────────────────────────────────────
const TYPES = [
  { src: 'pr.ts',   exportName: 'prChallenges',   dir: 'pr'   },
  { src: 'war.ts',  exportName: 'warChallenges',  dir: 'war'  },
  { src: 'sys.ts',  exportName: 'sysChallenges',  dir: 'sys'  },
  { src: 'tech.ts', exportName: 'techChallenges', dir: 'tech' },
];

// ─── Extract top-level objects from an array literal in source text ───────────
function extractObjects(src) {
  // Find the opening [ of the exported array
  const marker = src.indexOf(': Challenge[] = [');
  if (marker === -1) throw new Error('Could not find Challenge[] array');
  const arrayOpen = src.indexOf('[', marker) + 1;

  const objects = [];
  let depth  = 0;
  let inStr  = false;
  let strCh  = '';
  let escape = false;
  let objStart = -1;

  for (let i = arrayOpen; i < src.length; i++) {
    const ch = src[i];

    if (!inStr) {
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue; }
      if (ch === '{') {
        if (depth === 0) objStart = i;
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0 && objStart !== -1) {
          objects.push(src.slice(objStart, i + 1));
          objStart = -1;
        } else if (depth < 0) break; // hit the closing ] of the outer array
      }
    } else {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === strCh) inStr = false;
    }
  }
  return objects;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
for (const { src: srcFile, exportName, dir } of TYPES) {
  const srcPath = join(ROOT, 'lib', 'challenges', srcFile);
  const destDir = join(ROOT, 'lib', 'challenges', dir);

  console.log(`\n──────────────────────────────────────`);
  console.log(`Processing ${srcFile}  →  lib/challenges/${dir}/`);

  const src = readFileSync(srcPath, 'utf-8');
  const objects = extractObjects(src);
  console.log(`  Found ${objects.length} challenges`);

  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const ids = [];
  const skipped = [];

  for (const block of objects) {
    const m = block.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
    if (!m) { skipped.push(block.slice(0, 60).trim()); continue; }
    const id = m[1];
    ids.push(id);

    const filePath = join(destDir, `${id}.ts`);
    const content =
`import type { Challenge } from '../types';

// ─── ${id} ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run \`npx next build\` after saving to confirm no TypeScript errors.

const challenge: Challenge = ${block};

export default challenge;
`;
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${id}.ts`);
  }

  if (skipped.length) console.warn(`  ⚠ Skipped (no id): ${skipped.length}`, skipped);

  // ─── Write barrel index ─────────────────────────────────────────────────────
  const imports = ids
    .map((id, i) => `import c${String(i + 1).padStart(3, '0')} from './${id}';`)
    .join('\n');

  const array =
    `export const ${exportName} = [\n` +
    ids.map((_, i) => `  c${String(i + 1).padStart(3, '0')},`).join('\n') +
    `\n];\n`;

  const banner = `// ─── ${dir.toUpperCase()} Challenges barrel ${'─'.repeat(Math.max(0, 52 - dir.length))}
//
// HOW TO ADD A NEW CHALLENGE:
//   1. Duplicate any existing file, e.g.:  cp ${ids[0]}.ts ${ids[0].replace(/\d+$/, String(ids.length + 1).padStart(3, '0'))}.ts
//   2. Update the id + all fields — TypeScript enforces the schema.
//   3. Add one import line below.
//   4. Add it to the array below.
//   5. Run \`npx next build\` to verify.
// ${'─'.repeat(68)}

`;

  const barrelPath = join(destDir, 'index.ts');
  writeFileSync(barrelPath, banner + imports + '\n\n' + array, 'utf-8');
  console.log(`  ✓ ${dir}/index.ts  (${ids.length} challenges)`);

  // ─── Replace the monolithic source file with a thin re-export ──────────────
  const stub = `// Challenges have been split into lib/challenges/${dir}/<ID>.ts\n// This file re-exports the barrel so nothing else needs to change.\nexport { ${exportName} } from './${dir}/index';\n`;
  writeFileSync(srcPath, stub, 'utf-8');
  console.log(`  ✓ ${srcFile} → replaced with re-export stub`);
}

console.log('\n\nAll done. Run: npx next build');
