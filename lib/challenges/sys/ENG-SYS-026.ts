import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-026',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Distributed Lock Service',
  companies: ['Google', 'Apache', 'HashiCorp'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a distributed lock service (like Google Chubby or Apache ZooKeeper). ' +
    'Allow multiple nodes in a cluster to acquire exclusive locks on named resources. ' +
    'Locks must be safe (only one holder at a time), live (no deadlocks), and fault-tolerant ' +
    '(lock service crash doesn\'t corrupt lock state).',
  solution:
    'Use a consensus protocol (Raft) to maintain a replicated lock state across 5 nodes. ' +
    'A lock is a key in a replicated key-value store with a TTL. ' +
    'The client acquires the lock by writing to the Raft leader with a unique token (fencing token). ' +
    'The token is a monotonically increasing number — every lock acquisition has a higher token. ' +
    'Downstream services reject requests with a token lower than the last seen.',

  simulation: {
    constraints: [
      { label: 'Lock service nodes', value: '5 (Raft quorum)' },
      { label: 'Lock operations/sec', value: '10,000' },
      { label: 'Lock TTL range', value: '1 sec – 30 sec' },
      { label: 'Network partition tolerance', value: 'Majority quorum (3/5 nodes)' },
      { label: 'Leader election time', value: '< 1 sec' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 10,
        successMsg: 'Single-node lock service working — locks acquired and released correctly.',
        failMsg: '[FATAL] No lock service configured. Connect API → Lock Service (Redis SETNX).',
        failNode: 'api_server',
        failTooltip:
          'SETNX key token PX 10000: set if not exists, expire in 10 seconds. ' +
          'Returns 1 if acquired, 0 if already held. Atomic — no race condition.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 20,
        successMsg: 'Raft consensus active — lock state replicated across 5 nodes, split-brain prevented.',
        failMsg:
          '[SPLIT BRAIN] Network partition split the cluster into two halves, each granting the same lock.',
        failNode: 'redis',
        failTooltip:
          'A single Redis instance can have split-brain under partition. ' +
          'Raft consensus requires a majority quorum (3/5 nodes) to acquire a lock. ' +
          'In a partition where neither half has majority, no lock can be granted — safe but unavailable.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'cassandra' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 15,
        successMsg: 'SYSTEM STABLE — fencing tokens preventing stale lock holders from corrupting state.',
        failMsg:
          '[STALE LOCK] A lock holder was paused by GC for 15 seconds, TTL expired, ' +
          'another node acquired the lock, but the first node woke up and is still writing.',
        failNode: 'api_server',
        failTooltip:
          'Fencing token solution: each lock acquisition gets a monotonically increasing token (e.g., 42). ' +
          'The protected resource rejects writes with token < current max seen token. ' +
          'The stale client (token 41) will be rejected even after waking from GC pause.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is a fencing token and why is it necessary even with TTL-based locks?',
      hint: 'Consider a process paused by GC or a slow network.',
      answer:
        'TTL locks expire after N seconds to prevent deadlocks. But: ' +
        'Client A acquires lock (token=42, TTL=10s). Client A pauses for 15s (GC). ' +
        'Lock expires. Client B acquires lock (token=43). Client B writes data. ' +
        'Client A wakes up, still believes it holds the lock, and writes — corrupting state. ' +
        'Fencing token: the protected resource tracks the highest seen token. ' +
        'Client A\'s token (42) < current (43) → request rejected. No corruption.',
    },
    {
      q: 'Why does Redis REDLOCK (multi-node Redis lock) have fundamental safety issues?',
      hint: 'Martin Kleppmann vs Antirez — a famous distributed systems debate.',
      answer:
        'REDLOCK acquires locks on 5 independent Redis nodes, requiring 3/5 to succeed. ' +
        'Issue 1: Clock drift — if Redis node clocks differ, TTLs expire at different real times. ' +
        'Issue 2: GC pause — client holds 3/5 locks, gets paused, all 5 TTLs expire, ' +
        'another client acquires 3/5, first client wakes up believing it still holds the lock. ' +
        'Without fencing tokens, REDLOCK is not safe for critical sections. ' +
        'Kleppmann recommends using Raft-based systems (ZooKeeper, etcd) instead.',
    },
    {
      q: 'How does ZooKeeper implement distributed locks using ephemeral znodes?',
      hint: 'Session expiry automatically releases the lock.',
      answer:
        'Client creates an ephemeral sequential znode: /locks/mylock-0000000001. ' +
        'Ephemeral: the node is deleted automatically if the client\'s session ends (crash/disconnect). ' +
        'Sequential: each creation gets a unique monotonically increasing suffix. ' +
        'To acquire: create a sequential znode, list all znodes, check if yours has the lowest number. ' +
        'If yes, you hold the lock. If no, watch the znode just before yours — you\'re in a queue.',
    },
    {
      q: 'What is the difference between a mutex lock and a semaphore, and when would you use each?',
      hint: 'How many concurrent holders are allowed?',
      answer:
        'Mutex (Mutual Exclusion): exactly 1 holder at a time. ' +
        'Used for: protecting a critical resource from concurrent modification. ' +
        'Semaphore: up to N holders simultaneously. ' +
        'Used for: rate limiting concurrent access (e.g., max 10 simultaneous DB connections). ' +
        'Distributed semaphore: Redis counter + DECR/INCR with a Lua script. ' +
        'If counter reaches 0, block until another holder releases (INCRs the counter).',
    },
  ],
};

export default challenge;
