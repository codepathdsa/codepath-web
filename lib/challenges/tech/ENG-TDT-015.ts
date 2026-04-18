import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-015',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Unindexed Foreign Key Causing Full Table Scans',
  companies: ['PlanetScale', 'Neon'],
  timeEst: '~20 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A messages table has 50M rows. Fetching all messages for a user takes 8s because the user_id foreign key has no index. Add the index and explain the EXPLAIN output.',
  solution: 'Add CREATE INDEX idx_messages_user_id ON messages(user_id). For the inbox query that also filters by created_at, add a composite index on (user_id, created_at DESC).',
  lang: 'SQL',
  tribunalData: {
    background: `The inbox query was fine at 10,000 users. At 2M users and 50M messages, it performs a full sequential scan every time. Postgres EXPLAIN shows "Seq Scan on messages" with cost=0..980000.\n\nThe foreign key user_id exists for integrity but was never indexed for lookups. Every inbox load reads the entire table.\n\nYour mission: add the right indexes to make inbox queries use index scans.`,
    folderPath: 'db/migrations',
    primaryFile: 'add_message_indexes.sql',
    files: [
      {
        name: 'add_message_indexes.sql',
        lang: 'sql',
        code: `-- TODO: Add indexes to make the inbox query efficient.
-- The query pattern is:
--   SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;
--
-- Current EXPLAIN output:
--   Seq Scan on messages (cost=0.00..980000.00 rows=50000000)
--   Filter: (user_id = $1)
--
-- Goal: EXPLAIN should show "Index Scan" with cost < 100.

-- Write your CREATE INDEX statements here:
`,
      },
      {
        name: 'schema.sql',
        lang: 'sql',
        readOnly: true,
        code: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- The inbox query (50M row table, no index on user_id):
-- SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;`,
      },
    ],
    objectives: [
      {
        label: 'Create an index on messages.user_id',
        check: { type: 'contains', file: 'add_message_indexes.sql', pattern: 'CREATE INDEX' },
      },
      {
        label: 'Include created_at in a composite index for the ORDER BY',
        check: { type: 'contains', file: 'add_message_indexes.sql', pattern: 'created_at' },
      },
      {
        label: 'Target the messages table',
        check: { type: 'contains', file: 'add_message_indexes.sql', pattern: 'ON messages' },
      },
    ],
    hints: [
      'A single-column index on user_id helps filtering but the ORDER BY created_at DESC still needs sorting.',
      'A composite index on (user_id, created_at DESC) lets Postgres satisfy both the WHERE and ORDER BY with one index scan.',
      'Use `CREATE INDEX CONCURRENTLY` in production to avoid locking the table.',
    ],
    totalTests: 8,
    testFramework: 'pgTAP',
    xp: 250,
    successMessage: `Inbox load time dropped from 8s to 3ms. A composite index on (user_id, created_at DESC) let Postgres skip the table entirely and return 50 rows from the index leaf pages.`,
  },
};

export default challenge;
