// ─── Mastery Codex — Creature Registry ──────────────────────────────────────
// Every creature maps to a real engineering skill domain.
// Progression: base → evolved → final (solve 3 related challenges to evolve).
// Shiny = perfect run (100% score + under time limit).

export type CreatureStage = 1 | 2 | 3;
export type CreatureDomain =
  | 'caching'
  | 'database'
  | 'concurrency'
  | 'distributed'
  | 'performance'
  | 'security'
  | 'architecture'
  | 'reliability'
  | 'messaging'
  | 'code-quality';

export interface Creature {
  id: string;
  name: string;
  domain: CreatureDomain;
  description: string;          // flavour text — what real skill this represents
  icon: string;                 // emoji used as placeholder (will be SVG later)
  color: string;                // accent color for this creature's glow
  stage: CreatureStage;         // 1 = base, 2 = evolved, 3 = final form
  evolvesFrom?: string;         // creature id it evolved from
  evolvesTo?: string;           // creature id it evolves into
  challengeIds: string[];       // challenges that can award this creature
  xpValue: number;              // XP bonus when captured
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface CodexCategory {
  id: string;
  name: string;
  domain: CreatureDomain;
  description: string;
  color: string;      // CSS var reference
  borderColor: string;
  glowColor: string;
  creatureIds: string[];
}

// ─── Creature Definitions ────────────────────────────────────────────────────

export const CREATURES: Creature[] = [
  // ── Caching Domain ──────────────────────────────────────────────────────
  {
    id: 'cache-miss',
    name: 'Cache Miss',
    domain: 'caching',
    description: 'Appears when a cache lookup fails, forcing a slow DB hit. The first form of cache ignorance.',
    icon: '🌀',
    color: '#3b82f6',
    stage: 1,
    evolvesTo: 'cache-stampede',
    challengeIds: ['ENG-DSA-001', 'ENG-DSA-012'],
    xpValue: 50,
    rarity: 'common',
  },
  {
    id: 'cache-stampede',
    name: 'Cache Stampede',
    domain: 'caching',
    description: 'Born when a cache expires and thousands of requests flood the database simultaneously.',
    icon: '⚡',
    color: '#3b82f6',
    stage: 2,
    evolvesFrom: 'cache-miss',
    evolvesTo: 'cache-hydra',
    challengeIds: ['ENG-WAR-003', 'ENG-DSA-022'],
    xpValue: 120,
    rarity: 'uncommon',
  },
  {
    id: 'cache-hydra',
    name: 'Cache Hydra',
    domain: 'caching',
    description: 'Final form. A distributed caching master — Redis cluster topology, eviction policies, TTL strategy. Unstoppable.',
    icon: '🐉',
    color: '#3b82f6',
    stage: 3,
    evolvesFrom: 'cache-stampede',
    challengeIds: ['ENG-WAR-007', 'ENG-DSA-031'],
    xpValue: 300,
    rarity: 'rare',
  },

  // ── Database Domain ──────────────────────────────────────────────────────
  {
    id: 'n1-phantom',
    name: 'N+1 Phantom',
    domain: 'database',
    description: 'Haunts every ORM. Invisible in code review, catastrophic in production at scale.',
    icon: '👻',
    color: '#f59e0b',
    stage: 1,
    evolvesTo: 'query-wraith',
    challengeIds: ['ENG-PR-001', 'ENG-PR-005'],
    xpValue: 50,
    rarity: 'common',
  },
  {
    id: 'query-wraith',
    name: 'Query Wraith',
    domain: 'database',
    description: 'A rogue query that brings the DB to its knees. Missing indexes, full table scans, lock contention.',
    icon: '💀',
    color: '#f59e0b',
    stage: 2,
    evolvesFrom: 'n1-phantom',
    evolvesTo: 'index-titan',
    challengeIds: ['ENG-PR-003', 'ENG-DSA-042'],
    xpValue: 120,
    rarity: 'uncommon',
  },
  {
    id: 'index-titan',
    name: 'Index Titan',
    domain: 'database',
    description: 'Final form. Masters of query optimization, sharding strategy, and read replica routing.',
    icon: '🗿',
    color: '#f59e0b',
    stage: 3,
    evolvesFrom: 'query-wraith',
    challengeIds: ['ENG-DSA-055', 'ENG-WAR-009'],
    xpValue: 300,
    rarity: 'rare',
  },

  // ── Concurrency Domain ───────────────────────────────────────────────────
  {
    id: 'deadlock-specter',
    name: 'Deadlock Specter',
    domain: 'concurrency',
    description: 'Two threads waiting on each other forever. The classic. The unavoidable. The humbling.',
    icon: '🔒',
    color: '#8b5cf6',
    stage: 1,
    evolvesTo: 'mutex-ghost',
    challengeIds: ['ENG-PR-004', 'ENG-DSA-018'],
    xpValue: 60,
    rarity: 'common',
  },
  {
    id: 'mutex-ghost',
    name: 'Mutex Ghost',
    domain: 'concurrency',
    description: 'Lurks in race conditions, goroutine leaks, and forgotten unlock() calls.',
    icon: '🕯️',
    color: '#8b5cf6',
    stage: 2,
    evolvesFrom: 'deadlock-specter',
    evolvesTo: 'concurrency-lord',
    challengeIds: ['ENG-PR-007', 'ENG-WAR-004'],
    xpValue: 140,
    rarity: 'uncommon',
  },
  {
    id: 'concurrency-lord',
    name: 'Concurrency Lord',
    domain: 'concurrency',
    description: 'Final form. Tames goroutines, async/await patterns, actor models, and lock-free data structures.',
    icon: '⚔️',
    color: '#8b5cf6',
    stage: 3,
    evolvesFrom: 'mutex-ghost',
    challengeIds: ['ENG-DSA-060', 'ENG-WAR-011'],
    xpValue: 320,
    rarity: 'rare',
  },

  // ── Distributed Systems Domain ───────────────────────────────────────────
  {
    id: 'split-brain-horror',
    name: 'Split Brain Horror',
    domain: 'distributed',
    description: 'Two nodes that think they are the leader. The network partition that breaks everything.',
    icon: '🧠',
    color: '#ef4444',
    stage: 1,
    evolvesTo: 'partition-phantom',
    challengeIds: ['ENG-WAR-002', 'ENG-WAR-006'],
    xpValue: 80,
    rarity: 'uncommon',
  },
  {
    id: 'partition-phantom',
    name: 'Partition Phantom',
    domain: 'distributed',
    description: 'CAP theorem made flesh. Forces you to choose between consistency and availability.',
    icon: '🌐',
    color: '#ef4444',
    stage: 2,
    evolvesFrom: 'split-brain-horror',
    evolvesTo: 'consensus-oracle',
    challengeIds: ['ENG-SYS-003', 'ENG-WAR-008'],
    xpValue: 180,
    rarity: 'rare',
  },
  {
    id: 'consensus-oracle',
    name: 'Consensus Oracle',
    domain: 'distributed',
    description: 'Final form. Raft, Paxos, and distributed consensus are second nature. True Staff-level mastery.',
    icon: '🔮',
    color: '#ef4444',
    stage: 3,
    evolvesFrom: 'partition-phantom',
    challengeIds: ['ENG-SYS-007', 'ENG-WAR-013'],
    xpValue: 500,
    rarity: 'legendary',
  },

  // ── Performance Domain ───────────────────────────────────────────────────
  {
    id: 'memory-leak-ooze',
    name: 'Memory Leak Ooze',
    domain: 'performance',
    description: 'Slowly grows until the heap explodes. Unclosed connections, forgotten event listeners, circular refs.',
    icon: '🫧',
    color: '#10b981',
    stage: 1,
    evolvesTo: 'heap-blob',
    challengeIds: ['ENG-PR-002', 'ENG-DSA-005'],
    xpValue: 50,
    rarity: 'common',
  },
  {
    id: 'heap-blob',
    name: 'Heap Blob',
    domain: 'performance',
    description: 'A massive in-memory data structure that should never have existed. GC pressure incarnate.',
    icon: '🟢',
    color: '#10b981',
    stage: 2,
    evolvesFrom: 'memory-leak-ooze',
    evolvesTo: 'gc-overlord',
    challengeIds: ['ENG-WAR-005', 'ENG-DSA-028'],
    xpValue: 130,
    rarity: 'uncommon',
  },
  {
    id: 'gc-overlord',
    name: 'GC Overlord',
    domain: 'performance',
    description: 'Final form. Profiling, heap analysis, Object pooling and zero-allocation patterns mastered.',
    icon: '♻️',
    color: '#10b981',
    stage: 3,
    evolvesFrom: 'heap-blob',
    challengeIds: ['ENG-DSA-058', 'ENG-WAR-010'],
    xpValue: 280,
    rarity: 'rare',
  },

  // ── Security Domain ──────────────────────────────────────────────────────
  {
    id: 'sql-ghost',
    name: 'SQL Ghost',
    domain: 'security',
    description: 'Hides in unparameterized queries. Slips through string concatenation. Classic. Deadly.',
    icon: '💉',
    color: '#f43f5e',
    stage: 1,
    evolvesTo: 'injection-wraith',
    challengeIds: ['ENG-PR-003', 'ENG-DSA-008'],
    xpValue: 70,
    rarity: 'common',
  },
  {
    id: 'injection-wraith',
    name: 'Injection Wraith',
    domain: 'security',
    description: 'Beyond SQL — command injection, XSS, SSTI. All input is hostile.',
    icon: '🩸',
    color: '#f43f5e',
    stage: 2,
    evolvesFrom: 'sql-ghost',
    evolvesTo: 'security-sentinel',
    challengeIds: ['ENG-PR-008', 'ENG-DSA-025'],
    xpValue: 160,
    rarity: 'uncommon',
  },
  {
    id: 'security-sentinel',
    name: 'Security Sentinel',
    domain: 'security',
    description: 'Final form. Zero Trust, OWASP Top 10, auth flows, and threat modeling are second nature.',
    icon: '🛡️',
    color: '#f43f5e',
    stage: 3,
    evolvesFrom: 'injection-wraith',
    challengeIds: ['ENG-SYS-005', 'ENG-WAR-012'],
    xpValue: 340,
    rarity: 'rare',
  },

  // ── Architecture Domain ──────────────────────────────────────────────────
  {
    id: 'spaghetti-hatchling',
    name: 'Spaghetti Hatchling',
    domain: 'architecture',
    description: 'Born in rushed sprints. Functions that do 12 things. Files that should be 4 modules.',
    icon: '🍝',
    color: '#f97316',
    stage: 1,
    evolvesTo: 'god-class-beast',
    challengeIds: ['ENG-TEC-001', 'ENG-TEC-002'],
    xpValue: 60,
    rarity: 'common',
  },
  {
    id: 'god-class-beast',
    name: 'God Class Beast',
    domain: 'architecture',
    description: 'One class that knows everything, does everything, controls everything. The God Object anti-pattern.',
    icon: '🐙',
    color: '#f97316',
    stage: 2,
    evolvesFrom: 'spaghetti-hatchling',
    evolvesTo: 'clean-code-phoenix',
    challengeIds: ['ENG-TEC-003', 'ENG-TEC-004'],
    xpValue: 150,
    rarity: 'uncommon',
  },
  {
    id: 'clean-code-phoenix',
    name: 'Clean Code Phoenix',
    domain: 'architecture',
    description: 'Final form. Rises from the ashes of tech debt. SOLID principles, DDD, clean architecture mastered.',
    icon: '🦅',
    color: '#f97316',
    stage: 3,
    evolvesFrom: 'god-class-beast',
    challengeIds: ['ENG-TEC-005', 'ENG-TEC-006'],
    xpValue: 360,
    rarity: 'rare',
  },

  // ── Reliability Domain ───────────────────────────────────────────────────
  {
    id: '502-hydra',
    name: '502 Hydra',
    domain: 'reliability',
    description: 'Cut off one bad gateway and two more appear. Load balancer misconfiguration. Health check failures.',
    icon: '🔥',
    color: '#ef4444',
    stage: 1,
    evolvesTo: 'gateway-kraken',
    challengeIds: ['ENG-WAR-001', 'ENG-WAR-002'],
    xpValue: 75,
    rarity: 'common',
  },
  {
    id: 'gateway-kraken',
    name: 'Gateway Kraken',
    domain: 'reliability',
    description: 'A cascading failure that takes down entire services. Circuit breakers, retries, timeouts — all needed.',
    icon: '🦑',
    color: '#ef4444',
    stage: 2,
    evolvesFrom: '502-hydra',
    evolvesTo: 'uptime-titan',
    challengeIds: ['ENG-WAR-005', 'ENG-WAR-006'],
    xpValue: 175,
    rarity: 'uncommon',
  },
  {
    id: 'uptime-titan',
    name: 'Uptime Titan',
    domain: 'reliability',
    description: 'Final form. SRE principles embodied. SLOs, error budgets, chaos engineering, blameless post-mortems.',
    icon: '🏔️',
    color: '#ef4444',
    stage: 3,
    evolvesFrom: 'gateway-kraken',
    challengeIds: ['ENG-SYS-006', 'ENG-WAR-014'],
    xpValue: 400,
    rarity: 'legendary',
  },

  // ── Messaging Domain ─────────────────────────────────────────────────────
  {
    id: 'kafka-poison-pill',
    name: 'Kafka Poison Pill',
    domain: 'messaging',
    description: 'A malformed message that causes the consumer to crash, retry, crash, retry — forever.',
    icon: '💊',
    color: '#6366f1',
    stage: 1,
    evolvesTo: 'dead-letter-shade',
    challengeIds: ['ENG-WAR-004', 'ENG-DSA-033'],
    xpValue: 80,
    rarity: 'uncommon',
  },
  {
    id: 'dead-letter-shade',
    name: 'Dead Letter Shade',
    domain: 'messaging',
    description: 'Failed messages that pile up in the DLQ, unprocessed, forgotten. A ghost in the queue.',
    icon: '📬',
    color: '#6366f1',
    stage: 2,
    evolvesFrom: 'kafka-poison-pill',
    evolvesTo: 'stream-master',
    challengeIds: ['ENG-DSA-044', 'ENG-WAR-009'],
    xpValue: 190,
    rarity: 'rare',
  },
  {
    id: 'stream-master',
    name: 'Stream Master',
    domain: 'messaging',
    description: 'Final form. Kafka partitioning strategy, consumer group rebalancing, exactly-once semantics — mastered.',
    icon: '🌊',
    color: '#6366f1',
    stage: 3,
    evolvesFrom: 'dead-letter-shade',
    challengeIds: ['ENG-SYS-004', 'ENG-WAR-015'],
    xpValue: 420,
    rarity: 'legendary',
  },

  // ── Code Quality Domain ──────────────────────────────────────────────────
  {
    id: 'null-gremlin',
    name: 'Null Gremlin',
    domain: 'code-quality',
    description: 'The simplest horror. Null references, undefined access, missing validation. Billion-dollar mistake.',
    icon: '😈',
    color: '#14b8a6',
    stage: 1,
    evolvesTo: 'exception-imp',
    challengeIds: ['ENG-PR-005', 'ENG-DSA-002'],
    xpValue: 40,
    rarity: 'common',
  },
  {
    id: 'exception-imp',
    name: 'Exception Imp',
    domain: 'code-quality',
    description: 'Unhandled errors, swallowed exceptions, and silent failures that corrupt data quietly.',
    icon: '🔕',
    color: '#14b8a6',
    stage: 2,
    evolvesFrom: 'null-gremlin',
    evolvesTo: 'fault-guardian',
    challengeIds: ['ENG-PR-006', 'ENG-DSA-019'],
    xpValue: 110,
    rarity: 'uncommon',
  },
  {
    id: 'fault-guardian',
    name: 'Fault Guardian',
    domain: 'code-quality',
    description: 'Final form. Defensive code, graceful degradation, bulkhead patterns, and total error visibility.',
    icon: '🧿',
    color: '#14b8a6',
    stage: 3,
    evolvesFrom: 'exception-imp',
    challengeIds: ['ENG-DSA-052', 'ENG-WAR-016'],
    xpValue: 260,
    rarity: 'rare',
  },

  // ── Special / Referral ───────────────────────────────────────────────────
  {
    id: 'the-recruiter',
    name: 'The Recruiter',
    domain: 'code-quality',
    description: 'Cannot be captured. Only earned by bringing another engineer into the guild. Loyalty rewarded.',
    icon: '🤝',
    color: '#62de61',
    stage: 1,
    challengeIds: [],
    xpValue: 200,
    rarity: 'legendary',
  },
];

// ─── Category Definitions ────────────────────────────────────────────────────

export const CODEX_CATEGORIES: CodexCategory[] = [
  {
    id: 'caching',
    name: 'Caching',
    domain: 'caching',
    description: 'Redis, Memcached, TTL strategy, eviction, and distributed cache coherence.',
    color: '#3b82f6',
    borderColor: 'rgba(59,130,246,0.25)',
    glowColor: 'rgba(59,130,246,0.12)',
    creatureIds: ['cache-miss', 'cache-stampede', 'cache-hydra'],
  },
  {
    id: 'database',
    name: 'Database',
    domain: 'database',
    description: 'Query optimization, indexing, transactions, sharding, and replication.',
    color: '#f59e0b',
    borderColor: 'rgba(245,158,11,0.25)',
    glowColor: 'rgba(245,158,11,0.12)',
    creatureIds: ['n1-phantom', 'query-wraith', 'index-titan'],
  },
  {
    id: 'concurrency',
    name: 'Concurrency',
    domain: 'concurrency',
    description: 'Threads, locks, race conditions, atomic operations, and async patterns.',
    color: '#8b5cf6',
    borderColor: 'rgba(139,92,246,0.25)',
    glowColor: 'rgba(139,92,246,0.12)',
    creatureIds: ['deadlock-specter', 'mutex-ghost', 'concurrency-lord'],
  },
  {
    id: 'distributed',
    name: 'Distributed Systems',
    domain: 'distributed',
    description: 'CAP theorem, consensus, network partitions, and distributed coordination.',
    color: '#ef4444',
    borderColor: 'rgba(239,68,68,0.25)',
    glowColor: 'rgba(239,68,68,0.12)',
    creatureIds: ['split-brain-horror', 'partition-phantom', 'consensus-oracle'],
  },
  {
    id: 'performance',
    name: 'Performance',
    domain: 'performance',
    description: 'Memory management, profiling, GC tuning, and zero-allocation patterns.',
    color: '#10b981',
    borderColor: 'rgba(16,185,129,0.25)',
    glowColor: 'rgba(16,185,129,0.12)',
    creatureIds: ['memory-leak-ooze', 'heap-blob', 'gc-overlord'],
  },
  {
    id: 'security',
    name: 'Security',
    domain: 'security',
    description: 'OWASP Top 10, injection attacks, authentication, and Zero Trust.',
    color: '#f43f5e',
    borderColor: 'rgba(244,63,94,0.25)',
    glowColor: 'rgba(244,63,94,0.12)',
    creatureIds: ['sql-ghost', 'injection-wraith', 'security-sentinel'],
  },
  {
    id: 'architecture',
    name: 'Architecture',
    domain: 'architecture',
    description: 'SOLID principles, DDD, microservices, and refactoring patterns.',
    color: '#f97316',
    borderColor: 'rgba(249,115,22,0.25)',
    glowColor: 'rgba(249,115,22,0.12)',
    creatureIds: ['spaghetti-hatchling', 'god-class-beast', 'clean-code-phoenix'],
  },
  {
    id: 'reliability',
    name: 'Reliability',
    domain: 'reliability',
    description: 'SRE, SLOs, circuit breakers, chaos engineering, and incident response.',
    color: '#ef4444',
    borderColor: 'rgba(239,68,68,0.25)',
    glowColor: 'rgba(239,68,68,0.12)',
    creatureIds: ['502-hydra', 'gateway-kraken', 'uptime-titan'],
  },
  {
    id: 'messaging',
    name: 'Messaging',
    domain: 'messaging',
    description: 'Kafka, queues, dead letter handling, and event-driven architectures.',
    color: '#6366f1',
    borderColor: 'rgba(99,102,241,0.25)',
    glowColor: 'rgba(99,102,241,0.12)',
    creatureIds: ['kafka-poison-pill', 'dead-letter-shade', 'stream-master'],
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    domain: 'code-quality',
    description: 'Error handling, defensive coding, testing, and fault tolerance.',
    color: '#14b8a6',
    borderColor: 'rgba(20,184,166,0.25)',
    glowColor: 'rgba(20,184,166,0.12)',
    creatureIds: ['null-gremlin', 'exception-imp', 'fault-guardian'],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const CREATURES_BY_ID: Record<string, Creature> = Object.fromEntries(
  CREATURES.map(c => [c.id, c])
);

export const CATEGORIES_BY_ID: Record<string, CodexCategory> = Object.fromEntries(
  CODEX_CATEGORIES.map(c => [c.id, c])
);

export const TOTAL_CREATURES = CREATURES.length;

// No mock data needed anymore, dynamically fetched from supabase

export function getCategoryProgress(categoryId: string, captured: Set<string>) {
  const cat = CATEGORIES_BY_ID[categoryId];
  if (!cat) return { captured: 0, total: 0, pct: 0 };
  const capturedCount = cat.creatureIds.filter(id => captured.has(id)).length;
  return {
    captured: capturedCount,
    total: cat.creatureIds.length,
    pct: Math.round((capturedCount / cat.creatureIds.length) * 100),
  };
}

// Returns the creature awarded by completing a given challenge ID.
// Falls back to a random common creature so there's always a reward.
export function getCreatureForChallenge(challengeId: string): Creature {
  const match = CREATURES.find(c => c.challengeIds.includes(challengeId));
  if (match) return match;
  // Deterministic fallback: pick based on challengeId hash
  const idx = challengeId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % CREATURES.length;
  return CREATURES[idx];
}
