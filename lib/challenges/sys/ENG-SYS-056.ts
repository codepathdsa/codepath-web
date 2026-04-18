import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-056',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Distributed File System (GFS/HDFS)',
  companies: ['Google', 'Meta', 'Apache'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design Google File System (GFS). Store exabytes of data across thousands of commodity machines. ' +
    'Files are split into 64MB chunks, each replicated 3x across different servers. ' +
    'A central master tracks file metadata; chunk servers store actual data. ' +
    'Optimize for sequential reads, large batch appends, and fault tolerance.',
  solution:
    'Master node: stores namespace (file tree) and chunk locations in memory. ' +
    'Chunk servers: store 64MB binary chunks identified by a 64-bit chunk handle. ' +
    'Read: client asks master for chunk locations → master returns 3 replicas → ' +
    'client picks nearest replica and reads directly. No master bottleneck on data path. ' +
    'Write: master designates a primary replica; primary sequences all writes to secondary replicas.',

  simulation: {
    constraints: [
      { label: 'File chunk size', value: '64 MB' },
      { label: 'Replication factor', value: '3x on different racks' },
      { label: 'Master metadata memory', value: '~64 bytes per chunk' },
      { label: 'Chunk server count', value: '~1000-10000' },
      { label: 'Failure rate', value: '~1 server/day at 1000-node scale' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 200,
        successMsg: 'File reads working — client fetching chunks from chunk servers directly.',
        failMsg: '[FATAL] File reads failing. Implement master metadata + chunk server data path.',
        failNode: 'api_server',
        failTooltip:
          'Two-phase read: ' +
          '(1) Client → Master: "Give me chunk locations for file X, offset Y." ' +
          '(2) Master returns: chunk_handle, [chunk_server_A, chunk_server_B, chunk_server_C]. ' +
          '(3) Client reads directly from nearest chunk server — bypasses master for data.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Write pipeline working — primary-secondary replication chain.',
        failMsg:
          '[WRITE CONFLICT] Two clients writing to the same file region simultaneously corrupting data.',
        failNode: 'api_server',
        failTooltip:
          'GFS write pipeline: ' +
          'Master grants a lease to one chunk server (the "primary"). Lease lasts 60 seconds. ' +
          'Client sends data to all 3 replicas (chained pipeline: A → B → C). ' +
          'Client sends write command to primary; primary assigns sequence number and forwards to secondaries. ' +
          'Only one primary at a time — prevents write conflicts.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 's3' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — GFS running at scale with chunk re-replication after failures.',
        failMsg:
          '[CHUNK SERVER FAILURE] 3 chunk servers failed in the same rack — one chunk has 0 replicas!',
        failNode: 'worker',
        failTooltip:
          'Rack-aware replication: ' +
          'Place 3 replicas on at least 2 different racks. ' +
          'Rule: 1 replica in rack A (local write performance), 2 replicas in rack B (rack-level fault tolerance). ' +
          'Heartbeat: chunk servers send heartbeat to master every 3 seconds. ' +
          'After 3 missed heartbeats: master marks chunk server dead, re-replicates all its chunks.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Why does GFS use a 64MB chunk size? What are the trade-offs of large vs small chunks?',
      hint: 'Master memory, small file overhead, and fragmentation.',
      answer:
        'Large chunks (64MB): ' +
        'Pros: reduces master metadata size (1 entry per chunk vs. many), ' +
        'fewer client-master interactions for sequential reads, ' +
        'reduces fragmentation for large files. ' +
        'Cons: small files (< 64MB) waste space; ' +
        'hot spots if many clients read the same small file (all hitting the same 1-3 chunk servers). ' +
        'HDFS uses 128MB-256MB chunks. ' +
        'Local file systems use 4KB blocks — tuned for random access rather than streaming.',
    },
    {
      q: 'The master is a single node. How do you prevent it from becoming a bottleneck or single point of failure?',
      hint: 'Master only handles metadata, not data. Shadow master.',
      answer:
        'Master is not on the data path — it only handles metadata lookups. ' +
        'Clients cache chunk locations (for 60 seconds) so repeated reads don\'t hit the master. ' +
        'Master keeps all metadata in memory (fast). ' +
        'For durability: master writes all metadata mutations to an operation log (append-only on disk). ' +
        'Periodically creates checkpoints. ' +
        'Shadow master: a read-only replica that replays the operation log. ' +
        'On master failure: shadow master can serve read-only requests immediately; ' +
        'full failover in ~30 seconds.',
    },
    {
      q: 'How does GFS handle concurrent appends from multiple clients to the same file (record append)?',
      hint: 'GFS defines "at-least-once" append semantics.',
      answer:
        'GFS atomic record append: client specifies the data, not the offset. ' +
        'The primary picks the next available offset that fits the data. ' +
        'If the primary pushes to secondaries and one fails: ' +
        '- Failed secondary\'s chunk may have less data (missing the last append). ' +
        '- The primary retries the append. ' +
        '- Result: the successful secondaries may have the data twice (duplicate). ' +
        'GFS guarantees at-least-once, not exactly-once. ' +
        'Applications must handle duplicates (use record checksums or de-dup on read).',
    },
    {
      q: 'GFS is optimized for sequential reads. How does it differ from a file system optimized for random access?',
      hint: 'Access patterns, caching, and chunk size.',
      answer:
        'GFS/HDFS assumptions: workloads are MapReduce-style batch jobs that read entire files sequentially. ' +
        'Optimizations: large chunks (64MB), sequential prefetch, no client-side write cache. ' +
        'Random-access workload: requires small block sizes (4KB), ' +
        'fine-grained caching (OS page cache), and low-latency seeks. ' +
        'GFS does not cache data on the client — ' +
        'each MapReduce task reads different chunks, so caching wouldn\'t help. ' +
        'For random-access file workloads: use Ceph, POSIX-compliant distributed file systems, or object storage (S3).',
    },
  ],
};

export default challenge;
