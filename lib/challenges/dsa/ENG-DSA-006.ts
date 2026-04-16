import type { Challenge } from '../types';

// ─── ENG-DSA-006 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-006',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Hash Ring — Consistent Hashing (Binary Search)',
        companies: ['Amazon', 'Cloudflare'],
        timeEst: '~45 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Binary Search', 'Hashing', 'Distributed Systems'],
        nextChallengeId: 'ENG-DSA-007',
        realWorldContext: `Amazon's ElastiCache team uses consistent hashing to distribute cache keys across Redis nodes. The classic problem: with regular modular hashing (key % N), adding a new server remaps ~83% of keys, causing a massive cache stampede. Consistent hashing reduces remapping to ~1/N of keys. This is how DynamoDB, Cassandra, and Riak distribute data.`,
        desc: 'Building a distributed Redis cache. When a node is added, map user IDs to servers using Consistent Hashing so only 1/N of keys need remapping. Implement the lookup algorithm.',
        whyItMatters: `Consistent hashing is the backbone of every distributed storage system at scale. Understanding it is mandatory for senior/staff engineering interviews at any company running distributed infrastructure. The virtual nodes concept is what makes real-world implementations like Cassandra avoid "hotspot" servers.`,
        approach: `Picture a clock (number ring from 0 to 2^32). Hash each server to a position on the clock and mark it. To look up a key: hash the key to a position, then walk clockwise until you hit a server. Sorted arrays + binary search implement this efficiently. Virtual nodes (multiple hash positions per server) ensure even distribution.`,
        solution: 'Hash servers and keys onto a virtual ring (sorted array). For a key, binary search for the first server hash >= key hash. Wrap to index 0 if key hash exceeds all server hashes.',
        walkthrough: [
            "Add servers: hash('s1:vnode:0'), hash('s1:vnode:1'), ... for all virtual nodes",
            "sorted_keys =[1024, 5039, 8192, 12000, ...] (sorted hashes on ring)",
            "Lookup 'user-42': h = hash('user-42') = 6000",
            "bisect_right(sorted_keys, 6000) → finds index of first key > 6000",
            "If index == len(sorted_keys), wrap to index 0 (the ring wraps around)",
            "Return ring[sorted_keys[index]] → the owning server"
        ],
        hints: [
            'Hash each server to a position on a number line 0..2^32. Sort these positions. This is the "ring".',
            "To find which server owns a key: hash the key, then binary search the sorted list for the first server position that is >= key's hash.",
            'If the key hash is larger than all server hashes, wrap around — return servers[0]. This simulates the circular ring nature.'
        ],
        complexity: { time: 'O(log N) lookup, O(V log V) build', space: 'O(V*N)' },
        starterCode: `import hashlib
import bisect

class ConsistentHashRing:
    def __init__(self, servers: list[str], virtual_nodes: int = 100):
        self.vnodes = virtual_nodes
        self.ring: dict[int, str] = {}        # hash → server
        self.sorted_keys: list[int] =[]      # sorted hash list
        for server in servers:
            self.add_server(server)

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_server(self, server: str):
        """Place server on ring via multiple virtual node hashes.
        More virtual nodes = better distribution across the ring."""
        for i in range(self.vnodes):
            h = self._hash(f"{server}:vnode:{i}")
            self.ring[h] = server
            bisect.insort(self.sorted_keys, h)

    def get_server(self, user_id: str) -> str:
        """Return the server responsible for user_id.
        Walk clockwise on the ring to find the next server."""
        if not self.ring:
            raise Exception('No servers in ring')
        h = self._hash(user_id)
        # Find first server position >= h, wrapping around
        idx = bisect.bisect_right(self.sorted_keys, h) % len(self.sorted_keys)
        return self.ring[self.sorted_keys[idx]]
`,
        testCases: [
            { id: 'tc1', description: 'Key always maps to a server', input: "ring(['s1','s2','s3']): get_server('user-42')", expected: 'One of: s1, s2, s3' },
            { id: 'tc2', description: 'Same key always returns same server', input: "get_server('user-42') called twice", expected: 'Same server both times (deterministic)' },
            { id: 'tc3', description: 'Different keys spread across servers', input: "get_server('alice'), get_server('bob'), get_server('carol')", expected: 'Not all the same server (distribution)' },
            { id: 'tc4', description: 'Adding server only remaps ~1/N keys', input: 'ring with 3 servers, add 4th server', expected: '~25% of keys remapped (not all)' },
            { id: 'tc5', description: 'Single server gets all keys', input: "ring(['only-server']): get_server('anything')", expected: 'only-server' },
        ],
    };

export default challenge;
