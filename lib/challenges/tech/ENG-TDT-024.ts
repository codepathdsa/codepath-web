import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-024',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Pagination on a List Endpoint',
  companies: ['Notion', 'Linear'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A GET /notes endpoint returns all rows with no LIMIT. At 2M rows it times out. Add cursor-based pagination with a `cursor` query param and return a `nextCursor` in the response.',
  solution: 'Add WHERE id > cursor ORDER BY id LIMIT 50 to the query. Return { data: rows, nextCursor: lastRow.id | null } in the response. Validate cursor from query params.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The /notes endpoint was fine for the beta with 500 rows. After launch, power users have 50,000 notes. The endpoint now times out at 30s for them — and returns 50MB JSON payloads to mobile clients.\n\nOffset pagination (LIMIT x OFFSET y) degrades at high offsets because Postgres must scan all skipped rows. Cursor-based pagination reads only the rows you need.\n\nYour mission: add cursor-based pagination to the list endpoint.`,
    folderPath: 'src/routes',
    primaryFile: 'notes.ts',
    files: [
      {
        name: 'notes.ts',
        lang: 'typescript',
        code: `import { Router } from 'express';
import { db } from '../db';

const router = Router();

// TODO: Add cursor-based pagination.
// Query param: cursor (optional, note ID to start after)
// Response: { data: Note[], nextCursor: string | null }
// Page size: 50
router.get('/notes', async (req, res) => {
  const userId = req.user!.id;

  // BUG: Returns ALL notes — no LIMIT
  const notes = await db.query(
    'SELECT * FROM notes WHERE user_id = $1 ORDER BY id ASC',
    [userId]
  );

  res.json(notes.rows);
});

export default router;`,
      },
      {
        name: 'schema.sql',
        lang: 'sql',
        readOnly: true,
        code: `CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notes_user_id_id ON notes(user_id, id);`,
      },
    ],
    objectives: [
      {
        label: 'Add LIMIT 50 to the SQL query',
        check: { type: 'contains', file: 'notes.ts', pattern: 'LIMIT' },
      },
      {
        label: 'Add WHERE id > cursor condition for cursor-based pagination',
        check: { type: 'contains', file: 'notes.ts', pattern: '> $' },
      },
      {
        label: 'Return { data, nextCursor } shape instead of raw array',
        check: { type: 'contains', file: 'notes.ts', pattern: 'nextCursor' },
      },
    ],
    hints: [
      'If `cursor` is provided: `WHERE user_id=$1 AND id > $2 ORDER BY id ASC LIMIT 50`',
      'If no cursor: `WHERE user_id=$1 ORDER BY id ASC LIMIT 50`',
      '`nextCursor = rows.length === 50 ? rows[49].id : null` — if you got fewer than 50 rows, you\'ve reached the end.',
    ],
    totalTests: 16,
    testFramework: 'Jest + Supertest',
    xp: 260,
    successMessage: `The /notes endpoint now returns pages of 50. Mobile clients receive ~10KB instead of 50MB. Fetching each page is O(log n) instead of O(n). Users with 50k notes experience instant loads.`,
  },
};

export default challenge;
