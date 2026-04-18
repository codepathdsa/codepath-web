import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-011',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Synchronous File I/O Blocking the Event Loop',
  companies: ['Cloudflare', 'Vercel'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A Node.js API reads a config file using fs.readFileSync() on every request. Under 200 concurrent users, P99 latency hits 4s. The fix takes one line.',
  solution: 'Replace fs.readFileSync() with fs.promises.readFile() (async/await). Cache the result in a module-level variable so it only reads once on startup, not per-request.',
  lang: 'TypeScript',
  tribunalData: {
    background: `Our config loader was written by an intern who "just wanted it to work." It reads a JSON file synchronously on every single API request — blocking the entire Node.js event loop while the disk I/O completes.\n\nUnder load, every request queues behind every other request's file read. P99 latency collapses.\n\nYour mission: make the read async, and cache the result so it only happens once at startup.`,
    folderPath: 'src/config',
    primaryFile: 'configLoader.ts',
    files: [
      {
        name: 'configLoader.ts',
        lang: 'typescript',
        code: `import fs from 'fs';
import path from 'path';

/**
 * TODO: This blocks the event loop on every call.
 * 1. Make it async using fs.promises.readFile
 * 2. Cache the result at module level so reads only happen once
 */
export function getConfig(): Record<string, string> {
  const raw = fs.readFileSync(path.join(__dirname, 'app.config.json'), 'utf-8');
  return JSON.parse(raw);
}`,
      },
      {
        name: 'app.config.json',
        lang: 'json',
        readOnly: true,
        code: `{
  "db_host": "postgres.internal",
  "redis_host": "redis.internal",
  "feature_flags": "new_checkout,dark_mode"
}`,
      },
      {
        name: 'server.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import express from 'express';
import { getConfig } from './configLoader';

const app = express();

// READ-ONLY: consumer of getConfig
app.get('/health', async (_req, res) => {
  const cfg = await getConfig();
  res.json({ status: 'ok', db: cfg.db_host });
});

app.listen(3000);`,
      },
    ],
    objectives: [
      {
        label: 'Remove fs.readFileSync from getConfig',
        check: { type: 'not_contains', file: 'configLoader.ts', pattern: 'readFileSync' },
      },
      {
        label: 'Use fs.promises.readFile or fs/promises',
        check: { type: 'contains', file: 'configLoader.ts', pattern: 'readFile' },
      },
      {
        label: 'Cache the parsed config so disk is only read once',
        check: { type: 'contains', file: 'configLoader.ts', pattern: 'let ' },
      },
    ],
    hints: [
      'Declare `let cached: Record<string, string> | null = null` at module level.',
      'Check `if (cached) return cached;` at the top of the function.',
      'Use `await fs.promises.readFile(...)` for the actual read.',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 200,
    successMessage: `The event loop is free. By caching at startup and switching to async I/O, P99 latency dropped from 4s to under 20ms under the same load.`,
  },
};

export default challenge;
