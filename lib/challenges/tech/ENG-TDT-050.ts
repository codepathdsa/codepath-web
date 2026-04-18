import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-050',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Database Schema Versioning',
  companies: ['Flyway', 'Liquibase'],
  timeEst: '~25 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'Schema changes are applied manually by SSHing into production. There are no migration files. Nobody knows the canonical schema. A column added last sprint broke staging because it was never in version control. Set up Flyway-style migrations.',
  solution: 'Create a migrations/ directory with versioned SQL files (V001__init.sql, V002__add_index.sql). Implement a migration runner that tracks applied migrations in a schema_versions table.',
  lang: 'TypeScript',
  tribunalData: {
    background: `"Just SSH in and run the ALTER TABLE." This is the current process for all schema changes. There are no migration files. The staging and production schemas have drifted — staging has 3 columns production doesn't.\n\nDatabase migrations should be: versioned (numbered), tracked (recorded in a table), idempotent (safe to run twice), and automated (run on deploy).\n\nYour mission: build a migration runner and write the current schema as migration V001.`,
    folderPath: 'db/migrations',
    primaryFile: 'runner.ts',
    files: [
      {
        name: 'runner.ts',
        lang: 'typescript',
        code: `import { db } from '../db';
import fs from 'fs/promises';
import path from 'path';

// TODO: Implement migration runner.
// 1. Create schema_versions table if not exists
// 2. Read all V*.sql files from migrations/ directory, sorted by version number
// 3. For each migration: if not in schema_versions, execute the SQL and record it
// 4. Skip already-applied migrations (idempotency)

export async function runMigrations(): Promise<void> {
  // TODO: implement
  throw new Error('Not implemented');
}`,
      },
      {
        name: 'V001__init_schema.sql',
        lang: 'sql',
        code: `-- TODO: Write the canonical initial schema as the first migration.
-- This should create all tables that exist in production.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TODO: Add the remaining tables (orders, products, sessions...)
`,
      },
      {
        name: 'V002__add_user_indexes.sql',
        lang: 'sql',
        code: `-- TODO: Add indexes that were applied manually in production last week.
-- Create indexes CONCURRENTLY to avoid locking.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- TODO: Add more indexes that need to be tracked
`,
      },
    ],
    objectives: [
      {
        label: 'Create schema_versions table if not exists in runner',
        check: { type: 'contains', file: 'runner.ts', pattern: 'schema_versions' },
      },
      {
        label: 'Read migration files sorted by version',
        check: { type: 'contains', file: 'runner.ts', pattern: 'readdir' },
      },
      {
        label: 'Skip already-applied migrations',
        check: { type: 'contains', file: 'runner.ts', pattern: 'SELECT' },
      },
      {
        label: 'Record applied migration in schema_versions',
        check: { type: 'contains', file: 'runner.ts', pattern: 'INSERT INTO schema_versions' },
      },
    ],
    hints: [
      'schema_versions table: `CREATE TABLE IF NOT EXISTS schema_versions (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())`',
      'Read files: `const files = (await fs.readdir(migrationsDir)).filter(f => f.endsWith(".sql")).sort()`',
      'Check if applied: `SELECT 1 FROM schema_versions WHERE version = $1` — skip if row exists.',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 380,
    successMessage: `Schema changes are now tracked in version control and applied automatically on deploy. Staging and production can never drift. New team members can recreate the exact DB schema from scratch by running the migrations.`,
  },
};

export default challenge;
