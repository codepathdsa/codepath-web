import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-024',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Google Docs (Real-Time Collaboration)',
  companies: ['Google', 'Notion', 'Figma'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a real-time collaborative document editor like Google Docs. ' +
    'Multiple users can edit the same document simultaneously. ' +
    'Changes from one user must appear on other users\' screens in < 100ms, ' +
    'and the document must remain consistent even with concurrent edits.',
  solution:
    'Operational Transformation (OT) or CRDTs ensure concurrent edits converge to the same document state. ' +
    'Each edit is an "operation" (insert/delete at position). ' +
    'When two operations conflict (same position), OT transforms one against the other. ' +
    'Operations are sent via WebSocket to a central server, which maintains the definitive operation log. ' +
    'All clients converge to the same state by applying operations in the same order.',

  simulation: {
    constraints: [
      { label: 'Concurrent editors/doc', value: 'Up to 200' },
      { label: 'Active documents', value: '50M' },
      { label: 'Edit operations/sec', value: '500k (system-wide)' },
      { label: 'Sync latency', value: '< 100ms' },
      { label: 'History retention', value: 'Full edit history' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 100,
        successMsg: 'Single-user editing — operations persisting and loading correctly.',
        failMsg: '[FATAL] Document changes not persisting. Connect API → Document Store.',
        failNode: 'api_server',
        failTooltip:
          'Store document state as a sequence of operations (operation log) or a snapshot + delta. ' +
          'Cassandra with document_id + operation_id (time-ordered) is ideal for operation logs.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Multi-user sync active — edits from User A appear on User B\'s screen.',
        failMsg:
          '[OUT OF SYNC] Two users typing simultaneously causing document corruption. ' +
          'Implement Operational Transformation to resolve concurrent edits.',
        failNode: 'api_server',
        failTooltip:
          'Scenario: User A inserts "X" at position 5, User B inserts "Y" at position 5 simultaneously. ' +
          'Without OT, both see "XY" or "YX" — diverged state. ' +
          'OT transforms User B\'s operation against User A\'s: shift B\'s insert to position 6.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'client', target: 'api_server' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — 200 concurrent editors per doc, all converging correctly.',
        failMsg:
          '[OVERLOAD] A popular document with 200 simultaneous editors overwhelming a single ' +
          'collaboration server. Add per-document routing to dedicated servers.',
        failNode: 'api_server',
        failTooltip:
          'Each active document is "owned" by one collaboration server (tracked in Redis). ' +
          'All WebSocket connections for that document route to the same server. ' +
          'OT is sequential on that server — no cross-server coordination needed.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is Operational Transformation and why is it needed for collaborative editing?',
      hint: 'Think about two users typing at the same position simultaneously.',
      answer:
        'OT is an algorithm that transforms concurrent operations so they can be applied in any order ' +
        'and still produce the same document. ' +
        'Example: User A inserts "X" at position 5 at time T. User B deletes position 5 at time T. ' +
        'If A\'s operation is applied first, B\'s delete position shifts. OT transforms it. ' +
        'Google Docs uses OT. Figma uses CRDTs (Conflict-free Replicated Data Types) — a simpler ' +
        'alternative that doesn\'t need a central server to coordinate transformations.',
    },
    {
      q: 'How do you implement version history and "restore to version from 3 days ago"?',
      hint: 'Operation log vs snapshots.',
      answer:
        'Store every operation in the operation log (Cassandra: doc_id + op_id + timestamp + operation_data). ' +
        'Restore: replay all operations from the beginning up to the target timestamp. ' +
        'For long documents (millions of ops), take periodic snapshots (every 1000 operations). ' +
        'Restore from nearest snapshot + replay only the ops since that snapshot. ' +
        'Google Docs keeps full history forever — that\'s billions of stored operations.',
    },
    {
      q: 'How do you handle offline editing — a user goes offline for 30 minutes and makes changes?',
      hint: 'The client\'s copy diverges from the server\'s copy.',
      answer:
        'The client stores operations in a local queue. When reconnected, ' +
        'it sends all queued operations with the "base revision" they were applied against. ' +
        'The server replays the OT algorithm to merge the offline ops with the server ops that happened during the outage. ' +
        'With CRDTs, merging is automatic — CRDTs are designed for exactly this scenario. ' +
        'In extreme cases (too many diverged ops), show a merge conflict UI.',
    },
    {
      q: 'How would you scale to 50M simultaneous active documents?',
      hint: 'Most documents have 0 active editors. What do you do with them?',
      answer:
        '50M simultaneous active documents is unrealistic — most documents are dormant. ' +
        'In practice, 1M documents might be active at peak. ' +
        'Use a document routing layer: active documents are loaded into a collaboration server\'s memory. ' +
        'Dormant documents are stored only in Cassandra. When the first user opens a document, ' +
        'load it into an available collaboration server. ' +
        'If a server runs out of memory, evict dormant documents (no active WebSocket connections).',
    },
    {
      q: 'How would you design cursor presence — showing where other users\' cursors are?',
      hint: 'Low-latency, not-durable state.',
      answer:
        'Cursor positions are ephemeral (no need to persist). ' +
        'Each cursor move sends a presence update: {userId, cursorPosition, color}. ' +
        'Broadcast to all other editors in the document via WebSocket. ' +
        'Store presence in Redis (TTL 5 seconds — if no update, user\'s cursor disappears). ' +
        'Don\'t go through the operation log for presence — it\'s a separate lightweight channel.',
    },
  ],
};

export default challenge;
