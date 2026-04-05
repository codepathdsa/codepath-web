import { Challenge } from './types';

export const dsaChallenges: Challenge[] = [
    {
        id: 'ENG-DSA-001',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Payment System Double-Billing (Array)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'SDE I',
        status: 'Not Started',
        topics: ['Arrays', 'Hash Set', 'Cycle Detection'],
        nextChallengeId: 'ENG-DSA-002',
        desc: 'Finance flagged that 3 customers were charged twice. The transaction log array has N+1 items in range [1..N], containing exactly one duplicate ID. Find it in O(n) time and O(1) space.',
        solution: "Use Floyd's Tortoise and Hare (Cycle Detection). Treat array values as pointers. Phase 1: advance slow by 1, fast by 2 until they meet. Phase 2: reset slow to nums[0], advance both by 1 until they meet — that's the duplicate.",
        hints: [
            'A Set can detect duplicates in O(n) time — but O(n) space. Can you do better?',
            'Try treating the array values as pointers to indices. If value = 3, jump to index 3. A duplicate creates a cycle.',
            "Floyd's Cycle Detection: two pointers (slow = next, fast = next→next) will meet at a cycle intersection. Then reset slow to start and advance both by 1 to find the cycle entrance."
        ],
        starterCode: `def find_duplicate(nums: list[int]) -> int:
    """
    Given array of n+1 integers where each value is in [1..n],
    find the one duplicate. O(n) time, O(1) space required.
    """
    # Phase 1: Find intersection point using Floyd's cycle detection
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break

    # Phase 2: Find the cycle entrance (= duplicate)
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]

    return slow
`,
        testCases: [
            { id: 'tc1', description: 'Basic case', input: 'nums = [1, 3, 4, 2, 2]', expected: '2' },
            { id: 'tc2', description: 'Duplicate is 3', input: 'nums = [3, 1, 3, 4, 2]', expected: '3' },
            { id: 'tc3', description: 'Duplicate at boundaries', input: 'nums = [1, 4, 6, 3, 1, 2, 5]', expected: '1' },
            { id: 'tc4', description: 'Small array', input: 'nums = [2, 2, 1]', expected: '2' },
            { id: 'tc5', description: 'Large N constraint', input: 'nums = [2,5,9,6,9,3,8,9,7,1]', expected: '9' },
        ],
    },
    {
        id: 'ENG-DSA-002',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Merge Overlapping Server Downtimes (Intervals)',
        companies: ['Datadog', 'AWS'],
        timeEst: '~25 min',
        level: 'SDE I',
        status: 'Not Started',
        topics: ['Arrays', 'Sorting', 'Intervals'],
        nextChallengeId: 'ENG-DSA-003',
        desc: 'We are calculating our SLA uptime. We have a list of server outage intervals [start, end]. Many overlap. Merge all overlapping downtimes to calculate total true downtime.',
        solution: 'Sort intervals by start_time. Iterate, maintaining a current interval. If next.start <= current.end, they overlap — update current.end = max(current.end, next.end). Otherwise, push current and start a new one.',
        hints: [
            'Before you can merge, you need to sort. What should you sort by?',
            'After sorting by start time, two intervals [a,b] and [c,d] overlap if c <= b.',
            "When they overlap, the merged interval's end is max(b, d) — not just d — because one can be fully contained inside the other."
        ],
        starterCode: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """
    Merge all overlapping outage windows.
    Input:  [[1,4],[2,6],[8,10],[15,18]]
    Output: [[1,6],[8,10],[15,18]]
    """
    if not intervals:
        return []

    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:  # overlapping
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return merged
`,
        testCases: [
            { id: 'tc1', description: 'Classic overlap', input: 'intervals = [[1,4],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
            { id: 'tc2', description: 'Full containment', input: 'intervals = [[1,10],[2,6],[3,5]]', expected: '[[1,10]]' },
            { id: 'tc3', description: 'No overlaps', input: 'intervals = [[1,2],[3,4],[5,6]]', expected: '[[1,2],[3,4],[5,6]]' },
            { id: 'tc4', description: 'Adjacent intervals', input: 'intervals = [[1,4],[4,6]]', expected: '[[1,6]]' },
            { id: 'tc5', description: 'Single interval', input: 'intervals = [[1,5]]', expected: '[[1,5]]' },
        ],
    },
    {
        id: 'ENG-DSA-003',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'API Rate Limiter — Sliding Window (Queue)',
        companies: ['Discord', 'Slack'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Deque', 'Sliding Window', 'System Design'],
        nextChallengeId: 'ENG-DSA-004',
        desc: 'Bots are bypassing our Fixed Window rate limiter by bursting at 11:59:59 and 12:00:01. Implement a Sliding Window Log rate limiter. Each call to is_allowed(timestamp) returns True/False.',
        solution: 'Store request timestamps in a deque. On each call: pop timestamps older than (now - window). If len(deque) < max_requests, allow and append timestamp. Else, deny.',
        hints: [
            'A fixed window resets every N seconds. A sliding window looks back exactly N seconds from NOW.',
            'Use a queue/deque to store timestamps. On each request, remove entries older than (timestamp - window_size).',
            'After pruning old entries: if len(queue) < limit, allow the request and append the timestamp. Otherwise deny it.'
        ],
        starterCode: `from collections import deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.log: deque = deque()

    def is_allowed(self, timestamp: float) -> bool:
        """
        Returns True if request at 'timestamp' is within the rate limit.
        Cleans up entries older than the window automatically.
        """
        # 1. Remove timestamps outside the sliding window
        while self.log and self.log[0] <= timestamp - self.window:
            self.log.popleft()

        # 2. Check and record
        if len(self.log) < self.max_requests:
            self.log.append(timestamp)
            return True
        return False
`,
        testCases: [
            { id: 'tc1', description: 'Basic allow within limit', input: 'limiter(3, 10): is_allowed(1), is_allowed(2), is_allowed(3)', expected: 'True, True, True' },
            { id: 'tc2', description: 'Deny on 4th request', input: 'limiter(3, 10): is_allowed(1), is_allowed(2), is_allowed(3), is_allowed(4)', expected: 'True, True, True, False' },
            { id: 'tc3', description: 'Allow after window expires', input: 'limiter(2, 5): is_allowed(1), is_allowed(2), is_allowed(7)', expected: 'True, True, True' },
            { id: 'tc4', description: 'Burst at boundary (the fixed-window exploit)', input: 'limiter(3, 10): is_allowed(9), is_allowed(10), is_allowed(11), is_allowed(12)', expected: 'True, True, True, False' },
            { id: 'tc5', description: 'Single request always allowed', input: 'limiter(1, 10): is_allowed(0), is_allowed(11)', expected: 'True, True' },
        ],
    },
    {
        id: 'ENG-DSA-004',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'CI/CD Pipeline Dependency Resolution (Graphs)',
        companies: ['GitLab', 'Vercel'],
        timeEst: '~40 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Graphs', 'Topological Sort', 'BFS'],
        nextChallengeId: 'ENG-DSA-005',
        desc: 'Our monorepo build system fails because packages depend on each other. Given packages and dependency pairs (A depends on B), return a valid build order. Raise an error if circular dependency exists.',
        solution: "Kahn's Algorithm: Build in-degree map and adjacency list. Enqueue nodes with in-degree 0. Process queue: for each node, decrement neighbors' in-degrees; if 0, enqueue. If total processed < total nodes, a cycle exists.",
        hints: [
            'Think of dependencies as a directed graph. "A depends on B" means an edge B → A (B must come first).',
            "In-degree = number of dependencies a package has. Start with packages that have zero dependencies (in-degree = 0).",
            "After processing a node, reduce its dependents' in-degree. If any reach 0, they're ready to build. If processed count ≠ total nodes at the end, there's a cycle."
        ],
        starterCode: `from collections import deque, defaultdict

def find_build_order(packages: list[str], deps: list[tuple[str,str]]) -> list[str]:
    """
    deps: list of (dependent, dependency) pairs
    e.g. ('app', 'utils') means utils must build before app.
    Returns a valid build order or raises ValueError on cycle.
    """
    in_degree = {p: 0 for p in packages}
    graph = defaultdict(list)  # dependency -> [dependents]

    for dependent, dependency in deps:
        graph[dependency].append(dependent)
        in_degree[dependent] += 1

    queue = deque([p for p in packages if in_degree[p] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(packages):
        raise ValueError('Circular dependency detected')
    return order
`,
        testCases: [
            { id: 'tc1', description: 'Linear chain', input: "pkgs=['A','B','C'], deps=[('B','A'),('C','B')]", expected: "['A','B','C']" },
            { id: 'tc2', description: 'No dependencies', input: "pkgs=['X','Y','Z'], deps=[]", expected: 'Any order of X, Y, Z' },
            { id: 'tc3', description: 'Diamond dependency', input: "pkgs=['core','utils','api','app'], deps=[('utils','core'),('api','core'),('app','utils'),('app','api')]", expected: "['core','utils','api','app'] or similar valid order" },
            { id: 'tc4', description: 'Circular dependency raises error', input: "pkgs=['A','B','C'], deps=[('A','B'),('B','C'),('C','A')]", expected: 'ValueError: Circular dependency detected' },
            { id: 'tc5', description: 'Single package', input: "pkgs=['solo'], deps=[]", expected: "['solo']" },
        ],
    },
    {
        id: 'ENG-DSA-005',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Live Stock Ticker — Top K Volatile (Heaps)',
        companies: ['Robinhood', 'Citadel'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Heaps', 'Priority Queue', 'Streaming'],
        nextChallengeId: 'ENG-DSA-006',
        desc: 'The trading dashboard gets sluggish updating the Top-K Most Volatile Stocks from 10,000 updates/sec. Return the top k entries from the stream in O(N log K) time.',
        solution: 'Maintain a min-heap of size K. For each new item: if heap size < K, push it. Else if item score > heap root, pop the min and push the new one. Final heap contains top-K.',
        hints: [
            'Sorting the entire stream is O(N log N). You only need the top K — there is a faster way.',
            'A min-heap of size K lets you keep track of the K largest items seen so far. The root is always the smallest of your top-K candidates.',
            'If a new stock score > heap root: the root is no longer in top-K. Pop it and push the newcomer. Otherwise ignore. At the end, your heap IS the top-K.'
        ],
        starterCode: `import heapq

def top_k_volatile(stream: list[tuple[str, float]], k: int) -> list[tuple[str, float]]:
    """
    stream: list of (ticker, volatility_score)
    Returns the k highest-volatility stocks.
    O(N log K) time, O(K) space.
    """
    # Min-heap of (score, ticker) so root = lowest score in top-K
    min_heap: list[tuple[float, str]] = []

    for ticker, score in stream:
        if len(min_heap) < k:
            heapq.heappush(min_heap, (score, ticker))
        elif score > min_heap[0][0]:
            heapq.heapreplace(min_heap, (score, ticker))

    return [(ticker, score) for score, ticker in min_heap]
`,
        testCases: [
            { id: 'tc1', description: 'Top 2 from 5 stocks', input: "stream=[('AAPL',2.1),('TSLA',9.4),('GME',15.2),('AMD',3.3),('NVDA',7.8)], k=2", expected: "[('GME',15.2),('NVDA',7.8)] (any order)" },
            { id: 'tc2', description: 'K equals stream length', input: "stream=[('A',1.0),('B',2.0)], k=2", expected: "[('A',1.0),('B',2.0)]" },
            { id: 'tc3', description: 'Top 1 only', input: "stream=[('X',5.0),('Y',3.0),('Z',8.0)], k=1", expected: "[('Z',8.0)]" },
            { id: 'tc4', description: 'Duplicate scores', input: "stream=[('A',5.0),('B',5.0),('C',5.0)], k=2", expected: 'Any 2 of A, B, C (scores equal)' },
            { id: 'tc5', description: 'Already sorted input', input: "stream=[('A',1),('B',2),('C',3),('D',4),('E',5)], k=3", expected: "C, D, E (scores 3,4,5)" },
        ],
    },
    {
        id: 'ENG-DSA-006',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Hash Ring — Consistent Hashing (Binary Search)',
        companies: ['Amazon', 'Cloudflare'],
        timeEst: '~45 min',
        level: 'SDE III',
        status: 'Not Started',
        topics: ['Binary Search', 'Hashing', 'Distributed Systems'],
        nextChallengeId: 'ENG-DSA-007',
        desc: 'Building a distributed Redis cache. When a node is added, map user IDs to servers using Consistent Hashing so only 1/N of keys need remapping. Implement the lookup algorithm.',
        solution: 'Hash servers and keys onto a virtual ring (sorted array). For a key, binary search for the first server hash >= key hash. Wrap to index 0 if key hash exceeds all server hashes.',
        hints: [
            'Hash each server to a position on a number line 0..2^32. Sort these positions. This is the "ring".',
            "To find which server owns a key: hash the key, then binary search the sorted list for the first server position that is >= key's hash.",
            'If the key hash is larger than all server hashes, wrap around — return servers[0]. This simulates the circular ring nature.'
        ],
        starterCode: `import hashlib
import bisect

class ConsistentHashRing:
    def __init__(self, servers: list[str], virtual_nodes: int = 100):
        self.vnodes = virtual_nodes
        self.ring: dict[int, str] = {}        # hash → server
        self.sorted_keys: list[int] = []      # sorted hash list
        for server in servers:
            self.add_server(server)

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_server(self, server: str):
        """Place server on ring via multiple virtual node hashes."""
        for i in range(self.vnodes):
            h = self._hash(f"{server}:vnode:{i}")
            self.ring[h] = server
            bisect.insort(self.sorted_keys, h)

    def get_server(self, user_id: str) -> str:
        """Return the server responsible for user_id."""
        if not self.ring:
            raise Exception('No servers in ring')
        h = self._hash(user_id)
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
    },
    {
        id: 'ENG-DSA-007',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Driver-Rider Proximity Matching (K-D Tree)',
        companies: ['Uber', 'Lyft'],
        timeEst: '~50 min',
        level: 'SDE III',
        status: 'Not Started',
        topics: ['Trees', 'Spatial Indexing', 'Divide & Conquer'],
        nextChallengeId: 'ENG-DSA-008',
        desc: "Given millions of active driver GPS coordinates, find the 5 closest to a rider's location in sub-millisecond time. Brute-force O(N) scan is too slow at scale.",
        solution: 'Build a K-D Tree: recursively partition 2D space by alternating lat/lng axes, splitting at the median. Query by traversing down the tree, pruning branches whose bounding box is farther than the current best K neighbors.',
        hints: [
            'A K-D Tree recursively divides 2D space. At depth 0 split by x (lat), depth 1 by y (lng), and so on.',
            'Sort points by the current axis, use the median as the split point, recurse on left and right halves.',
            'When searching for nearest neighbors, maintain a max-heap of size K. Prune subtrees whose closest possible point exceeds the Kth-best distance so far.'
        ],
        starterCode: `import heapq
from typing import Optional

class KDNode:
    def __init__(self, point: tuple, left=None, right=None):
        self.point = point; self.left = left; self.right = right

def build_kdtree(points: list[tuple], depth: int = 0) -> Optional[KDNode]:
    """Build a 2D K-D Tree from (lat, lng) driver positions."""
    if not points:
        return None
    axis = depth % 2
    points = sorted(points, key=lambda p: p[axis])
    mid = len(points) // 2
    return KDNode(
        points[mid],
        build_kdtree(points[:mid], depth + 1),
        build_kdtree(points[mid + 1:], depth + 1)
    )

def euclidean(a: tuple, b: tuple) -> float:
    return ((a[0]-b[0])**2 + (a[1]-b[1])**2) ** 0.5

def find_k_nearest(root: Optional[KDNode], target: tuple, k: int) -> list[tuple]:
    """Return k nearest points to target using K-D Tree traversal."""
    best = []  # max-heap: (-dist, point)

    def search(node: Optional[KDNode], depth: int):
        if node is None:
            return
        dist = euclidean(node.point, target)
        if len(best) < k:
            heapq.heappush(best, (-dist, node.point))
        elif dist < -best[0][0]:
            heapq.heapreplace(best, (-dist, node.point))

        axis = depth % 2
        diff = target[axis] - node.point[axis]
        close, away = (node.left, node.right) if diff < 0 else (node.right, node.left)

        search(close, depth + 1)
        if len(best) < k or abs(diff) < -best[0][0]:
            search(away, depth + 1)

    search(root, 0)
    return [p for _, p in best]
`,
        testCases: [
            { id: 'tc1', description: 'Nearest 1 of 3 points', input: 'points=[(1,1),(5,5),(2,2)], target=(1.5,1.5), k=1', expected: '(1,1) or (2,2)' },
            { id: 'tc2', description: 'Nearest 2 drivers', input: 'points=[(0,0),(3,3),(6,6),(1,0)], target=(0,0), k=2', expected: '(0,0) and (1,0)' },
            { id: 'tc3', description: 'Single point in tree', input: 'points=[(4,4)], target=(0,0), k=1', expected: '(4,4)' },
            { id: 'tc4', description: 'K equals total drivers', input: 'points=[(1,1),(2,2),(3,3)], target=(0,0), k=3', expected: 'All 3 points returned' },
            { id: 'tc5', description: 'Target is a driver location', input: 'points=[(0,0),(1,1),(2,2)], target=(1,1), k=1', expected: '(1,1)' },
        ],
    },
    {
        id: 'ENG-DSA-008',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Fraud Ring Detection (Union-Find)',
        companies: ['Coinbase', 'Plaid'],
        timeEst: '~40 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Union-Find', 'Disjoint Sets', 'Graphs'],
        nextChallengeId: 'ENG-DSA-009',
        desc: "Compromised accounts form closed trading rings to bypass AML alerts. Given a stream of transactions (userA, userB), use Union-Find to detect when a ring is formed (i.e., A and B are already in the same connected component).",
        solution: 'Union-Find with path compression. find(x) returns the root of x\'s component. union(a,b): if find(a)==find(b), a cycle/ring is detected. Otherwise, merge their components.',
        hints: [
            'Model accounts as nodes and transactions as edges. A fraud ring = a cycle in the graph.',
            'Union-Find (Disjoint Set): find(x) gives the root of x\'s group. If find(A) == find(B) before adding edge A-B, it creates a cycle.',
            'Path compression in find(): point every node directly to its root on the way back. This makes future finds nearly O(1).'
        ],
        starterCode: `class FraudDetector:
    """Detects closed trading rings using Union-Find with path compression."""

    def __init__(self):
        self.parent: dict[str, str] = {}

    def find(self, x: str) -> str:
        if x not in self.parent:
            self.parent[x] = x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a: str, b: str) -> bool:
        """
        Returns True if a ring is detected (a and b already connected).
        Otherwise merges their groups and returns False.
        """
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return True  # RING DETECTED
        self.parent[ra] = rb
        return False

    def process(self, transactions: list[tuple[str, str]]) -> list[tuple[str, str]]:
        """Return list of (a, b) transactions that completed a fraud ring."""
        rings = []
        for a, b in transactions:
            if self.union(a, b):
                rings.append((a, b))
        return rings
`,
        testCases: [
            { id: 'tc1', description: 'Simple ring: A→B, B→C, C→A', input: "transactions=[('A','B'),('B','C'),('C','A')]", expected: "[('C','A')] — the ring-closing tx" },
            { id: 'tc2', description: 'No ring', input: "transactions=[('A','B'),('C','D'),('E','F')]", expected: '[] (no rings)' },
            { id: 'tc3', description: 'Self-transaction is a ring', input: "transactions=[('A','A')]", expected: "[('A','A')]" },
            { id: 'tc4', description: 'Multiple independent rings', input: "transactions=[('A','B'),('B','A'),('C','D'),('D','C')]", expected: "[('B','A'),('D','C')]" },
            { id: 'tc5', description: 'Long chain before ring closes', input: "transactions=[('A','B'),('B','C'),('C','D'),('D','E'),('E','A')]", expected: "[('E','A')]" },
        ],
    },
    {
        id: 'ENG-DSA-009',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Recommendation Cache — LRU (HashMap + DLL)',
        companies: ['Netflix', 'Spotify'],
        timeEst: '~45 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Linked List', 'Hash Map', 'Caching'],
        nextChallengeId: 'ENG-DSA-010',
        desc: 'The personalization API is hitting memory limits. Implement a strict LRU cache where both get() and put() are guaranteed O(1). Evict the least recently used item when capacity is exceeded.',
        solution: 'Combine a HashMap (key → DLL node) for O(1) lookup with a Doubly Linked List for O(1) order updates. Move accessed nodes to the head. Evict from the tail. Sentinel head/tail nodes simplify edge cases.',
        hints: [
            'A dict alone gives O(1) lookup but not O(1) eviction order. A list gives order but not O(1) lookup. You need both.',
            'Doubly Linked List: moving a node to the front (most recently used) is O(1) if you have the node reference directly.',
            'Use two sentinel nodes as dummy head and tail — this eliminates all null pointer edge cases when removing/inserting.'
        ],
        starterCode: `class DLLNode:
    def __init__(self, key='', val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache: dict[str, DLLNode] = {}
        # Sentinels: head = MRU side, tail = LRU/eviction side
        self.head, self.tail = DLLNode(), DLLNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: DLLNode):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _insert_front(self, node: DLLNode):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: str) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._insert_front(node)
        return node.val

    def put(self, key: str, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = DLLNode(key, value)
        self.cache[key] = node
        self._insert_front(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
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
    },
    {
        id: 'ENG-DSA-010',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Log Stream Pattern Search (Aho-Corasick)',
        companies: ['Elastic', 'Splunk'],
        timeEst: '~60 min',
        level: 'Staff',
        status: 'Not Started',
        topics: ['Trie', 'String Matching', 'Automata'],
        nextChallengeId: undefined,
        desc: "Scan a live 5 GB/s log stream for 10,000 banned IPs simultaneously. Running 10,000 separate regex scans pegs CPU at 100%. Build an Aho-Corasick automaton to search all patterns in a single O(N) pass.",
        solution: 'Build a Trie from all 10,000 patterns. Add BFS-computed failure links so when a partial match fails, you transition to the longest proper suffix that IS a state in the Trie. Then scan the text in a single pass using goto/fail transitions.',
        hints: [
            'A regular Trie finds single patterns fast. Aho-Corasick extends it to find ALL patterns simultaneously by adding "failure links".',
            'Failure link for state S = the longest proper suffix of the string ending at S that is also a valid Trie prefix. Compute these via BFS from the root.',
            'When scanning: follow goto links on match. On mismatch, follow the failure link (not back to root) — this avoids re-scanning characters and achieves O(N) total search time.'
        ],
        starterCode: `from collections import deque

class AhoCorasick:
    """Multi-pattern search: build once, scan in O(N) per log line."""

    def __init__(self):
        self.goto = [{}]   # goto[state][char] = next_state
        self.fail = [0]    # failure function
        self.out = [[]]    # out[state] = matched patterns

    def build(self, patterns: list[str]):
        """Phase 1: insert all patterns into the trie."""
        for pattern in patterns:
            state = 0
            for ch in pattern:
                if ch not in self.goto[state]:
                    self.goto.append({})
                    self.fail.append(0)
                    self.out.append([])
                    self.goto[state][ch] = len(self.goto) - 1
                state = self.goto[state][ch]
            self.out[state].append(pattern)

        """Phase 2: compute failure links via BFS."""
        q = deque()
        for ch, s in self.goto[0].items():
            self.fail[s] = 0
            q.append(s)
        while q:
            r = q.popleft()
            for ch, s in self.goto[r].items():
                q.append(s)
                state = self.fail[r]
                while state and ch not in self.goto[state]:
                    state = self.fail[state]
                self.fail[s] = self.goto[state].get(ch, 0)
                if self.fail[s] == s:
                    self.fail[s] = 0
                self.out[s] += self.out[self.fail[s]]

    def search(self, text: str) -> list[tuple[int, str]]:
        """Scan text in O(N), return (end_index, pattern) for all matches."""
        results = []
        state = 0
        for i, ch in enumerate(text):
            while state and ch not in self.goto[state]:
                state = self.fail[state]
            state = self.goto[state].get(ch, 0)
            for pattern in self.out[state]:
                results.append((i - len(pattern) + 1, pattern))
        return results
`,
        testCases: [
            { id: 'tc1', description: 'Single pattern found', input: "patterns=['10.0.0.1'], text='request from 10.0.0.1 at port 443'", expected: "[(13, '10.0.0.1')]" },
            { id: 'tc2', description: 'Multiple patterns in one scan', input: "patterns=['192.168.1.1','10.0.0.1'], text='blocked 10.0.0.1 and 192.168.1.1'", expected: '2 matches found' },
            { id: 'tc3', description: 'Pattern not in text', input: "patterns=['1.2.3.4'], text='no match here'", expected: '[] (empty)' },
            { id: 'tc4', description: 'Overlapping prefix patterns', input: "patterns=['he','she','his','hers'], text='ushers'", expected: "matches for 'he','she','hers'" },
            { id: 'tc5', description: 'Empty text', input: "patterns=['abc'], text=''", expected: '[] (empty)' },
        ],
    },
    // ======================================
    // BATCH 2: Challenges 11 - 25
    // ======================================
    {
        id: 'ENG-DSA-011',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Ledger Reconciliation (Two Pointers)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'SDE I',
        status: 'Not Started',
        topics: ['Two Pointers', 'Arrays', 'Math'],
        nextChallengeId: 'ENG-DSA-012',
        desc: 'Finance is running a daily reconciliation job. We have a sorted array of transaction amounts. Find if there are two distinct transactions that sum exactly to our daily target discrepancy. Return their indices.',
        solution: 'Because the array is already sorted, use the Two Pointers technique. Place one pointer at the start and one at the end. If their sum is greater than the target, decrement the right pointer. If less, increment the left. Runs in O(n) time and O(1) space.',
        hints: [
            'Since the array is sorted, you do not need an O(n) space Hash Map to solve this.',
            'What happens to the total sum if you move the rightmost pointer one step to the left?',
            'Initialize left = 0, right = len(nums) - 1. Loop while left < right. Adjust pointers based on how the sum compares to the target.'
        ],
        starterCode: `def find_reconciliation_pair(transactions: list[int], target: int) -> list[int]:
    """
    transactions: sorted list of integers
    target: the discrepancy amount we are looking for
    Returns [index1, index2] of the two transactions, or [] if none exist.
    """
    left = 0
    right = len(transactions) - 1
    
    while left < right:
        current_sum = transactions[left] + transactions[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
            
    return []
`,
        testCases: [
            { id: 'tc1', description: 'Basic match', input: 'transactions=[10, 20, 30, 40, 50], target=70', expected: '[1, 4] (20+50) or [2,3] (30+40)' },
            { id: 'tc2', description: 'No match', input: 'transactions=[5, 10, 15, 20], target=100', expected: '[]' },
            { id: 'tc3', description: 'Negative values in ledger', input: 'transactions=[-50, -10, 20, 40], target=-30', expected: '[0, 2]' },
            { id: 'tc4', description: 'Adjacent numbers', input: 'transactions=[1, 2, 3, 4, 5], target=3', expected: '[0, 1]' },
            { id: 'tc5', description: 'Empty array', input: 'transactions=[], target=10', expected: '[]' },
        ],
    },
    {
        id: 'ENG-DSA-012',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Webhook JSON Payload Validator (Stack)',
        companies: ['Plaid', 'Twilio'],
        timeEst: '~20 min',
        level: 'SDE I',
        status: 'Not Started',
        topics: ['Stacks', 'Strings'],
        nextChallengeId: 'ENG-DSA-013',
        desc: 'Our webhook ingestion endpoint is crashing because a third-party partner is sending malformed nested JSON/XML strings. Write a fast validator to ensure all opening brackets ({, [, <, () are properly closed in the correct order.',
        solution: 'Use a Stack. Iterate through the characters. If it is an opening bracket, push it to the stack. If it is a closing bracket, pop from the stack and verify it matches the corresponding opening bracket. If the stack is empty at the end, it is valid.',
        hints: [
            'A stack is the perfect data structure for LIFO (Last-In-First-Out) operations, which is exactly how nested brackets work.',
            'Use a dictionary/hash map to store the matching pairs: { "}": "{", "]": "[", ")": "(", ">": "<" }.',
            'Watch out for edge cases: what if the string starts with a closing bracket? What if the stack isn\'t empty at the very end?'
        ],
        starterCode: `def is_valid_payload(payload: str) -> bool:
    """
    Checks if brackets in the payload string are properly closed.
    Supported brackets: (), {}, [], <>
    """
    stack = []
    mapping = {')': '(', '}': '{', ']': '[', '>': '<'}
    
    for char in payload:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping.keys():
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
            
    return len(stack) == 0
`,
        testCases: [
            { id: 'tc1', description: 'Valid nested JSON', input: 'payload="{[<>()]}"', expected: 'True' },
            { id: 'tc2', description: 'Invalid closing order', input: 'payload="{[}]"', expected: 'False' },
            { id: 'tc3', description: 'Missing closing bracket', input: 'payload="{"', expected: 'False' },
            { id: 'tc4', description: 'Starts with closing bracket', input: 'payload="}{"', expected: 'False' },
            { id: 'tc5', description: 'String with text inside', input: 'payload="{ user: [1, 2, (3)] }"', expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-013',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Git Bisect Memory Leak (Binary Search)',
        companies: ['GitHub', 'GitLab'],
        timeEst: '~25 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Binary Search'],
        nextChallengeId: 'ENG-DSA-014',
        desc: 'A massive memory leak was introduced somewhere in the last 10,000 commits. Running the test suite takes 10 minutes per commit, so testing chronologically will take days. Given an API function `is_bad_commit(id)`, find the exact first commit that introduced the bug efficiently.',
        solution: 'Use Binary Search to minimize API calls. Find the midpoint commit. If it is bad, the bug was introduced at or before this point, so move the right pointer to mid. If it is good, the bug was introduced after, so move the left pointer to mid + 1.',
        hints: [
            'This is exactly how `git bisect` works under the hood. It turns an O(n) search into O(log n).',
            'If commit 500 is BAD, it means the bug was introduced somewhere between commit 1 and 500.',
            'Unlike standard binary search, you don\'t return early when you find a BAD commit. You must find the *first* BAD commit, meaning you keep searching the left half.'
        ],
        starterCode: `def is_bad_commit(commit_id: int) -> bool:
    # This is a mock API provided by the platform.
    # Returns True if the memory leak exists in this commit.
    pass

def find_first_bad_commit(n: int) -> int:
    """
    n: Total number of commits [1, 2, ..., n]
    Returns the ID of the first bad commit.
    """
    left = 1
    right = n
    
    while left < right:
        mid = left + (right - left) // 2
        if is_bad_commit(mid):
            # The bug is at mid or earlier
            right = mid
        else:
            # The bug was introduced after mid
            left = mid + 1
            
    return left
`,
        testCases: [
            { id: 'tc1', description: 'Bug in middle', input: 'n=10, bad=5', expected: '5' },
            { id: 'tc2', description: 'Bug is very first commit', input: 'n=100, bad=1', expected: '1' },
            { id: 'tc3', description: 'Bug is the very last commit', input: 'n=1000, bad=1000', expected: '1000' },
            { id: 'tc4', description: 'Only one commit total', input: 'n=1, bad=1', expected: '1' },
            { id: 'tc5', description: 'Massive scale', input: 'n=2147483647, bad=1500000', expected: '1500000' },
        ],
    },
    {
        id: 'ENG-DSA-014',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Peak Error Rate (Sliding Window)',
        companies: ['Datadog', 'New Relic'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Sliding Window', 'Arrays'],
        nextChallengeId: 'ENG-DSA-015',
        desc: 'You have an array representing the number of HTTP 500 errors logged per minute. Find the continuous K-minute window that had the highest total number of errors, and return that maximum sum.',
        solution: 'Use a Fixed Sliding Window. Calculate the sum of the first K elements. Then, slide the window by 1: add the new element entering the window and subtract the old element leaving the window. Keep track of the max sum. O(n) time.',
        hints: [
            'Recalculating the sum of K elements from scratch for every minute takes O(n * k) time. Avoid this.',
            'When the window shifts from [index 0 to 4] to [index 1 to 5], the only things that change are: you lose index 0 and gain index 5.',
            'current_sum = current_sum - errors[i - k] + errors[i]. Update max_sum on every step.'
        ],
        starterCode: `def max_error_window(errors: list[int], k: int) -> int:
    """
    errors: array of error counts per minute
    k: size of the time window
    Returns the maximum sum of errors in any continuous k-minute window.
    """
    if not errors or k <= 0 or k > len(errors):
        return 0
        
    # Calculate initial window
    current_sum = sum(errors[:k])
    max_sum = current_sum
    
    # Slide the window
    for i in range(k, len(errors)):
        current_sum = current_sum - errors[i - k] + errors[i]
        max_sum = max(max_sum, current_sum)
        
    return max_sum
`,
        testCases: [
            { id: 'tc1', description: 'Normal array', input: 'errors=[2, 1, 5, 1, 3, 2], k=3', expected: '9 (from 1,5,3)' },
            { id: 'tc2', description: 'K equals array length', input: 'errors=[1, 2, 3], k=3', expected: '6' },
            { id: 'tc3', description: 'Decreasing errors', input: 'errors=[100, 50, 10, 5, 1], k=2', expected: '150 (from 100,50)' },
            { id: 'tc4', description: 'Zero errors', input: 'errors=[0, 0, 0, 0], k=2', expected: '0' },
            { id: 'tc5', description: 'Spike at the end', input: 'errors=[1, 1, 1, 1, 100], k=2', expected: '101' },
        ],
    },
    {
        id: 'ENG-DSA-015',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Microservice Blast Radius (Graph BFS)',
        companies: ['Netflix', 'Uber'],
        timeEst: '~35 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Graphs', 'BFS', 'Hash Map'],
        nextChallengeId: 'ENG-DSA-016',
        desc: 'A critical vulnerability was found in the "Auth" microservice. We have a graph representing which microservices depend on which others. Calculate the total number of services affected (the blast radius) if "Auth" goes down.',
        solution: 'This is a Graph traversal problem. Build an adjacency list representing the dependencies. Use Breadth-First Search (BFS) starting from the compromised service. Maintain a `visited` set to avoid infinite loops from circular dependencies. Return the size of the visited set.',
        hints: [
            'If A depends on B, and B depends on C, then if C fails, A and B both fail.',
            'Use a queue (deque) to perform Breadth-First Search. Start by pushing the compromised service onto the queue.',
            'Microservices often have circular dependencies (A -> B -> A). You MUST use a `visited` Set to avoid infinite loops.'
        ],
        starterCode: `from collections import deque, defaultdict

def calculate_blast_radius(dependencies: list[tuple[str, str]], compromised_svc: str) -> int:
    """
    dependencies: list of (Dependent, Dependency) pairs. 
                  e.g., ("Cart", "Auth") means Cart depends on Auth.
    Returns the total number of services affected, including the compromised one.
    """
    # Build adjacency list: Dependency -> [List of Dependents]
    graph = defaultdict(list)
    for dependent, dependency in dependencies:
        graph[dependency].append(dependent)
        
    # BFS
    queue = deque([compromised_svc])
    visited = set([compromised_svc])
    
    while queue:
        current = queue.popleft()
        for dependent in graph[current]:
            if dependent not in visited:
                visited.add(dependent)
                queue.append(dependent)
                
    return len(visited)
`,
        testCases: [
            { id: 'tc1', description: 'Linear cascade', input: 'deps=[("A","B"),("B","C")], compromised="C"', expected: '3 (C affects B, B affects A)' },
            { id: 'tc2', description: 'No dependents', input: 'deps=[("A","B"),("C","D")], compromised="A"', expected: '1 (Only A)' },
            { id: 'tc3', description: 'Circular dependencies', input: 'deps=[("A","B"),("B","A")], compromised="A"', expected: '2' },
            { id: 'tc4', description: 'Hub and spoke', input: 'deps=[("A","Auth"),("B","Auth"),("C","Auth")], compromised="Auth"', expected: '4' },
            { id: 'tc5', description: 'Service not in graph', input: 'deps=[("A","B")], compromised="X"', expected: '1 (Just X itself)' },
        ],
    },
    {
        id: 'ENG-DSA-016',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'AWS Lambda Job Packing (DP / Knapsack)',
        companies: ['AWS', 'Vercel'],
        timeEst: '~45 min',
        level: 'SDE III',
        status: 'Not Started',
        topics: ['Dynamic Programming', '0/1 Knapsack'],
        nextChallengeId: 'ENG-DSA-017',
        desc: 'We rent AWS Lambda instances with a maximum RAM capacity of M MB. We have a queue of background jobs, each requiring a specific amount of RAM and yielding a specific priority score. Pick the optimal subset of jobs to run on a single Lambda to maximize the priority score without exceeding M.',
        solution: 'This is the classic 0/1 Knapsack problem. Create a 2D DP array `dp[i][w]` representing the max priority using the first `i` jobs and `w` RAM. If `weights[i] <= w`, take `max(dp[i-1][w], values[i] + dp[i-1][w-weights[i]])`. Return `dp[n][M]`.',
        hints: [
            'A greedy approach (sorting by priority/RAM ratio) will fail for 0/1 packing. You must use Dynamic Programming.',
            'Create a 2D array: `dp[jobs + 1][capacity + 1]` initialized to 0.',
            'For each job, you have two choices: include it (if it fits) or exclude it. Take the max of both options.'
        ],
        starterCode: `def maximize_priority(ram_costs: list[int], priorities: list[int], max_ram: int) -> int:
    """
    ram_costs: MB required for each job
    priorities: Score for completing the job
    max_ram: Capacity of the Lambda instance
    Returns the maximum priority score achievable.
    """
    n = len(ram_costs)
    # dp[i][w] = max priority using first i jobs with w capacity
    dp = [[0] * (max_ram + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        cost = ram_costs[i - 1]
        score = priorities[i - 1]
        
        for w in range(1, max_ram + 1):
            if cost <= w:
                # Max of including the job vs excluding it
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - cost] + score)
            else:
                # Job doesn't fit, carry over previous max
                dp[i][w] = dp[i - 1][w]
                
    return dp[n][max_ram]
`,
        testCases: [
            { id: 'tc1', description: 'Standard packing', input: 'costs=[10, 20, 30], priorities=[60, 100, 120], max_ram=50', expected: '220 (Jobs 2 and 3)' },
            { id: 'tc2', description: 'Item too big', input: 'costs=[100], priorities=[500], max_ram=50', expected: '0' },
            { id: 'tc3', description: 'Greedy fails here', input: 'costs=[5, 5, 5], priorities=[10, 10, 10], max_ram=10', expected: '20' },
            { id: 'tc4', description: 'Exact fit', input: 'costs=[1, 2, 3], priorities=[1, 2, 3], max_ram=6', expected: '6' },
            { id: 'tc5', description: 'Empty queues', input: 'costs=[], priorities=[], max_ram=10', expected: '0' },
        ],
    },
    {
        id: 'ENG-DSA-017',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Concurrent WebSocket Connections (Sweep Line)',
        companies: ['Discord', 'Slack'],
        timeEst: '~40 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Arrays', 'Sorting', 'Sweep Line'],
        nextChallengeId: 'ENG-DSA-018',
        desc: 'To properly auto-scale our socket servers, we need to find the historical peak traffic. Given a list of user session logs `[login_time, logout_time]`, determine the maximum number of concurrent active WebSockets at any given moment.',
        solution: 'Use the Sweep Line algorithm. Separate all logs into two events: `(login_time, +1)` and `(logout_time, -1)`. Sort all events by time. If times are equal, process logouts (-1) before logins (+1) to avoid overcounting. Iterate through, keeping a running sum, and track the maximum.',
        hints: [
            'Comparing every interval against every other interval takes O(n^2). We can do this in O(n log n).',
            'Think of this as people entering and leaving a room. You just need to sort the door events chronologically and count the people inside.',
            'Edge Case: If User A logs out at time 5, and User B logs in at time 5, do they overlap? Usually, process the logout first.'
        ],
        starterCode: `def max_concurrent_sockets(sessions: list[list[int]]) -> int:
    """
    sessions: list of [login_time, logout_time]
    Returns the peak number of concurrent sessions.
    """
    events = []
    for login, logout in sessions:
        events.append((login, 1))   # +1 for login
        events.append((logout, -1)) # -1 for logout
        
    # Sort by time. If times are equal, process logout (-1) before login (1)
    events.sort(key=lambda x: (x[0], x[1]))
    
    max_concurrent = 0
    current_concurrent = 0
    
    for time, change in events:
        current_concurrent += change
        max_concurrent = max(max_concurrent, current_concurrent)
        
    return max_concurrent
`,
        testCases: [
            { id: 'tc1', description: 'Basic overlaps', input: 'sessions=[[1, 5], [2, 6], [8, 10]]', expected: '2 (between time 2 and 5)' },
            { id: 'tc2', description: 'Nested sessions', input: 'sessions=[[1, 10], [2, 9], [3, 8]]', expected: '3' },
            { id: 'tc3', description: 'No overlaps', input: 'sessions=[[1, 2], [3, 4], [5, 6]]', expected: '1' },
            { id: 'tc4', description: 'Boundary touching', input: 'sessions=[[1, 5], [5, 10]]', expected: '1 (Logout processes before login)' },
            { id: 'tc5', description: 'Massive burst', input: 'sessions=[[1, 10], [1, 10], [1, 10]]', expected: '3' },
        ],
    },
    {
        id: 'ENG-DSA-018',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Dynamic API Routing (Trie)',
        companies: ['Vercel', 'Next.js'],
        timeEst: '~50 min',
        level: 'SDE III',
        status: 'Not Started',
        topics: ['Trie', 'Design'],
        nextChallengeId: 'ENG-DSA-019',
        desc: 'You are writing the core router for a new web framework. You need to support fast path matching, including wildcard parameters (e.g., `/users/*/profile`). Implement an `add_route(path)` and `match_route(path)` using a Trie data structure.',
        solution: 'Split the path by `/` and insert each segment as a node in a Trie. For wildcard parameters like `*`, insert a special node. When searching, recursively traverse. If the current segment matches exactly, proceed. If a wildcard node exists, try that path as a fallback.',
        hints: [
            'A Hash Map works for exact matches, but fails for wildcards. A Trie (Prefix Tree) is required.',
            'Split the string `/users/123` into an array of segments `["users", "123"]`.',
            'When traversing for `match_route`, if you hit a node with a `*` child, it matches any string segment.'
        ],
        starterCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_route = False

class Router:
    def __init__(self):
        self.root = TrieNode()

    def add_route(self, path: str) -> None:
        segments = [s for s in path.split('/') if s]
        curr = self.root
        for seg in segments:
            if seg not in curr.children:
                curr.children[seg] = TrieNode()
            curr = curr.children[seg]
        curr.is_end_of_route = True

    def match_route(self, path: str) -> bool:
        segments = [s for s in path.split('/') if s]
        
        def dfs(node: TrieNode, index: int) -> bool:
            if index == len(segments):
                return node.is_end_of_route
                
            seg = segments[index]
            # Exact match path
            if seg in node.children and dfs(node.children[seg], index + 1):
                return True
            # Wildcard fallback path
            if '*' in node.children and dfs(node.children['*'], index + 1):
                return True
                
            return False
            
        return dfs(self.root, 0)
`,
        testCases: [
            { id: 'tc1', description: 'Exact match', input: 'add("/api/users"), match("/api/users")', expected: 'True' },
            { id: 'tc2', description: 'Wildcard match', input: 'add("/api/users/*"), match("/api/users/123")', expected: 'True' },
            { id: 'tc3', description: 'Failing subpath', input: 'add("/api/users"), match("/api/users/123")', expected: 'False' },
            { id: 'tc4', description: 'Nested wildcards', input: 'add("/org/*/users/*"), match("/org/apple/users/jason")', expected: 'True' },
            { id: 'tc5', description: 'Order precedence', input: 'add("/a/b"), add("/a/*"), match("/a/b")', expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-019',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Merge Distributed Logs (Min-Heap)',
        companies: ['Datadog', 'Splunk'],
        timeEst: '~45 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Heaps', 'Linked Lists', 'Divide & Conquer'],
        nextChallengeId: 'ENG-DSA-020',
        desc: 'You have K different log files from K different servers. Each file is already sorted by timestamp. Merge all K files into a single master chronological log feed without loading everything into memory at once.',
        solution: 'This is the "Merge K Sorted Lists" problem. Use a Min-Heap. Push the first log entry from every server into the heap (along with the server ID). Pop the smallest log, append it to the result, and push the NEXT log entry from that same server into the heap.',
        hints: [
            'Appending all arrays and calling `.sort()` is O(N log N) and uses too much memory. We need O(N log K).',
            'Keep a Min-Heap of size K. It will constantly hold the "current smallest" log from each of the K servers.',
            'In Python, `heapq` compares tuples element by element. Store `(timestamp, log_message, server_index, list_index)` in the heap.'
        ],
        starterCode: `import heapq

def merge_k_logs(log_lists: list[list[int]]) -> list[int]:
    """
    For simplicity in this challenge, logs are just integer timestamps.
    log_lists: [[1, 4, 5], [1, 3, 4], [2, 6]]
    """
    min_heap = []
    result = []
    
    # Push the first element of each list into the heap
    for list_idx, lst in enumerate(log_lists):
        if lst:
            # (value, list_index, element_index)
            heapq.heappush(min_heap, (lst[0], list_idx, 0))
            
    while min_heap:
        val, list_idx, elem_idx = heapq.heappop(min_heap)
        result.append(val)
        
        # If the list has more elements, push the next one
        if elem_idx + 1 < len(log_lists[list_idx]):
            next_val = log_lists[list_idx][elem_idx + 1]
            heapq.heappush(min_heap, (next_val, list_idx, elem_idx + 1))
            
    return result
`,
        testCases: [
            { id: 'tc1', description: 'Standard merge', input: 'lists=[[1,4,5], [1,3,4], [2,6]]', expected: '[1, 1, 2, 3, 4, 4, 5, 6]' },
            { id: 'tc2', description: 'Empty lists mixed in', input: 'lists=[[], [1,2], []]', expected: '[1, 2]' },
            { id: 'tc3', description: 'All empty', input: 'lists=[[], [], []]', expected: '[]' },
            { id: 'tc4', description: 'Already merged', input: 'lists=[[1,2,3], [4,5,6]]', expected: '[1, 2, 3, 4, 5, 6]' },
            { id: 'tc5', description: 'Lots of duplicates', input: 'lists=[[1,1], [1,1]]', expected: '[1, 1, 1, 1]' },
        ],
    },
    {
        id: 'ENG-DSA-020',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Database Migration Runner (Graph DFS)',
        companies: ['Shopify', 'Airbnb'],
        timeEst: '~35 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Graphs', 'DFS', 'Topological Sort'],
        nextChallengeId: 'ENG-DSA-021',
        desc: 'Our ORM runs database migration scripts. A script can require another script to run first (e.g., `AddUsersTable` depends on `EnableUUIDExtension`). Determine if all scripts can execute successfully, or if there is a circular dependency dead-locking the system.',
        solution: 'This is Cycle Detection in a Directed Graph. Build an adjacency list. Perform a Depth-First Search (DFS) on every node. Maintain a "visited" set and a "currently_in_stack" set. If you visit a node that is already in the current DFS stack, a cycle exists.',
        hints: [
            'This is equivalent to the classic "Course Schedule" problem.',
            'You need 3 states for a node: 0 (unvisited), 1 (visiting/in current path stack), 2 (visited completely).',
            'If you encounter a node with state 1 during DFS, you have found a cycle. Return False.'
        ],
        starterCode: `from collections import defaultdict

def can_run_migrations(num_scripts: int, dependencies: list[tuple[int, int]]) -> bool:
    """
    dependencies: (A, B) means script A depends on script B.
    Returns True if all migrations can run, False if there is a circular dependency.
    """
    graph = defaultdict(list)
    for a, b in dependencies:
        graph[a].append(b)
        
    # States: 0 = unvisited, 1 = visiting (in stack), 2 = visited completely
    state = [0] * num_scripts
    
    def dfs(node: int) -> bool:
        if state[node] == 1:
            return False # Cycle detected!
        if state[node] == 2:
            return True  # Already processed safely
            
        state[node] = 1 # Mark as visiting
        for prereq in graph[node]:
            if not dfs(prereq):
                return False
                
        state[node] = 2 # Mark as fully processed
        return True
        
    for i in range(num_scripts):
        if state[i] == 0:
            if not dfs(i):
                return False
                
    return True
`,
        testCases: [
            { id: 'tc1', description: 'Valid linear chain', input: 'scripts=3, deps=[(1,0),(2,1)]', expected: 'True' },
            { id: 'tc2', description: 'Direct cycle', input: 'scripts=2, deps=[(1,0),(0,1)]', expected: 'False' },
            { id: 'tc3', description: 'Disconnected valid graphs', input: 'scripts=4, deps=[(1,0),(3,2)]', expected: 'True' },
            { id: 'tc4', description: 'Complex cycle', input: 'scripts=4, deps=[(1,0),(2,1),(3,2),(1,3)]', expected: 'False' },
            { id: 'tc5', description: 'No dependencies', input: 'scripts=5, deps=[]', expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-021',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Datacenter Network Partitions (Matrix DFS)',
        companies: ['Google', 'Cloudflare'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Matrix', 'DFS', 'BFS'],
        nextChallengeId: 'ENG-DSA-022',
        desc: 'Our datacenter is represented as a 2D grid. `1` represents an active server rack, `0` represents an empty aisle. An "island" is a cluster of connected servers. Due to a switch failure, the network partitioned. Count how many isolated server clusters exist.',
        solution: 'This is the "Number of Islands" problem. Iterate through the grid. When you find a `1`, increment your island count, and launch a DFS/BFS to mark all adjacent `1`s as visited (by changing them to `0` or using a visited set). Continue scanning the grid.',
        hints: [
            'When you find a server (1), you need to explore its up, down, left, and right neighbors.',
            'To prevent counting the same cluster twice, mutate the grid by changing `1` to `0` as you visit them.',
            'Use recursion (DFS) for clean code, or a Queue (BFS) if you are worried about maximum recursion depth on massive grids.'
        ],
        starterCode: `def count_isolated_clusters(grid: list[list[str]]) -> int:
    """
    grid: 2D array of "1"s (servers) and "0"s (empty space).
    Returns the integer count of isolated clusters.
    """
    if not grid:
        return 0
        
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r: int, c: int):
        # Boundary and visited check
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0":
            return
            
        # Mark as visited
        grid[r][c] = "0"
        
        # Explore 4 directions
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)
                
    return count
`,
        testCases: [
            { id: 'tc1', description: 'One large cluster', input: 'grid=[["1","1","1"],["1","1","0"],["0","0","0"]]', expected: '1' },
            { id: 'tc2', description: 'Three isolated servers', input: 'grid=[["1","0","0"],["0","1","0"],["0","0","1"]]', expected: '3' },
            { id: 'tc3', description: 'Empty datacenter', input: 'grid=[["0","0"],["0","0"]]', expected: '0' },
            { id: 'tc4', description: 'U-shaped cluster', input: 'grid=[["1","1","1"],["1","0","1"],["1","1","1"]]', expected: '1' },
            { id: 'tc5', description: 'Two dense clusters', input: 'grid=[["1","1","0","0"],["1","1","0","0"],["0","0","1","1"],["0","0","1","1"]]', expected: '2' },
        ],
    },
    {
        id: 'ENG-DSA-022',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Auto-scaling Threshold Spike (Peak Element)',
        companies: ['AWS', 'Netflix'],
        timeEst: '~20 min',
        level: 'SDE I',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays'],
        nextChallengeId: 'ENG-DSA-023',
        desc: 'You have a telemetry array representing CPU load over time. The load increases to a peak, then decreases as auto-scaling kicks in. Find the index of the peak CPU load in O(log n) time.',
        solution: 'Use Binary Search. Look at the middle element. If it is strictly greater than its right neighbor, the peak is to the left (including mid). If it is less than its right neighbor, the peak is to the right. Adjust pointers until left == right.',
        hints: [
            'Linear scan O(n) is too slow for massive telemetry arrays. Since there is a definitive peak, we can use Binary Search.',
            'Compare `arr[mid]` to `arr[mid + 1]`.',
            'If `arr[mid] > arr[mid + 1]`, you are on the descending slope. The peak is to your left (or is `mid`).'
        ],
        starterCode: `def find_peak_cpu(loads: list[int]) -> int:
    """
    loads: array of CPU loads
    Returns the index of any peak (an element strictly greater than its neighbors).
    O(log n) time complexity required.
    """
    left = 0
    right = len(loads) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        # If we are on a downward slope, peak is to the left
        if loads[mid] > loads[mid + 1]:
            right = mid
        # If we are on an upward slope, peak is to the right
        else:
            left = mid + 1
            
    return left
`,
        testCases: [
            { id: 'tc1', description: 'Clear peak', input: 'loads=[1, 2, 3, 1]', expected: '2 (value 3)' },
            { id: 'tc2', description: 'Peak at the very end', input: 'loads=[1, 2, 3, 4, 5]', expected: '4 (value 5)' },
            { id: 'tc3', description: 'Peak at the beginning', input: 'loads=[5, 4, 3, 2, 1]', expected: '0 (value 5)' },
            { id: 'tc4', description: 'Multiple peaks (returns any)', input: 'loads=[1, 2, 1, 3, 5, 6, 4]', expected: '1 or 5' },
            { id: 'tc5', description: 'Array of size 2', input: 'loads=[1, 2]', expected: '1 (value 2)' },
        ],
    },
    {
        id: 'ENG-DSA-023',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Tracing Latency Budget (Hash Map)',
        companies: ['Datadog', 'New Relic'],
        timeEst: '~35 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Hash Map', 'Prefix Sum', 'Arrays'],
        nextChallengeId: 'ENG-DSA-024',
        desc: 'A distributed trace records the latency of consecutive function calls in an array. We need to find the total number of continuous sub-traces (subarrays) whose latencies add up EXACTLY to our SLA budget K. O(n) required.',
        solution: 'Use the Prefix Sum + Hash Map technique. Keep a running sum of latencies. At each step, check if `running_sum - K` exists in the hash map. If it does, we have found sub-traces that sum to K. Add the frequency to the total count.',
        hints: [
            'A brute force nested loop will take O(n^2) and timeout on massive traces.',
            'Keep a running tally (prefix sum). If your current sum is 15, and your target K is 5, you need to know if you ever had a prefix sum of 10 earlier in the array.',
            'Initialize your Hash Map with `{0: 1}` to account for subarrays that start at index 0.'
        ],
        starterCode: `def count_sla_breaches(latencies: list[int], k: int) -> int:
    """
    latencies: array of milliseconds taken by sequential functions
    k: target SLA budget
    Returns the number of continuous subarrays that sum to exactly k.
    """
    count = 0
    current_sum = 0
    prefix_sums = {0: 1} # Base case: sum of 0 happens 1 time
    
    for time in latencies:
        current_sum += time
        
        # If (current_sum - k) exists in map, we found a matching subarray
        difference = current_sum - k
        if difference in prefix_sums:
            count += prefix_sums[difference]
            
        # Add current sum to map
        prefix_sums[current_sum] = prefix_sums.get(current_sum, 0) + 1
        
    return count
`,
        testCases: [
            { id: 'tc1', description: 'Basic match', input: 'latencies=[1, 1, 1], k=2', expected: '2 ([1,1] from start, and [1,1] at end)' },
            { id: 'tc2', description: 'Negative latencies (mock adjustments)', input: 'latencies=[1, -1, 0], k=0', expected: '3 ([1,-1], [0], [1,-1,0])' },
            { id: 'tc3', description: 'No matches', input: 'latencies=[1, 2, 3], k=7', expected: '0' },
            { id: 'tc4', description: 'Single element match', input: 'latencies=[5, 2, 3], k=5', expected: '2 ([5], [2,3])' },
            { id: 'tc5', description: 'All zeros', input: 'latencies=[0, 0, 0], k=0', expected: '6' },
        ],
    },
    {
        id: 'ENG-DSA-024',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Org Chart Access Control (Tree LCA)',
        companies: ['Workday', 'Rippling'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Binary Tree', 'Recursion', 'DFS'],
        nextChallengeId: 'ENG-DSA-025',
        desc: 'Our permissions model is mapped to the corporate Org Chart (a Binary Tree). We need to grant shared file access to two employees. Write an algorithm to find their Lowest Common Manager (LCA) in the tree.',
        solution: 'Traverse the tree using DFS. If the current node is Employee A or Employee B, return the node. Recurse left and right. If BOTH left and right recursive calls return a node, the current node is the Lowest Common Manager. If only one returns a node, pass it up.',
        hints: [
            'If you find Employee A on the left branch, and Employee B on the right branch, you are currently standing on the Lowest Common Manager.',
            'If you find both A and B on the left branch, then the LCA is somewhere further down that left branch.',
            'Base cases: if node is None, return None. If node == p or node == q, return node.'
        ],
        starterCode: `class EmployeeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def find_common_manager(root: EmployeeNode, p: EmployeeNode, q: EmployeeNode) -> EmployeeNode:
    """
    Finds the Lowest Common Ancestor (Manager) of two employees in an Org Tree.
    """
    # Base Case
    if not root or root == p or root == q:
        return root
        
    # Search Left and Right branches
    left_search = find_common_manager(root.left, p, q)
    right_search = find_common_manager(root.right, p, q)
    
    # If both returned a node, this root is the common manager
    if left_search and right_search:
        return root
        
    # Otherwise, pass up the non-null result
    return left_search if left_search else right_search
`,
        testCases: [
            { id: 'tc1', description: 'Standard branching', input: 'root=[3,5,1,6,2,0,8], p=5, q=1', expected: '3' },
            { id: 'tc2', description: 'Manager is the LCA', input: 'root=[3,5,1,6,2,0,8], p=5, q=4 (where 4 is child of 2)', expected: '5' },
            { id: 'tc3', description: 'Linear tree', input: 'root=[1,2], p=1, q=2', expected: '1' },
            { id: 'tc4', description: 'Deep nested match', input: 'root=[6,2,8,0,4,7,9,None,None,3,5], p=2, q=8', expected: '6' },
            { id: 'tc5', description: 'Same side match', input: 'root=[6,2,8,0,4,7,9,None,None,3,5], p=2, q=4', expected: '2' },
        ],
    },
    {
        id: 'ENG-DSA-025',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'CDN Edge Node Routing (Greedy)',
        companies: ['Cloudflare', 'Fastly'],
        timeEst: '~30 min',
        level: 'SDE II',
        status: 'Not Started',
        topics: ['Greedy', 'Arrays'],
        nextChallengeId: 'ENG-DSA-026',
        desc: 'You have an array representing CDN edge nodes in a sequential network line. The integer at each node is the maximum "hop distance" a packet can jump from that node. Determine if a packet starting at index 0 can successfully reach the last node in the network.',
        solution: 'This is the "Jump Game" problem. Use a Greedy approach. Maintain a `max_reach` integer starting at 0. Iterate through the array. If your current index is greater than `max_reach`, you are stuck (return False). Otherwise, update `max_reach = max(max_reach, i + nums[i])`. If `max_reach >= last_index`, return True.',
        hints: [
            'You don\'t need to use Dynamic Programming or BFS here, which would be too slow. A simple O(n) greedy approach works.',
            'Keep track of the "farthest index" you can currently reach.',
            'If you ever step onto an index that is greater than your "farthest index", it means you are trapped at a zero and cannot proceed.'
        ],
        starterCode: `def can_reach_destination(hops: list[int]) -> bool:
    """
    hops: array of maximum jump distances
    Returns True if you can reach the last index, False otherwise.
    """
    max_reach = 0
    last_index = len(hops) - 1
    
    for i in range(len(hops)):
        # If we arrived at an index we cannot reach, fail
        if i > max_reach:
            return False
            
        # Update the furthest we can jump
        max_reach = max(max_reach, i + hops[i])
        
        # Early exit if we can already reach the end
        if max_reach >= last_index:
            return True
            
    return True
`,
        testCases: [
            { id: 'tc1', description: 'Can reach end', input: 'hops=[2, 3, 1, 1, 4]', expected: 'True (Jump 1 step to index 1, then 3 steps to end)' },
            { id: 'tc2', description: 'Trapped at zero', input: 'hops=[3, 2, 1, 0, 4]', expected: 'False (Will always get stuck at index 3)' },
            { id: 'tc3', description: 'Single node', input: 'hops=[0]', expected: 'True' },
            { id: 'tc4', description: 'Massive first jump', input: 'hops=[10, 0, 0, 0, 0]', expected: 'True' },
            { id: 'tc5', description: 'Just enough reach', input: 'hops=[1, 1, 1, 1]', expected: 'True' },
        ],
    },

];
