import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-014',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Key-Value Store (Redis)',
  companies: ['Amazon', 'Google', 'Microsoft'],
  timeEst: '~50 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a distributed key-value store that supports GET, PUT, DELETE with ' +
    'sub-millisecond latency for 1M RPS. Data must survive server failures and be ' +
    'partitioned across nodes. Support TTL and LRU eviction.',
  solution:
    'Use consistent hashing to distribute keys across nodes — nodes can be added/removed ' +
    'with minimal key reshuffling (only 1/n keys move). Replicate each key to 3 nodes for durability. ' +
    'Use a write-ahead log (WAL) for crash recovery. LRU eviction removes least-recently-used keys ' +
    'when memory is full. A sidecar gossip protocol keeps node membership consistent.',

  simulation: {
    constraints: [
      { label: 'Target RPS', value: '1,000,000' },
      { label: 'p99 latency', value: '< 1ms' },
      { label: 'Replication factor', value: '3' },
      { label: 'Memory per node', value: '64 GB' },
      { label: 'Key size', value: 'avg 64 bytes' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 5,
        successMsg: 'Single-node KV store running. 10k RPS — latency sub-millisecond.',
        failMsg: '[FATAL] No key-value store configured. Connect API Server → In-Memory Store.',
        failNode: 'api_server',
        failTooltip:
          'A single in-memory hash map can handle millions of RPS. ' +
          'The challenge is durability and distribution. Start with a single node.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 2,
        successMsg: 'Consistent hashing active — keys distributed across 5 nodes.',
        failMsg:
          '[OVERLOAD] Single node is out of memory at 100k RPS. ' +
          'Add consistent hashing to distribute keys across multiple nodes.',
        failNode: 'redis',
        failTooltip:
          'Consistent hashing places both nodes and keys on a virtual ring. ' +
          'Each key maps to the nearest node clockwise. Adding a node only moves ~1/n keys.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'cassandra' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 1,
        successMsg: 'SYSTEM STABLE — 1M RPS, 3x replication, node failure handled transparently.',
        failMsg:
          '[FATAL] A node crashed and data is lost. Add a Write-Ahead Log (WAL) for crash recovery.',
        failNode: 'redis',
        failTooltip:
          'A WAL appends every write to disk before acknowledging. ' +
          'On crash recovery, replay the WAL to rebuild in-memory state. ' +
          'Redis uses AOF (Append-Only File) for this purpose.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does consistent hashing minimize key movement when you add or remove a node?',
      hint: 'Compare to naive modulo hashing.',
      answer:
        'Naive hashing: key → node = hash(key) % N. When N changes, almost all keys move. ' +
        'Consistent hashing places nodes on a ring of 2^32 positions. ' +
        'Adding a node only steals keys from the next node clockwise — ~1/N keys move total. ' +
        'Virtual nodes (each physical node owns multiple ring positions) improve load balance.',
    },
    {
      q: 'A client writes a key to node A, then reads it from node B (due to node A going down). Node B hasn\'t replicated yet. What do you return?',
      hint: 'CAP theorem — you can\'t have both consistency and availability under partition.',
      answer:
        'You have a choice: ' +
        '(1) Strong consistency: require all replicas to acknowledge before confirming the write (slow). ' +
        '(2) Eventual consistency: acknowledge write immediately, replicate asynchronously (faster, stale reads possible). ' +
        'Redis Cluster uses eventual consistency by default. ' +
        'Cassandra lets you tune this per-operation with quorum levels (ONE, QUORUM, ALL).',
    },
    {
      q: 'How do you implement TTL (time-to-live) efficiently at scale?',
      hint: 'You can\'t check every key on every request.',
      answer:
        'Two strategies: ' +
        '(1) Lazy expiry: on every read, check if the key\'s TTL has passed — if so, delete and return null. ' +
        '(2) Active expiry: a background thread runs every 100ms and samples random keys — ' +
        'if more than 25% of sampled keys are expired, repeat the scan. ' +
        'Redis uses both: lazy expiry on every access + active expiry in the background.',
    },
    {
      q: 'How does LRU eviction work in a distributed setting? Can you evict a key that\'s popular on one node but unpopular on another?',
      hint: 'Per-node vs global LRU.',
      answer:
        'True global LRU is impractical — it requires coordination across all nodes to track access recency globally. ' +
        'In practice, each node runs LRU independently (per-node LRU). ' +
        'Redis uses an approximation: it samples 5 random keys and evicts the one with the oldest access time. ' +
        'This is O(1) and 95% as effective as true LRU in practice.',
    },
    {
      q: 'How would you support transactions (MULTI/EXEC) in a distributed KV store?',
      hint: 'What happens if keys span multiple nodes?',
      answer:
        'Single-node transactions are simple (optimistic locking + WATCH). ' +
        'Cross-node transactions require 2-phase commit (2PC) or are restricted. ' +
        'Redis Cluster restricts transactions to keys with the same hash slot (use hash tags: {user_id}:key). ' +
        'DynamoDB supports transactions but only within a single region. ' +
        'The common advice: design your data model to avoid cross-node transactions.',
    },
  ],
};

export default challenge;
