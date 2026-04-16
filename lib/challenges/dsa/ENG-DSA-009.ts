import type { Challenge } from '../types';

// ─── ENG-DSA-009 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-009',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Recommendation Cache — LRU (HashMap + DLL)',
        companies: ['Netflix', 'Spotify'],
        timeEst: '~45 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Linked List', 'Hash Map', 'Caching'],
        nextChallengeId: 'ENG-DSA-010',
        realWorldContext: `Netflix's personalization engine caches pre-computed recommendation lists for each user. The cache has a fixed memory budget — when it's full, the least recently viewed list must be evicted. Both cache reads (get) and writes (put) must be O(1) — any slower and the API latency SLA breaks. This is implemented in production using a HashMap + Doubly Linked List, exactly like this challenge.`,
        desc: 'The personalization API is hitting memory limits. Implement a strict LRU cache where both get() and put() are guaranteed O(1). Evict the least recently used item when capacity is exceeded.',
        whyItMatters: `LRU Cache is the most-asked cache implementation question in system design and coding interviews. Understanding it proves you can reason about data structure composition — how two separately simple structures (HashMap + DLL) combine to achieve properties neither has alone. This exact implementation is also in Python's functools.lru_cache.`,
        approach: `HashMap gives O(1) key lookup. Doubly Linked List gives O(1) node insertion/deletion IF you have a direct reference to the node (not just a value). Combining them: the HashMap maps keys to DLL nodes, giving O(1) lookup AND O(1) move-to-front. Two sentinel nodes (dummy head and tail) eliminate all null pointer edge cases when the list is empty.`,
        solution: 'Combine a HashMap (key → DLL node) for O(1) lookup with a Doubly Linked List for O(1) order updates. Move accessed nodes to the head. Evict from the tail. Sentinel head/tail nodes simplify edge cases.',
        walkthrough: [
            "Initial state: [HEAD] ↔ [TAIL] (sentinels, empty cache)",
            "put('a',1): Create node. Insert after HEAD. cache={'a':node}.[HEAD]↔[a]↔[TAIL]",
            "put('b',2): [HEAD]↔[b]↔[a]↔[TAIL]. 'b' is most recent.",
            "get('a'): Found! Remove 'a' from current position. Insert at front. [HEAD]↔[a]↔[b]↔[TAIL]",
            "put('c',3) with capacity=2: Insert 'c'. Cache over capacity! Evict LRU = tail.prev = 'b'. [HEAD]↔[c]↔[a]↔[TAIL]",
            "get('b') → -1 (evicted) ✓"
        ],
        hints: [
            'A dict alone gives O(1) lookup but not O(1) eviction order. A list gives order but not O(1) lookup. You need both.',
            'Doubly Linked List: moving a node to the front (most recently used) is O(1) if you have the node reference directly.',
            'Use two sentinel nodes as dummy head and tail — this eliminates all null pointer edge cases when removing/inserting.'
        ],
        complexity: { time: 'O(1) get and put', space: 'O(capacity)' },
        starterCode: `class DLLNode:
    def __init__(self, key='', val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache: dict[str, DLLNode] = {}
        # Sentinels eliminate edge cases for empty list
        # head = MRU side (most recently used)
        # tail = LRU side (eviction end)
        self.head, self.tail = DLLNode(), DLLNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: DLLNode):
        """Remove node from its current position in the DLL."""
        node.prev.next = node.next
        node.next.prev = node.prev

    def _insert_front(self, node: DLLNode):
        """Insert node right after the HEAD sentinel (most recently used)."""
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: str) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)       # Remove from current position
        self._insert_front(node) # Re-insert as most recently used
        return node.val

    def put(self, key: str, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])  # Remove stale version
        node = DLLNode(key, value)
        self.cache[key] = node
        self._insert_front(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev          # LRU is just before TAIL sentinel
            self._remove(lru)
            del self.cache[lru.key]
`,
        testCases: [
            { id: 'tc1', description: 'Get from empty cache', input: 'LRUCache(2): get("a")', expected: '-1' },
            { id: 'tc2', description: 'Put then get', input: 'LRUCache(2): put("a",1), get("a")', expected: '1' },
            { id: 'tc3', description: 'Evict LRU on capacity overflow', input: 'LRUCache(2): put("a",1), put("b",2), put("c",3), get("a")', expected: '-1 (a was evicted as LRU)' },
            { id: 'tc4', description: 'Get refreshes recency', input: 'LRUCache(2): put("a",1), put("b",2), get("a"), put("c",3), get("b")', expected: '-1 (b evicted, a was recently accessed)' },
            { id: 'tc5', description: 'Update existing key', input: 'LRUCache(2): put("a",1), put("a",99), get("a")', expected: '99' },
        ],
    };

export default challenge;
