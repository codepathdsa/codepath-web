import { Challenge } from './types';

export const dsaChallenges: Challenge[] = [
    // ======================================
    // BATCH 1: Challenges 1 - 10 (ENHANCED)
    // ======================================
    {
        id: 'ENG-DSA-001',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Payment System Double-Billing (Array)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Arrays', 'Hash Set', 'Cycle Detection'],
        nextChallengeId: 'ENG-DSA-002',
        realWorldContext: `Stripe processes millions of payment transactions per day. A subtle bug in the idempotency layer caused certain transactions to be submitted twice, resulting in customers being double-charged. The transaction log is an array of N+1 integers where every integer is in the range [1..N] — meaning exactly one ID appears twice. The billing team has escalated this as a P0 incident.`,
        desc: 'Finance flagged that 3 customers were charged twice. The transaction log array has N+1 items in range [1..N], containing exactly one duplicate ID. Find it in O(n) time and O(1) space.',
        whyItMatters: `A naive solution using a Hash Set works in O(n) time but requires O(n) extra memory — on a 100M transaction log, that's gigabytes of RAM just for the lookup table. The interviewer wants to see you can solve this in constant space, which is critical when processing massive financial datasets.`,
        approach: `Think of the array values as pointers: if the value at index 2 is 5, you "jump" to index 5. Since one value appears twice, two different indices point to the same location — this creates a cycle in the pointer graph. Floyd's Cycle Detection (Tortoise and Hare) finds cycles in linked list-like structures in O(n) time and O(1) space.`,
        solution: "Use Floyd's Tortoise and Hare (Cycle Detection). Treat array values as pointers. Phase 1: advance slow by 1, fast by 2 until they meet. Phase 2: reset slow to nums[0], advance both by 1 until they meet — that's the duplicate.",
        walkthrough: [
            "Phase 1 — Find intersection: Move `slow = nums[slow]` and `fast = nums[nums[fast]]` each step. Like two runners on a circular track, the faster one will eventually lap the slower one. They meet inside the cycle.",
            "Phase 2 — Find cycle entrance: The mathematical property of Floyd's algorithm guarantees that if you reset `slow` to the start and advance both pointers one step at a time, they will meet exactly at the duplicate number.",
            "Why does this work? The duplicate value creates two edges pointing to the same node — that's the 'entrance' of the cycle, which equals the duplicate."
        ],
        hints: [
            'A Set can detect duplicates in O(n) time — but O(n) space. Can you do better?',
            'Try treating the array values as pointers to indices. If value = 3, jump to index 3. A duplicate creates a cycle.',
            "Floyd's Cycle Detection: two pointers (slow = next, fast = next→next) will meet at a cycle intersection. Then reset slow to start and advance both by 1 to find the cycle entrance."
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def find_duplicate(nums: list[int]) -> int:
    """
    Given array of n+1 integers where each value is in [1..n],
    find the one duplicate. O(n) time, O(1) space required.
    
    Example:[1, 3, 4, 2, 2] → 2
    Example:[3, 1, 3, 4, 2] → 3
    """
    # Phase 1: Find intersection point using Floyd's cycle detection
    slow = nums[0]
    fast = nums[0]
    while True:
        slow = nums[slow]           # 1 step
        fast = nums[nums[fast]]     # 2 steps
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
            { id: 'tc2', description: 'Duplicate is 3', input: 'nums =[3, 1, 3, 4, 2]', expected: '3' },
            { id: 'tc3', description: 'Duplicate at boundaries', input: 'nums =[1, 4, 6, 3, 1, 2, 5]', expected: '1' },
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
        level: 'Junior',
        status: 'Not Started',
        topics: ['Arrays', 'Sorting', 'Intervals'],
        nextChallengeId: 'ENG-DSA-003',
        realWorldContext: `Datadog's SLA dashboard calculates "nine-nines uptime" for enterprise customers. The raw incident log contains overlapping downtime windows — for example, an alert fires at 14:00 and another at 14:30, but they're part of the same outage that ended at 15:00. Without merging, the dashboard overcounts total downtime and breaks SLA calculations.`,
        desc: 'We are calculating our SLA uptime. We have a list of server outage intervals[start, end]. Many overlap. Merge all overlapping downtimes to calculate total true downtime.',
        whyItMatters: `Overlapping intervals appear everywhere in distributed systems: log aggregation, calendar scheduling, network packet reassembly, and memory allocation. The merge pattern is a foundational building block you'll use repeatedly in production code.`,
        approach: `The key insight is sorting. Once intervals are sorted by start time, you only need to compare each interval to the LAST merged interval — you never need to look further back. This reduces the problem from O(n²) comparisons to a single O(n) linear pass after the O(n log n) sort.`,
        solution: 'Sort intervals by start_time. Iterate, maintaining a current interval. If next.start <= current.end, they overlap — update current.end = max(current.end, next.end). Otherwise, push current and start a new one.',
        walkthrough: [
            "Sort by start time: [[1,4],[2,6],[8,10],[15,18]] stays the same order here.",
            "Initialize result with the first interval [1,4]. Now iterate from index 1.",
            "[2,6]: 2 <= 4 (overlaps!). Merge: new end = max(4,6) = 6. Result: [[1,6]]",
            "[8,10]: 8 > 6 (no overlap). Append to result: [[1,6],[8,10]]",
            "[15,18]: 15 > 10. Append: [[1,6],[8,10],[15,18]]. Done!"
        ],
        hints: [
            'Before you can merge, you need to sort. What should you sort by?',
            'After sorting by start time, two intervals [a,b] and[c,d] overlap if c <= b.',
            "When they overlap, the merged interval's end is max(b, d) — not just d — because one can be fully contained inside the other."
        ],
        complexity: { time: 'O(n log n)', space: 'O(n)' },
        starterCode: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """
    Merge all overlapping outage windows.
    
    Example: [[1,4],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
    Example: [[1,10],[2,6],[3,5]] → [[1,10]]  (containment case!)
    """
    if not intervals:
        return[]

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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Deque', 'Sliding Window', 'System Design'],
        nextChallengeId: 'ENG-DSA-004',
        realWorldContext: `Discord's API team discovered that bots were exploiting the fixed-window rate limiter by sending 5,000 requests at 23:59:59 and another 5,000 at 00:00:01 — effectively getting 10,000 requests in 2 seconds while bypassing the "5,000/minute" limit. The sliding window approach fixes this by counting requests in the last 60 seconds relative to NOW, not relative to a clock boundary.`,
        desc: 'Bots are bypassing our Fixed Window rate limiter by bursting at 11:59:59 and 12:00:01. Implement a Sliding Window Log rate limiter. Each call to is_allowed(timestamp) returns True/False.',
        whyItMatters: `Rate limiting is fundamental to API security and fairness. This exact algorithm (or a variant) runs inside Stripe, Cloudflare, Discord, and virtually every production API. Understanding the tradeoffs between Fixed Window (simple, exploitable), Sliding Window Log (accurate, memory-heavy), and Token Bucket (smooth, complex) is a standard senior engineer interview topic.`,
        approach: `Store a log of timestamps for each client. When a request arrives: (1) prune timestamps older than window_size seconds, (2) if count < limit, allow and record the timestamp. The deque is ideal here because pruning old timestamps happens from the left (popleft) and new timestamps are added to the right.`,
        solution: 'Store request timestamps in a deque. On each call: pop timestamps older than (now - window). If len(deque) < max_requests, allow and append timestamp. Else, deny.',
        walkthrough: [
            "State: deque = [], limit = 3 requests per 10 seconds",
            "t=1: deque=[] (empty, prune nothing). len=0 < 3. ALLOW. deque=[1]",
            "t=5: prune nothing (5-10=-5, no entries older than -5). len=1 < 3. ALLOW. deque=[1,5]",
            "t=9: prune nothing. len=2 < 3. ALLOW. deque=[1,5,9]",
            "t=12: prune t=1 (1 <= 12-10=2). deque=[5,9]. len=2 < 3. ALLOW. deque=[5,9,12]",
            "t=14: prune t=5 (5 <= 14-10=4). deque=[9,12]. len=2 < 3. ALLOW ✓"
        ],
        hints: [
            'A fixed window resets every N seconds. A sliding window looks back exactly N seconds from NOW.',
            'Use a queue/deque to store timestamps. On each request, remove entries older than (timestamp - window_size).',
            'After pruning old entries: if len(queue) < limit, allow the request and append the timestamp. Otherwise deny it.'
        ],
        complexity: { time: 'O(n) amortized per call', space: 'O(window_size)' },
        starterCode: `from collections import deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self.log: deque = deque()  # stores timestamps of allowed requests

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
            { id: 'tc4', description: 'Burst at boundary exploit', input: 'limiter(3, 10): is_allowed(9), is_allowed(10), is_allowed(11), is_allowed(12)', expected: 'True, True, True, False' },
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'Topological Sort', 'BFS'],
        nextChallengeId: 'ENG-DSA-005',
        realWorldContext: `GitLab's monorepo CI/CD system failed to build after a developer accidentally created a circular dependency between packages. The build runner hung indefinitely waiting for Package A (which waits for B, which waits for A). Before executing any build, the system must compute a valid topological order and fail fast if a cycle exists.`,
        desc: 'Our monorepo build system fails because packages depend on each other. Given packages and dependency pairs (A depends on B), return a valid build order. Raise an error if circular dependency exists.',
        whyItMatters: `Topological sort is the algorithm behind Make, npm/yarn dependency resolution, Webpack module bundling, database schema migrations, and task scheduling systems. Any time you have "X must happen before Y", you need topological sort. Cycle detection is equally critical — circular imports crash compilers and package managers.`,
        approach: `Kahn's Algorithm (BFS-based) is more intuitive for detecting cycles than DFS-based topological sort. The key insight: start with nodes that have NO dependencies (in-degree 0). Process them, reducing the dependency count of their neighbors. If you process all N nodes, no cycle exists. If you get stuck before processing all N nodes, a cycle is blocking progress.`,
        solution: "Kahn's Algorithm: Build in-degree map and adjacency list. Enqueue nodes with in-degree 0. Process queue: for each node, decrement neighbors' in-degrees; if 0, enqueue. If total processed < total nodes, a cycle exists.",
        walkthrough: [
            "packages=['core','utils','api','app'], deps=[('utils','core'),('api','core'),('app','utils'),('app','api')]",
            "Build in-degrees: core=0, utils=1, api=1, app=2",
            "Queue starts with: [core] (only zero in-degree node)",
            "Process 'core': decrement utils→0, api→0. Queue:[utils, api]",
            "Process 'utils': decrement app→1. Process 'api': decrement app→0. Queue: [app]",
            "Process 'app': queue empty. Order=['core','utils','api','app']. len=4=total ✓ No cycle!"
        ],
        hints: [
            'Think of dependencies as a directed graph. "A depends on B" means an edge B → A (B must come first).',
            "In-degree = number of dependencies a package has. Start with packages that have zero dependencies (in-degree = 0).",
            "After processing a node, reduce its dependents' in-degree. If any reach 0, they're ready to build. If processed count ≠ total nodes at the end, there's a cycle."
        ],
        complexity: { time: 'O(V + E)', space: 'O(V + E)' },
        starterCode: `from collections import deque, defaultdict

def find_build_order(packages: list[str], deps: list[tuple[str,str]]) -> list[str]:
    """
    deps: list of (dependent, dependency) pairs
    Returns a valid build order or raises ValueError on cycle.
    """
    in_degree = {p: 0 for p in packages}
    graph = defaultdict(list)  # dependency -> [dependents]

    for dependent, dependency in deps:
        graph[dependency].append(dependent)
        in_degree[dependent] += 1

    # Start with all packages that have no dependencies
    queue = deque([p for p in packages if in_degree[p] == 0])
    order =[]

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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Heaps', 'Priority Queue', 'Streaming'],
        nextChallengeId: 'ENG-DSA-006',
        realWorldContext: `Robinhood's trading dashboard receives 10,000 stock price updates per second. The "Most Volatile Stocks" widget must show the top 5 most volatile tickers in real-time. Sorting the entire feed on every update would take O(N log N) time — too slow. The team needs an O(N log K) streaming solution.`,
        desc: 'The trading dashboard gets sluggish updating the Top-K Most Volatile Stocks from 10,000 updates/sec. Return the top k entries from the stream in O(N log K) time.',
        whyItMatters: `The Top-K pattern appears everywhere: trending topics (Twitter), recommended videos (YouTube), search result ranking, leaderboard systems, and resource-heavy process monitoring. Mastering the min-heap approach lets you handle any "find K best from N" problem efficiently in streaming contexts.`,
        approach: `Counterintuitively, to find the K LARGEST elements, we use a MIN-heap of size K. The root of this min-heap is always the smallest of our "top K candidates." When a new element arrives: if it beats the worst element in our top-K (the root), we evict the root and insert the newcomer. Otherwise, we ignore it. The heap never exceeds size K.`,
        solution: 'Maintain a min-heap of size K. For each new item: if heap size < K, push it. Else if item score > heap root, pop the min and push the new one. Final heap contains top-K.',
        walkthrough: [
            "stream=[('AAPL',2.1),('TSLA',9.4),('GME',15.2),('AMD',3.3),('NVDA',7.8)], k=2",
            "AAPL=2.1: heap size 0 < 2. Push. heap=[(2.1,'AAPL')]",
            "TSLA=9.4: heap size 1 < 2. Push. heap=[(2.1,'AAPL'),(9.4,'TSLA')]",
            "GME=15.2: heap full. 15.2 > root 2.1? YES. Replace. heap=[(9.4,'TSLA'),(15.2,'GME')]",
            "AMD=3.3: 3.3 > root 9.4? NO. Skip.",
            "NVDA=7.8: 7.8 > root 9.4? NO. Skip.",
            "Result:[('TSLA',9.4),('GME',15.2)] ✓"
        ],
        hints: [
            'Sorting the entire stream is O(N log N). You only need the top K — there is a faster way.',
            'A min-heap of size K lets you keep track of the K largest items seen so far. The root is always the smallest of your top-K candidates.',
            'If a new stock score > heap root: the root is no longer in top-K. Pop it and push the newcomer. Otherwise ignore. At the end, your heap IS the top-K.'
        ],
        complexity: { time: 'O(N log K)', space: 'O(K)' },
        starterCode: `import heapq

def top_k_volatile(stream: list[tuple[str, float]], k: int) -> list[tuple[str, float]]:
    """
    stream: list of (ticker, volatility_score)
    Returns the k highest-volatility stocks.
    O(N log K) time, O(K) space.
    """
    # Min-heap of (score, ticker) so root = lowest score in top-K
    min_heap: list[tuple[float, str]] =[]

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
    },
    {
        id: 'ENG-DSA-007',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Driver-Rider Proximity Matching (K-D Tree)',
        companies: ['Uber', 'Lyft'],
        timeEst: '~50 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Trees', 'Spatial Indexing', 'Divide & Conquer'],
        nextChallengeId: 'ENG-DSA-008',
        realWorldContext: `Uber's dispatch system must find the 5 closest available drivers to a requesting rider in under 100ms, across millions of active drivers globally. A brute-force O(N) scan of every driver location is 50-100ms on commodity hardware — too slow for Uber's SLA. The K-D Tree reduces this to O(log N) average case.`,
        desc: "Given millions of active driver GPS coordinates, find the 5 closest to a rider's location in sub-millisecond time. Brute-force O(N) scan is too slow at scale.",
        whyItMatters: `Spatial data structures (K-D Trees, R-Trees, Geohashes) are used in ride-sharing, food delivery, drone routing, robotics, and computer graphics. Understanding how to partition space recursively and prune search branches is a critical skill for any engineer working with location-based services.`,
        approach: `K-D Tree partitions 2D space by alternating which axis (lat vs lng) is used for splitting at each level, like a recursive binary search in 2D. For nearest neighbor search, we traverse the tree maintaining a max-heap of the K best candidates found so far. We prune entire subtrees when their bounding box is farther than our Kth-best distance.`,
        solution: 'Build a K-D Tree: recursively partition 2D space by alternating lat/lng axes, splitting at the median. Query by traversing down the tree, pruning branches whose bounding box is farther than the current best K neighbors.',
        walkthrough: [
            "Build phase: Sort[( 1,1),(5,5),(2,2),(8,3),(4,7)] by x. Median=(4,7). Left=[(1,1),(2,2)], Right=[(5,5),(8,3)]",
            "At depth 1, split by y axis. Continue recursively until single nodes.",
            "Query phase: target=(1.5,1.5), k=2. Traverse to leaf nearest target.",
            "At each node, compute distance and update max-heap of size k.",
            "KEY: Check if the perpendicular distance to the splitting hyperplane < kth-best distance. If yes, we MUST search both children (the nearest neighbor might be on the other side of the split).",
            "Prune subtrees whose closest possible point exceeds current kth-best distance."
        ],
        hints: [
            'A K-D Tree recursively divides 2D space. At depth 0 split by x (lat), depth 1 by y (lng), and so on.',
            'Sort points by the current axis, use the median as the split point, recurse on left and right halves.',
            'When searching for nearest neighbors, maintain a max-heap of size K. Prune subtrees whose closest possible point exceeds the Kth-best distance so far.'
        ],
        complexity: { time: 'O(log N) average, O(N) worst', space: 'O(N)' },
        starterCode: `import heapq
from typing import Optional

class KDNode:
    def __init__(self, point: tuple, left=None, right=None):
        self.point = point; self.left = left; self.right = right

def build_kdtree(points: list[tuple], depth: int = 0) -> Optional[KDNode]:
    """Build a 2D K-D Tree from (lat, lng) driver positions.
    Alternates splitting axis at each depth level."""
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
    """Return k nearest points to target using K-D Tree traversal.
    Uses max-heap of size k to track best candidates.
    Prunes branches that cannot improve on current kth-best."""
    best =[]  # max-heap: (-dist, point)

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
        # Only search far side if it could contain a closer neighbor
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Union-Find', 'Disjoint Sets', 'Graphs'],
        nextChallengeId: 'ENG-DSA-009',
        realWorldContext: `Coinbase's AML (Anti-Money Laundering) team discovered that fraud rings create closed cycles of transactions to obscure the origin of funds. Account A → B → C → A is a classic "layering" pattern. When a new transaction would complete a cycle between already-connected accounts, the system must alert in real-time. Union-Find detects this in near-constant time.`,
        desc: "Compromised accounts form closed trading rings to bypass AML alerts. Given a stream of transactions (userA, userB), use Union-Find to detect when a ring is formed (i.e., A and B are already in the same connected component).",
        whyItMatters: `Union-Find (Disjoint Set Union) is the most efficient data structure for dynamic connectivity problems. It powers network connectivity checking, Kruskal's MST algorithm, image segmentation, and social network "friend group" analysis. With path compression + union by rank, it achieves near-O(1) amortized operations.`,
        approach: `Union-Find tracks which accounts are in the same "group." The find() operation returns the root/representative of a group. The union() operation merges two groups. If find(A) == find(B) BEFORE union, A and B are already connected — adding a new edge between them creates a cycle (fraud ring). Path compression makes repeated find() calls nearly O(1).`,
        solution: 'Union-Find with path compression. find(x) returns the root of x\'s component. union(a,b): if find(a)==find(b), a cycle/ring is detected. Otherwise, merge their components.',
        walkthrough: [
            "transactions=[('A','B'),('B','C'),('C','A')]",
            "Process ('A','B'): find(A)=A, find(B)=B. Different → Union. parent[A]=B",
            "Process ('B','C'): find(B)=B, find(C)=C. Different → Union. parent[B]=C",
            "Process ('C','A'): find(C)=C, find(A)→find(B)→find(C)=C. SAME ROOT! 🚨 RING DETECTED",
            "Return [('C','A')] as the ring-closing transaction"
        ],
        hints: [
            'Model accounts as nodes and transactions as edges. A fraud ring = a cycle in the graph.',
            'Union-Find (Disjoint Set): find(x) gives the root of x\'s group. If find(A) == find(B) before adding edge A-B, it creates a cycle.',
            'Path compression in find(): point every node directly to its root on the way back. This makes future finds nearly O(1).'
        ],
        complexity: { time: 'O(α(n)) per operation ≈ O(1)', space: 'O(n)' },
        starterCode: `class FraudDetector:
    """Detects closed trading rings using Union-Find with path compression.
    α(n) is the inverse Ackermann function — essentially constant for all practical inputs."""

    def __init__(self):
        self.parent: dict[str, str] = {}

    def find(self, x: str) -> str:
        """Find root of x's component. Path compression flattens the tree."""
        if x not in self.parent:
            self.parent[x] = x  # Initialize: x is its own root
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, a: str, b: str) -> bool:
        """
        Returns True if a ring is detected (a and b already connected).
        Otherwise merges their groups and returns False.
        """
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return True  # RING DETECTED — they're already connected!
        self.parent[ra] = rb
        return False

    def process(self, transactions: list[tuple[str, str]]) -> list[tuple[str, str]]:
        """Return list of (a, b) transactions that completed a fraud ring."""
        rings =[]
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
    },
    {
        id: 'ENG-DSA-010',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Log Stream Pattern Search (Aho-Corasick)',
        companies: ['Elastic', 'Splunk'],
        timeEst: '~60 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Trie', 'String Matching', 'Automata'],
        nextChallengeId: 'ENG-DSA-011',
        realWorldContext: `Elastic's SIEM (Security Information and Event Management) system must scan 5 GB/s of raw log data for 10,000 known malicious IP addresses. Running 10,000 regex patterns sequentially would take ~500ms per GB. Aho-Corasick's automaton scans ALL patterns simultaneously in a single O(N) pass — 500x faster.`,
        desc: "Scan a live 5 GB/s log stream for 10,000 banned IPs simultaneously. Running 10,000 separate regex scans pegs CPU at 100%. Build an Aho-Corasick automaton to search all patterns in a single O(N) pass.",
        whyItMatters: `Aho-Corasick is the algorithm behind intrusion detection systems, antivirus scanners, network packet inspection, and grep -F (fixed-string search). It's the most important multi-pattern string matching algorithm in existence. Understanding it demonstrates mastery of both Trie data structures and finite automata theory.`,
        approach: `Phase 1 (Build Trie): Insert all patterns character by character. Phase 2 (Add Failure Links via BFS): For each state, compute the longest proper suffix that is also a valid Trie prefix. This is the "failure link" — when the current match fails, jump to the failure link instead of restarting from root. Phase 3 (Search): Follow goto links on match, failure links on mismatch — single pass through text.`,
        solution: 'Build a Trie from all 10,000 patterns. Add BFS-computed failure links so when a partial match fails, you transition to the longest proper suffix that IS a state in the Trie. Then scan the text in a single pass using goto/fail transitions.',
        walkthrough: [
            "Patterns: ['he', 'she', 'his', 'hers']",
            "Build Trie: root→h→e(end:'he')→r→s(end:'hers'). root→s→h→e(end:'she'). root→h→i→s(end:'his')",
            "Failure links (BFS): state 'h' fails to root. State 'he' fails to 'e' (suffix). State 'she' fails to 'he' (also matches 'he'!).",
            "Scanning 'ushers': u→fail→root. s→s. h→sh. e→she (match:'she'!). r→sher. s→shers (match:'hers' via output link, 'he' via fail!).",
            "Result: matches for 'she','he','hers' — all found in single pass ✓"
        ],
        hints: [
            'A regular Trie finds single patterns fast. Aho-Corasick extends it to find ALL patterns simultaneously by adding "failure links".',
            'Failure link for state S = the longest proper suffix of the string ending at S that is also a valid Trie prefix. Compute these via BFS from the root.',
            'When scanning: follow goto links on match. On mismatch, follow the failure link (not back to root) — this avoids re-scanning characters and achieves O(N) total search time.'
        ],
        complexity: { time: 'O(M) build + O(N+Z) search where Z=matches', space: 'O(M * alphabet)' },
        starterCode: `from collections import deque

class AhoCorasick:
    """Multi-pattern search: build once O(M), scan in O(N) per log line.
    M = total length of all patterns, N = text length."""

    def __init__(self):
        self.goto = [{}]   # goto[state][char] = next_state
        self.fail = [0]    # failure function: longest proper suffix state
        self.out = [[]]    # out[state] = list of patterns ending here

    def build(self, patterns: list[str]):
        """Phase 1: insert all patterns into the Trie."""
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

        """Phase 2: BFS to compute failure links.
        fail[s] = longest proper suffix of s that is also a Trie state."""
        q = deque()
        for ch, s in self.goto[0].items():
            self.fail[s] = 0  # Depth-1 nodes fail to root
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
                self.out[s] += self.out[self.fail[s]]  # Inherit suffix matches

    def search(self, text: str) -> list[tuple[int, str]]:
        """Scan text in O(N), return (start_index, pattern) for all matches."""
        results =[]
        state = 0
        for i, ch in enumerate(text):
            while state and ch not in self.goto[state]:
                state = self.fail[state]  # Follow failure link
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
    // BATCH 2: Challenges 11 - 25 (ENHANCED)
    // ======================================
    {
        id: 'ENG-DSA-011',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Ledger Reconciliation (Two Pointers)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Two Pointers', 'Arrays', 'Math'],
        nextChallengeId: 'ENG-DSA-012',
        realWorldContext: `Square's finance team runs a nightly reconciliation job to match transaction amounts across their ledger. They have a sorted array of transaction amounts and need to find if any two amounts sum to the day's target discrepancy. The naive O(n²) approach would take hours on large ledgers.`,
        desc: 'Finance is running a daily reconciliation job. We have a sorted array of transaction amounts. Find if there are two distinct transactions that sum exactly to our daily target discrepancy. Return their indices.',
        whyItMatters: `Two Pointers is one of the most versatile interview techniques. The "sorted array + two-sum" pattern shows up in 3Sum, 4Sum, container with most water, and dozens of geometry problems. Once sorted, you can search the entire solution space in a single O(n) pass by cleverly moving two boundary pointers.`,
        approach: `Because the array is sorted, the Two Pointers technique eliminates the need for a Hash Map. Place one pointer at the smallest value (left) and one at the largest (right). If their sum is too small, move left up to increase it. If too large, move right down to decrease it. This covers all possible pairs in O(n) with O(1) space.`,
        solution: 'Because the array is already sorted, use the Two Pointers technique. Place one pointer at the start and one at the end. If their sum is greater than the target, decrement the right pointer. If less, increment the left. Runs in O(n) time and O(1) space.',
        walkthrough: [
            "transactions=[10, 20, 30, 40, 50], target=70",
            "left=0(10), right=4(50): sum=60 < 70. Move left up.",
            "left=1(20), right=4(50): sum=70 == 70. Found! Return[1, 4]"
        ],
        hints: [
            'Since the array is sorted, you do not need an O(n) space Hash Map to solve this.',
            'What happens to the total sum if you move the rightmost pointer one step to the left?',
            'Initialize left = 0, right = len(nums) - 1. Loop while left < right. Adjust pointers based on how the sum compares to the target.'
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def find_reconciliation_pair(transactions: list[int], target: int) -> list[int]:
    """
    transactions: sorted list of integers
    target: the discrepancy amount we are looking for
    Returns [index1, index2] of the two transactions, or[] if none exist.
    
    Example: [10, 20, 30, 40, 50], target=70 → [1, 4] (20+50=70)
    """
    left = 0
    right = len(transactions) - 1
    
    while left < right:
        current_sum = transactions[left] + transactions[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1   # Need bigger sum, move left pointer right
        else:
            right -= 1  # Need smaller sum, move right pointer left
            
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
        level: 'Junior',
        status: 'Not Started',
        topics: ['Stacks', 'Strings'],
        nextChallengeId: 'ENG-DSA-013',
        realWorldContext: `Twilio's webhook ingestion service crashed during a partner integration because malformed nested bracket structures in the JSON payload caused the parser to hang. Rather than letting the slow JSON parser handle validation, the team added a fast pre-check that validates bracket matching in O(n) time before the expensive parse step.`,
        desc: 'Our webhook ingestion endpoint is crashing because a third-party partner is sending malformed nested JSON/XML strings. Write a fast validator to ensure all opening brackets ({,[, <, () are properly closed in the correct order.',
        whyItMatters: `The Stack is the natural data structure for anything "nested." This pattern appears in: expression evaluators, syntax highlighting, HTML/XML parsers, and undo/redo systems. The bracket matching problem is the canonical introduction to stacks — master it and you'll recognize the stack pattern in dozens of harder problems.`,
        approach: `Think of a stack as a "memory" of what you've opened but not yet closed. Each time you see an opener, push it. Each time you see a closer, the most recently opened bracket should match it (LIFO order). If the stack is empty when you see a closer, or if the top doesn't match, the structure is invalid. At the end, the stack must be empty (all opened brackets were closed).`,
        solution: 'Use a Stack. Iterate through the characters. If it is an opening bracket, push it to the stack. If it is a closing bracket, pop from the stack and verify it matches the corresponding opening bracket. If the stack is empty at the end, it is valid.',
        walkthrough: [
            "payload = '{[<>()]}'. Stack: []",
            "'{' → opener, push. Stack: ['{']",
            "'[' → opener, push. Stack: ['{', '[']",
            "'<' → opener, push. Stack: ['{', '[', '<']",
            "'>' → closer! Pop '<'. Matches mapping['>']=('<'). Stack: ['{', '[']",
            "'(' → push. Stack:['{', '[', '(']",
            "')' → closer! Pop '('. Matches. Stack: ['{', '[']",
            "']' → closer! Pop '['. Matches. Stack: ['{']",
            "'}' → closer! Pop '{'. Matches. Stack:[]",
            "End: stack is empty → VALID ✓"
        ],
        hints: [
            'A stack is the perfect data structure for LIFO (Last-In-First-Out) operations, which is exactly how nested brackets work.',
            'Use a dictionary/hash map to store the matching pairs: { "}": "{", "]": "[", ")": "(", ">": "<" }.',
            'Watch out for edge cases: what if the string starts with a closing bracket? What if the stack isn\'t empty at the very end?'
        ],
        complexity: { time: 'O(n)', space: 'O(n)' },
        starterCode: `def is_valid_payload(payload: str) -> bool:
    """
    Checks if brackets in the payload string are properly closed.
    Supported brackets: (), {},[], <>
    
    Example: "{[<>()]}" → True
    Example: "{[}]" → False (wrong closing order)
    Example: "{" → False (never closed)
    """
    stack =[]
    mapping = {')': '(', '}': '{', ']': '[', '>': '<'}
    
    for char in payload:
        if char in mapping.values():   # It's an opener
            stack.append(char)
        elif char in mapping.keys():   # It's a closer
            if not stack or stack[-1] != mapping[char]:
                return False           # Stack empty, or wrong match
            stack.pop()
            
    return len(stack) == 0  # Valid only if all openers were closed
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search'],
        nextChallengeId: 'ENG-DSA-014',
        realWorldContext: `A GitHub team discovered a memory leak in production that was introduced somewhere across 10,000 commits over the past 3 months. Running their test suite takes 10 minutes per commit. Testing every commit sequentially would take 70 days. Git bisect (which uses binary search under the hood) finds the culprit in at most 14 commits — about 2.3 hours.`,
        desc: 'A massive memory leak was introduced somewhere in the last 10,000 commits. Running the test suite takes 10 minutes per commit, so testing chronologically will take days. Given an API function `is_bad_commit(id)`, find the exact first commit that introduced the bug efficiently.',
        whyItMatters: `Binary search is the most powerful search technique for sorted/monotonic spaces. The key insight — that you can eliminate HALF the remaining search space with each comparison — reduces log₂(10,000) = 13.3, so just 14 tests instead of 10,000. This principle extends beyond arrays: database indexes, internet routing tables, and version control all use binary search variants.`,
        approach: `The commits are implicitly sorted: good commits come first, bad commits come after, and once a commit is "bad," all subsequent ones are also "bad" (monotonic). This is the key property that makes binary search applicable. Unlike regular binary search where you return when you find a match, here you must find the FIRST bad commit — so when you find a bad commit, you move right inward, not return.`,
        solution: 'Use Binary Search to minimize API calls. Find the midpoint commit. If it is bad, the bug was introduced at or before this point, so move the right pointer to mid. If it is good, the bug was introduced after, so move the left pointer to mid + 1.',
        walkthrough: [
            "n=10, bad_commit=5. left=1, right=10",
            "mid=5: is_bad(5)=True → right=5. left=1, right=5",
            "mid=3: is_bad(3)=False → left=4. left=4, right=5",
            "mid=4: is_bad(4)=False → left=5. left=5, right=5",
            "left==right==5. Return 5 ✓ (only 3 API calls instead of 10!)"
        ],
        hints: [
            'This is exactly how `git bisect` works under the hood. It turns an O(n) search into O(log n).',
            'If commit 500 is BAD, it means the bug was introduced somewhere between commit 1 and 500.',
            'Unlike standard binary search, you don\'t return early when you find a BAD commit. You must find the *first* BAD commit, meaning you keep searching the left half.'
        ],
        complexity: { time: 'O(log n)', space: 'O(1)' },
        starterCode: `def is_bad_commit(commit_id: int) -> bool:
    # This is a mock API provided by the platform.
    # Returns True if the memory leak exists in this commit.
    pass

def find_first_bad_commit(n: int) -> int:
    """
    n: Total number of commits [1, 2, ..., n]
    Returns the ID of the first bad commit.
    
    Key insight: commits are monotonic — once bad, all later are bad.
    Example:[good, good, good, BAD, BAD, BAD] → find index of first BAD.
    """
    left = 1
    right = n
    
    while left < right:
        mid = left + (right - left) // 2  # Avoids integer overflow
        if is_bad_commit(mid):
            right = mid    # Bad found, but might not be FIRST bad — search left
        else:
            left = mid + 1 # Confirmed good, bug is after mid
            
    return left  # left == right == first bad commit
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Sliding Window', 'Arrays'],
        nextChallengeId: 'ENG-DSA-015',
        realWorldContext: `New Relic's alerting system needs to identify the worst K-minute window in a server's error log to determine the severity of an incident. The SRE team uses this to set alert thresholds. A naïve O(n*k) approach recalculates the sum from scratch for each window — the sliding window technique reuses previous calculations for O(n).`,
        desc: 'You have an array representing the number of HTTP 500 errors logged per minute. Find the continuous K-minute window that had the highest total number of errors, and return that maximum sum.',
        whyItMatters: `The Fixed Sliding Window is the first optimization technique every engineer should learn. It converts O(n*k) "recalculate from scratch" algorithms into O(n) "update the delta" algorithms. This pattern appears in: moving averages, string substring problems, and any time you compute a metric over a fixed-size window of data.`,
        approach: `Instead of summing K elements for every starting position (O(n*k)), note that adjacent windows overlap in K-1 elements. Moving the window right by one position: you lose the leftmost element and gain a new rightmost element. So: new_sum = old_sum - errors[i-k] + errors[i]. This is the core insight of the sliding window technique.`,
        solution: 'Use a Fixed Sliding Window. Calculate the sum of the first K elements. Then, slide the window by 1: add the new element entering the window and subtract the old element leaving the window. Keep track of the max sum. O(n) time.',
        walkthrough: [
            "errors=[2, 1, 5, 1, 3, 2], k=3",
            "Initial window: sum([2,1,5])=8. max_sum=8",
            "Slide right: +errors[3]=1, -errors[0]=2. sum=8-2+1=7. max=8",
            "Slide right: +errors[4]=3, -errors[1]=1. sum=7-1+3=9. max=9",
            "Slide right: +errors[5]=2, -errors[2]=5. sum=9-5+2=6. max=9",
            "Answer: 9 (window [5,1,3]) ✓"
        ],
        hints: [
            'Recalculating the sum of K elements from scratch for every minute takes O(n * k) time. Avoid this.',
            'When the window shifts from[index 0 to 4] to [index 1 to 5], the only things that change are: you lose index 0 and gain index 5.',
            'current_sum = current_sum - errors[i - k] + errors[i]. Update max_sum on every step.'
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def max_error_window(errors: list[int], k: int) -> int:
    """
    errors: array of error counts per minute
    k: size of the time window
    Returns the maximum sum of errors in any continuous k-minute window.
    
    Example: errors=[2, 1, 5, 1, 3, 2], k=3 → 9 (window [5,1,3])
    """
    if not errors or k <= 0 or k > len(errors):
        return 0
        
    # Calculate initial window [0..k-1]
    current_sum = sum(errors[:k])
    max_sum = current_sum
    
    # Slide window: add right element, remove left element
    for i in range(k, len(errors)):
        current_sum = current_sum - errors[i - k] + errors[i]
        max_sum = max(max_sum, current_sum)
        
    return max_sum
`,
        testCases: [
            { id: 'tc1', description: 'Normal array', input: 'errors=[2, 1, 5, 1, 3, 2], k=3', expected: '9 (from 5,1,3)' },
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'BFS', 'Hash Map'],
        nextChallengeId: 'ENG-DSA-016',
        realWorldContext: `Netflix's chaos engineering team uses blast radius analysis before running Chaos Monkey experiments. Before intentionally taking down a service, they need to know exactly which downstream services will be affected. This prevents accidental customer impact. The analysis runs as a BFS through the service dependency graph.`,
        desc: 'A critical vulnerability was found in the "Auth" microservice. We have a graph representing which microservices depend on which others. Calculate the total number of services affected (the blast radius) if "Auth" goes down.',
        whyItMatters: `BFS (Breadth-First Search) is the correct algorithm for "find all reachable nodes" and "shortest path in unweighted graph" problems. Blast radius analysis, social network "degrees of separation," web crawling, and network routing all use BFS. The visited set is non-optional — microservice graphs frequently have circular dependencies.`,
        approach: `Model the system as a directed graph where an edge A→B means "A depends on B." When B fails, all of A's users lose functionality — so we need to traverse the REVERSE edges (B→A). Build an adjacency list of dependency→dependents. BFS from the failed service, adding all reachable dependents. The visited set prevents infinite loops in circular dependency graphs.`,
        solution: 'This is a Graph traversal problem. Build an adjacency list representing the dependencies. Use Breadth-First Search (BFS) starting from the compromised service. Maintain a `visited` set to avoid infinite loops from circular dependencies. Return the size of the visited set.',
        walkthrough: [
            "deps=[('Cart','Auth'),('Order','Cart'),('Notif','Auth')], compromised='Auth'",
            "Build graph: Auth→[Cart, Notif], Cart→[Order]",
            "BFS: queue=['Auth'], visited={'Auth'}",
            "Process 'Auth': neighbors=[Cart, Notif]. Add both. queue=['Cart','Notif'], visited={'Auth','Cart','Notif'}",
            "Process 'Cart': neighbors=[Order]. Add. queue=['Notif','Order'], visited={'Auth','Cart','Notif','Order'}",
            "Process 'Notif': no unvisited neighbors. Process 'Order': no neighbors.",
            "Return len(visited) = 4 ✓"
        ],
        hints: [
            'If A depends on B, and B depends on C, then if C fails, A and B both fail.',
            'Use a queue (deque) to perform Breadth-First Search. Start by pushing the compromised service onto the queue.',
            'Microservices often have circular dependencies (A -> B -> A). You MUST use a `visited` Set to avoid infinite loops.'
        ],
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        starterCode: `from collections import deque, defaultdict

def calculate_blast_radius(dependencies: list[tuple[str, str]], compromised_svc: str) -> int:
    """
    dependencies: list of (Dependent, Dependency) pairs. 
                  e.g., ("Cart", "Auth") means Cart depends on Auth.
    Returns the total number of services affected, including the compromised one.
    
    Example:[("Cart","Auth"),("Order","Cart")], compromised="Auth" → 3
    """
    # Build adjacency list: Dependency → [List of Dependents]
    graph = defaultdict(list)
    for dependent, dependency in dependencies:
        graph[dependency].append(dependent)
        
    # BFS from compromised service
    queue = deque([compromised_svc])
    visited = {compromised_svc}
    
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
        level: 'Senior',
        status: 'Not Started',
        topics: ['Dynamic Programming', '0/1 Knapsack'],
        nextChallengeId: 'ENG-DSA-017',
        realWorldContext: `AWS Lambda charges by RAM-seconds. Vercel's background job system packs multiple customer jobs into a single Lambda invocation to minimize cost. Given a list of jobs each with a RAM requirement and a priority score, find the optimal combination that maximizes priority without exceeding the Lambda's RAM limit. This is NP-hard in general but solvable in pseudo-polynomial time with DP.`,
        desc: 'We rent AWS Lambda instances with a maximum RAM capacity of M MB. We have a queue of background jobs, each requiring a specific amount of RAM and yielding a specific priority score. Pick the optimal subset of jobs to run on a single Lambda to maximize the priority score without exceeding M.',
        whyItMatters: `0/1 Knapsack is the canonical Dynamic Programming problem. It teaches the fundamental DP technique: defining subproblems, building a table of solutions, and deriving answers bottom-up. Variants appear in portfolio optimization, resource allocation, and cutting-stock problems. Greedy approaches famously FAIL for 0/1 Knapsack — only DP gives the optimal answer.`,
        approach: `DP table: dp[i][w] = maximum priority achievable using the first i jobs with w MB of RAM. For each job i and capacity w: (1) if job doesn't fit (cost > w), dp[i][w] = dp[i-1][w] (skip it). (2) if job fits, take the max of skipping it or including it: max(dp[i-1][w], priority[i] + dp[i-1][w-cost[i]]). The answer is dp[n][M].`,
        solution: 'This is the classic 0/1 Knapsack problem. Create a 2D DP array `dp[i][w]` representing the max priority using the first `i` jobs and `w` RAM. If `weights[i] <= w`, take `max(dp[i-1][w], values[i] + dp[i-1][w-weights[i]])`. Return `dp[n][M]`.',
        walkthrough: [
            "jobs: costs=[10,20,30], priorities=[60,100,120], max_ram=50",
            "dp[0][w] = 0 for all w (no jobs, no priority)",
            "Job1 (cost=10, pri=60): For w=10..50, dp[1][w] = max(dp[0][w], 60+dp[0][w-10]) = 60",
            "Job2 (cost=20, pri=100): dp[2][30]=max(60, 100+60)=160. dp[2][50]=max(60, 100+60)=160",
            "Job3 (cost=30, pri=120): dp[3][50]=max(160, 120+dp[2][20])=max(160, 120+100)=220",
            "Answer: dp[3][50] = 220 (jobs 2+3: 20+30=50 RAM, 100+120=220 priority) ✓"
        ],
        hints: [
            'A greedy approach (sorting by priority/RAM ratio) will fail for 0/1 packing. You must use Dynamic Programming.',
            'Create a 2D array: `dp[jobs + 1][capacity + 1]` initialized to 0.',
            'For each job, you have two choices: include it (if it fits) or exclude it. Take the max of both options.'
        ],
        complexity: { time: 'O(n * M)', space: 'O(n * M)' },
        starterCode: `def maximize_priority(ram_costs: list[int], priorities: list[int], max_ram: int) -> int:
    """
    ram_costs: MB required for each job
    priorities: Score for completing the job  
    max_ram: Capacity of the Lambda instance
    Returns the maximum priority score achievable.
    
    Example: costs=[10,20,30], priorities=[60,100,120], max_ram=50 → 220
    """
    n = len(ram_costs)
    # dp[i][w] = max priority using first i jobs with w RAM capacity
    dp = [[0] * (max_ram + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        cost = ram_costs[i - 1]
        score = priorities[i - 1]
        
        for w in range(1, max_ram + 1):
            if cost <= w:
                # Max of: skip this job, or include it
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - cost] + score)
            else:
                # Job doesn't fit, carry over previous best
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Arrays', 'Sorting', 'Sweep Line'],
        nextChallengeId: 'ENG-DSA-018',
        realWorldContext: `Discord's infrastructure team needs to provision WebSocket server capacity. They need to determine peak concurrent connections from historical session logs to size their server fleet. Each log entry contains [login_time, logout_time]. Brute force O(n²) interval overlap counting is too slow for millions of daily sessions.`,
        desc: 'To properly auto-scale our socket servers, we need to find the historical peak traffic. Given a list of user session logs `[login_time, logout_time]`, determine the maximum number of concurrent active WebSockets at any given moment.',
        whyItMatters: `The Sweep Line algorithm is a fundamental computational geometry technique that converts 2D interval problems into 1D event-based problems. It's used in: meeting room scheduling, calendar overlap detection, road traffic analysis, and the very same WebSocket capacity planning described here. Mastering it unlocks a class of interval problems that defeats naive O(n²) approaches.`,
        approach: `Transform each session [login, logout] into two events: (login, +1) and (logout, -1). Sort all events by time. Sweep through events from left to right, maintaining a running count. The maximum running count equals the peak concurrent connections. The critical edge case: if a logout and login happen at the same time, process logouts FIRST (sort by value: -1 before +1) to avoid double-counting.`,
        solution: 'Use the Sweep Line algorithm. Separate all logs into two events: `(login_time, +1)` and `(logout_time, -1)`. Sort all events by time. If times are equal, process logouts (-1) before logins (+1) to avoid overcounting. Iterate through, keeping a running sum, and track the maximum.',
        walkthrough: [
            "sessions=[[1,5],[2,6],[8,10]]",
            "Events:[(1,+1),(5,-1),(2,+1),(6,-1),(8,+1),(10,-1)]",
            "Sorted:[(1,+1),(2,+1),(5,-1),(6,-1),(8,+1),(10,-1)]",
            "t=1: count=1. t=2: count=2. t=5: count=1. t=6: count=0. t=8: count=1. t=10: count=0",
            "Peak = 2 ✓ (between t=2 and t=5, both users active)"
        ],
        hints: [
            'Comparing every interval against every other interval takes O(n^2). We can do this in O(n log n).',
            'Think of this as people entering and leaving a room. You just need to sort the door events chronologically and count the people inside.',
            'Edge Case: If User A logs out at time 5, and User B logs in at time 5, do they overlap? Usually, process the logout first.'
        ],
        complexity: { time: 'O(n log n)', space: 'O(n)' },
        starterCode: `def max_concurrent_sockets(sessions: list[list[int]]) -> int:
    """
    sessions: list of [login_time, logout_time]
    Returns the peak number of concurrent sessions.
    
    Example: [[1,5],[2,6],[8,10]] → 2 (between t=2 and t=5)
    """
    events =[]
    for login, logout in sessions:
        events.append((login, 1))    # +1 for login
        events.append((logout, -1)) # -1 for logout
        
    # Sort by time. If times are equal, process logout (-1) before login (+1)
    # This ensures non-overlapping sessions at boundaries are counted correctly
    events.sort(key=lambda x: (x[0], x[1]))
    
    max_concurrent = 0
    current_concurrent = 0
    
    for time, change in events:
        current_concurrent += change
        max_concurrent = max(max_concurrent, current_concurrent)
        
    return max_concurrent
`,
        testCases: [
            { id: 'tc1', description: 'Basic overlaps', input: 'sessions=[[1, 5], [2, 6],[8, 10]]', expected: '2 (between time 2 and 5)' },
            { id: 'tc2', description: 'Nested sessions', input: 'sessions=[[1, 10],[2, 9], [3, 8]]', expected: '3' },
            { id: 'tc3', description: 'No overlaps', input: 'sessions=[[1, 2], [3, 4], [5, 6]]', expected: '1' },
            { id: 'tc4', description: 'Boundary touching', input: 'sessions=[[1, 5], [5, 10]]', expected: '1 (Logout processes before login)' },
            { id: 'tc5', description: 'Massive burst', input: 'sessions=[[1, 10], [1, 10],[1, 10]]', expected: '3' },
        ],
    },
    {
        id: 'ENG-DSA-018',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Dynamic API Routing (Trie)',
        companies: ['Vercel', 'Next.js'],
        timeEst: '~50 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Trie', 'Design'],
        nextChallengeId: 'ENG-DSA-019',
        realWorldContext: `Next.js's file-based routing system must match incoming request paths like "/users/123/profile" against registered routes like "/users/*/profile". A HashMap works for exact matches, but wildcard routing requires a Trie. This is the same algorithm used by Express.js, FastAPI, and virtually every web framework's router.`,
        desc: 'You are writing the core router for a new web framework. You need to support fast path matching, including wildcard parameters (e.g., `/users/*/profile`). Implement an `add_route(path)` and `match_route(path)` using a Trie data structure.',
        whyItMatters: `Tries (Prefix Trees) are essential for: autocomplete systems, IP routing tables (longest prefix match), DNS resolution, and web framework routing. The wildcard extension shown here teaches how to extend exact-match algorithms to handle parametric patterns — a critical skill for building routing infrastructure.`,
        approach: `Split paths by "/" and build a Trie where each path segment is a node. For wildcards ("*"), insert a special node that matches any segment. When matching, use DFS with two branches at each step: (1) try exact segment match, (2) try wildcard match. The DFS explores both possibilities, returning True if either path leads to a valid route endpoint.`,
        solution: 'Split the path by "/" and insert each segment as a node in a Trie. For wildcard parameters like "*", insert a special node. When searching, recursively traverse. If the current segment matches exactly, proceed. If a wildcard node exists, try that path as a fallback.',
        walkthrough: [
            "add_route('/api/users/*'): segments=['api','users','*']",
            "Trie: root→api→users→*(end=True)",
            "match_route('/api/users/123'): segments=['api','users','123']",
            "Traverse: root→api(exact match)→users(exact match)→'123'",
            "No exact node '123'. Check wildcard: '*' exists! Follow wildcard.",
            "At '*' node: index=3==len(segments). is_end=True. MATCH ✓"
        ],
        hints: [
            'A Hash Map works for exact matches, but fails for wildcards. A Trie (Prefix Tree) is required.',
            'Split the string "/users/123" into an array of segments ["users", "123"].',
            'When traversing for `match_route`, if you hit a node with a `*` child, it matches any string segment.'
        ],
        complexity: { time: 'O(L) per operation where L=path length', space: 'O(N*L)' },
        starterCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_route = False

class Router:
    def __init__(self):
        self.root = TrieNode()

    def add_route(self, path: str) -> None:
        """Register a route. '*' matches any single path segment.
        Example: add_route('/users/*/profile')"""
        segments = [s for s in path.split('/') if s]
        curr = self.root
        for seg in segments:
            if seg not in curr.children:
                curr.children[seg] = TrieNode()
            curr = curr.children[seg]
        curr.is_end_of_route = True

    def match_route(self, path: str) -> bool:
        """Check if path matches any registered route.
        Tries exact match first, falls back to wildcard."""
        segments =[s for s in path.split('/') if s]
        
        def dfs(node: TrieNode, index: int) -> bool:
            if index == len(segments):
                return node.is_end_of_route
                
            seg = segments[index]
            # Try exact match first (higher priority than wildcard)
            if seg in node.children and dfs(node.children[seg], index + 1):
                return True
            # Fall back to wildcard
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Heaps', 'Linked Lists', 'Divide & Conquer'],
        nextChallengeId: 'ENG-DSA-020',
        realWorldContext: `Datadog's log aggregation pipeline receives sorted log streams from K different server pods and must merge them into a single chronologically sorted master stream for querying. Loading all K streams into memory and sorting is O(N log N) and memory-prohibitive for multi-TB log archives. The K-way merge using a min-heap solves this in O(N log K) with O(K) extra space.`,
        desc: 'You have K different log files from K different servers. Each file is already sorted by timestamp. Merge all K files into a single master chronological log feed without loading everything into memory at once.',
        whyItMatters: `Merge K Sorted Lists is a classic interview problem at Google, Microsoft, and Facebook. It's also the merge phase in external merge sort (used when data doesn't fit in RAM). Understanding how to use a min-heap for k-way merging is essential for building data pipelines, databases, and distributed systems.`,
        approach: `Start by pushing the FIRST element from each of the K lists into a min-heap. The heap automatically tracks which list currently has the smallest unprocessed element. Pop the minimum → that's the next element in the merged output. Then push the NEXT element from the same list that was just popped. Repeat until heap is empty. This gives O(N log K) — log K per heap operation × N total elements.`,
        solution: 'This is the "Merge K Sorted Lists" problem. Use a Min-Heap. Push the first log entry from every server into the heap (along with the server ID). Pop the smallest log, append it to the result, and push the NEXT log entry from that same server into the heap.',
        walkthrough: [
            "logs=[[1,4,5],[1,3,4],[2,6]]",
            "Init heap:[(1,0,0),(1,1,0),(2,2,0)] — (value, list_idx, elem_idx)",
            "Pop (1,0,0). Result=[1]. Push next from list 0: (4,0,1). Heap:[(1,1,0),(4,0,1),(2,2,0)]",
            "Pop (1,1,0). Result=[1,1]. Push (3,1,1). Heap:[(2,2,0),(4,0,1),(3,1,1)]",
            "Pop (2,2,0). Result=[1,1,2]. Push (6,2,1).",
            "Continue: pop 3,4,4,5,6... Result=[1,1,2,3,4,4,5,6] ✓"
        ],
        hints: [
            'Appending all arrays and calling `.sort()` is O(N log N) and uses too much memory. We need O(N log K).',
            'Keep a Min-Heap of size K. It will constantly hold the "current smallest" log from each of the K servers.',
            'In Python, `heapq` compares tuples element by element. Store `(timestamp, log_message, server_index, list_index)` in the heap.'
        ],
        complexity: { time: 'O(N log K)', space: 'O(K)' },
        starterCode: `import heapq

def merge_k_logs(log_lists: list[list[int]]) -> list[int]:
    """
    For simplicity in this challenge, logs are just integer timestamps.
    log_lists: [[1, 4, 5], [1, 3, 4], [2, 6]]
    Returns:[1, 1, 2, 3, 4, 4, 5, 6]
    
    Each tuple in heap: (value, list_index, element_index)
    Heap always holds the current minimum across all lists.
    """
    min_heap =[]
    result =[]
    
    # Push the first element of each list into the heap
    for list_idx, lst in enumerate(log_lists):
        if lst:
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'DFS', 'Topological Sort'],
        nextChallengeId: 'ENG-DSA-021',
        realWorldContext: `Shopify's ORM migration system runs hundreds of database migration scripts on deploy. A migration can depend on another (e.g., "AddOrderIndex" needs "CreateOrdersTable" to run first). A developer accidentally created a circular dependency, causing the migration runner to deadlock. The system must detect cycles before starting any migrations.`,
        desc: 'Our ORM runs database migration scripts. A script can require another script to run first (e.g., `AddUsersTable` depends on `EnableUUIDExtension`). Determine if all scripts can execute successfully, or if there is a circular dependency dead-locking the system.',
        whyItMatters: `DFS-based cycle detection in directed graphs is the foundation for: build system validation, import cycle detection, dependency resolvers, and deadlock detection in operating systems. The 3-state coloring technique (unvisited/visiting/visited) is more elegant and intuitive than Kahn's algorithm for cycle detection specifically.`,
        approach: `Track 3 states for each node. State 0 (white): never visited. State 1 (gray): currently being explored in this DFS path. State 2 (black): fully explored, no cycles found through this node. If DFS encounters a GRAY node, it means we've looped back to a node still on our current exploration path — that's a cycle! GRAY → GRAY edge = cycle.`,
        solution: 'This is Cycle Detection in a Directed Graph. Build an adjacency list. Perform a Depth-First Search (DFS) on every node. Maintain a "visited" set and a "currently_in_stack" set. If you visit a node that is already in the current DFS stack, a cycle exists.',
        walkthrough: [
            "scripts=3, deps=[(1,0),(2,1),(0,2)] — a cycle: 0→2→1→0",
            "DFS from 0: state[0]=1(gray). Visit neighbor 2.",
            "DFS from 2: state[2]=1(gray). Visit neighbor 1.",
            "DFS from 1: state[1]=1(gray). Visit neighbor 0.",
            "DFS to 0: state[0]==1 (GRAY)! Found gray→gray edge. CYCLE DETECTED → return False"
        ],
        hints: [
            'This is equivalent to the classic "Course Schedule" problem.',
            'You need 3 states for a node: 0 (unvisited), 1 (visiting/in current path stack), 2 (visited completely).',
            'If you encounter a node with state 1 during DFS, you have found a cycle. Return False.'
        ],
        complexity: { time: 'O(V + E)', space: 'O(V)' },
        starterCode: `from collections import defaultdict

def can_run_migrations(num_scripts: int, dependencies: list[tuple[int, int]]) -> bool:
    """
    dependencies: (A, B) means script A depends on script B (B runs first).
    Returns True if all migrations can run, False if circular dependency exists.
    
    Example: scripts=3, deps=[(1,0),(2,1)] → True (0→1→2 is valid order)
    Example: scripts=2, deps=[(1,0),(0,1)] → False (circular!)
    """
    graph = defaultdict(list)
    for a, b in dependencies:
        graph[a].append(b)  # a depends on b
        
    # States: 0=unvisited, 1=visiting(in DFS stack), 2=visited(safe)
    state =[0] * num_scripts
    
    def dfs(node: int) -> bool:
        if state[node] == 1:
            return False  # Back-edge to currently exploring node → CYCLE!
        if state[node] == 2:
            return True   # Already fully explored, definitely safe
            
        state[node] = 1  # Mark as currently exploring (gray)
        for prereq in graph[node]:
            if not dfs(prereq):
                return False
                
        state[node] = 2  # Mark as fully processed (black)
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Matrix', 'DFS', 'BFS'],
        nextChallengeId: 'ENG-DSA-022',
        realWorldContext: `Google's datacenter management system represents physical server racks as a 2D grid. After a switch failure, the network partitioned into isolated islands of servers. Each island requires a separate VLAN configuration and independent monitoring. The operations team needs an automated count of network partitions before dispatching field engineers.`,
        desc: 'Our datacenter is represented as a 2D grid. `1` represents an active server rack, `0` represents an empty aisle. An "island" is a cluster of connected servers. Due to a switch failure, the network partitioned. Count how many isolated server clusters exist.',
        whyItMatters: `Number of Islands is the most-asked matrix graph problem in tech interviews. It's the gateway to: image flood-fill algorithms, connected components counting, maze solving, and territory control in board games. The technique of "sink the island" (mutate grid to mark visited) is an elegant O(1)-space trick worth memorizing.`,
        approach: `Every cell is a node. Two "1" cells are connected if they're horizontally or vertically adjacent. When you find an unvisited "1", you've found a new island — increment count. Then DFS/BFS to "sink" the entire island (mark all connected "1"s as "0") so you never count them again. Repeat scanning until all cells are processed.`,
        solution: 'This is the "Number of Islands" problem. Iterate through the grid. When you find a `1`, increment your island count, and launch a DFS/BFS to mark all adjacent `1`s as visited (by changing them to `0` or using a visited set). Continue scanning the grid.',
        walkthrough: [
            "grid=[['1','1','0'],['1','0','0'],['0','0','1']]",
            "Scan (0,0)='1': island count=1. DFS sinks (0,0),(0,1),(1,0). Grid mutated.",
            "Continue scan: (0,1) already sunk. (0,2)='0'. (1,0) sunk. (1,1)='0'. (1,2)='0'. (2,0)='0'. (2,1)='0'.",
            "(2,2)='1': island count=2. DFS sinks just (2,2).",
            "Return 2 ✓"
        ],
        hints: [
            'When you find a server (1), you need to explore its up, down, left, and right neighbors.',
            'To prevent counting the same cluster twice, mutate the grid by changing `1` to `0` as you visit them.',
            'Use recursion (DFS) for clean code, or a Queue (BFS) if you are worried about maximum recursion depth on massive grids.'
        ],
        complexity: { time: 'O(M*N)', space: 'O(min(M,N)) DFS stack' },
        starterCode: `def count_isolated_clusters(grid: list[list[str]]) -> int:
    """
    grid: 2D array of "1"s (servers) and "0"s (empty space).
    Returns the integer count of isolated clusters (connected components).
    
    Example: [["1","1","0"],["0","0","0"],["0","0","1"]] → 2
    """
    if not grid:
        return 0
        
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r: int, c: int):
        """Sink the entire island starting from (r,c)."""
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0":
            return
            
        grid[r][c] = "0"  # Sink to avoid re-visiting
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
        
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)  # Sink the entire island
                
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
        level: 'Junior',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays'],
        nextChallengeId: 'ENG-DSA-023',
        realWorldContext: `AWS CloudWatch monitors EC2 CPU telemetry that follows a unimodal pattern: load increases until the auto-scaler triggers, then decreases. The alerting system needs to find the peak CPU index to determine when to fire the scaling event. Linear scan O(n) is too slow for petabyte-scale telemetry — binary search finds the peak in O(log n).`,
        desc: 'You have a telemetry array representing CPU load over time. The load increases to a peak, then decreases as auto-scaling kicks in. Find the index of the peak CPU load in O(log n) time.',
        whyItMatters: `Binary search is applicable beyond just sorted arrays — any monotonic or unimodal property enables binary search. Peak element finding teaches this generalization. The same "compare to neighbor" technique applies to: mountain array problems, rotated sorted array searches, and finding the inflection point in optimization functions.`,
        approach: `Look at the middle element. Compare it to its right neighbor. If mid > mid+1, we're on a DOWNWARD slope — the peak is to the LEFT (including mid, since mid could be the peak). If mid < mid+1, we're on an UPWARD slope — the peak is to the RIGHT. This binary decision halves the search space each step, achieving O(log n).`,
        solution: 'Use Binary Search. Look at the middle element. If it is strictly greater than its right neighbor, the peak is to the left (including mid). If it is less than its right neighbor, the peak is to the right. Adjust pointers until left == right.',
        walkthrough: [
            "loads=[1,2,3,4,3,2,1]. left=0, right=6",
            "mid=3: loads[3]=4 > loads[4]=3? YES (downward slope). right=3",
            "mid=1: loads[1]=2 > loads[2]=3? NO (upward slope). left=2",
            "mid=2: loads[2]=3 > loads[3]=4? NO. left=3. left==right==3. Peak at index 3 ✓"
        ],
        hints: [
            'Linear scan O(n) is too slow for massive telemetry arrays. Since there is a definitive peak, we can use Binary Search.',
            'Compare `arr[mid]` to `arr[mid + 1]`.',
            'If `arr[mid] > arr[mid + 1]`, you are on the descending slope. The peak is to your left (or is `mid`).'
        ],
        complexity: { time: 'O(log n)', space: 'O(1)' },
        starterCode: `def find_peak_cpu(loads: list[int]) -> int:
    """
    loads: array of CPU loads (unimodal — goes up then down)
    Returns the index of the peak element (strictly > both neighbors).
    O(log n) time complexity required.
    
    Example: [1, 2, 3, 1] → 2 (value 3 is peak)
    Example: [5, 4, 3, 2] → 0 (first element is peak)
    """
    left = 0
    right = len(loads) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        # On downward slope: peak is at mid or to its left
        if loads[mid] > loads[mid + 1]:
            right = mid
        # On upward slope: peak is strictly to the right of mid
        else:
            left = mid + 1
            
    return left  # left == right == peak index
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Hash Map', 'Prefix Sum', 'Arrays'],
        nextChallengeId: 'ENG-DSA-024',
        realWorldContext: `Datadog's distributed tracing system records latency for each function call in a request span. The SRE team needs to find all continuous sub-traces that cumulatively exceed the SLA budget K, to identify which combination of calls is causing slowdowns. The Prefix Sum + HashMap technique solves this in O(n) vs O(n²) brute force.`,
        desc: 'A distributed trace records the latency of consecutive function calls in an array. We need to find the total number of continuous sub-traces (subarrays) whose latencies add up EXACTLY to our SLA budget K. O(n) required.',
        whyItMatters: `The Prefix Sum + HashMap pattern is one of the most powerful techniques for subarray problems. It reduces "find all subarrays with property X" from O(n²) to O(n) by asking a smarter question: "have I seen a prefix that, if subtracted, gives me what I want?" This pattern solves subarray sum, subarray with equal 0s and 1s, and minimum length subarray problems.`,
        approach: `Running prefix sum: sum of latencies from index 0 to i. For the subarray [j+1..i] to have sum K: prefix[i] - prefix[j] = K → prefix[j] = prefix[i] - K. So for each new prefix sum, check if (current_sum - K) has appeared in the HashMap before. If yes, those past occurrences each represent a valid subarray ending at i. Store {prefix_sum: count} in the HashMap. Initialize with {0:1} (empty prefix has sum 0).`,
        solution: 'Use the Prefix Sum + Hash Map technique. Keep a running sum of latencies. At each step, check if `running_sum - K` exists in the hash map. If it does, we have found sub-traces that sum to K. Add the frequency to the total count.',
        walkthrough: [
            "latencies=[1,1,1], k=2. prefix_sums={0:1}, count=0",
            "i=0: sum=1. Check 1-2=-1 in map? No. Map: {0:1, 1:1}",
            "i=1: sum=2. Check 2-2=0 in map? YES! count+=1. Map: {0:1, 1:1, 2:1}",
            "i=2: sum=3. Check 3-2=1 in map? YES (count=1)! count+=1. Map: {0:1,1:1,2:1,3:1}",
            "Return count=2 ✓ (subarrays [1,1] at indices 0-1 and 1-2)"
        ],
        hints: [
            'A brute force nested loop will take O(n^2) and timeout on massive traces.',
            'Keep a running tally (prefix sum). If your current sum is 15, and your target K is 5, you need to know if you ever had a prefix sum of 10 earlier in the array.',
            'Initialize your Hash Map with `{0: 1}` to account for subarrays that start at index 0.'
        ],
        complexity: { time: 'O(n)', space: 'O(n)' },
        starterCode: `def count_sla_breaches(latencies: list[int], k: int) -> int:
    """
    latencies: array of milliseconds taken by sequential functions
    k: target SLA budget
    Returns the number of continuous subarrays that sum to exactly k.
    
    Example: [1,1,1], k=2 → 2 (subarrays [1,1] at pos 0-1 and 1-2)
    """
    count = 0
    current_sum = 0
    # {prefix_sum: frequency}. {0:1} = empty prefix occurs once
    prefix_sums = {0: 1}
    
    for time in latencies:
        current_sum += time
        
        # If (current_sum - k) was a prefix sum before,
        # then the subarray between that prefix and now sums to k
        difference = current_sum - k
        if difference in prefix_sums:
            count += prefix_sums[difference]
            
        # Record this prefix sum
        prefix_sums[current_sum] = prefix_sums.get(current_sum, 0) + 1
        
    return count
`,
        testCases: [
            { id: 'tc1', description: 'Basic match', input: 'latencies=[1, 1, 1], k=2', expected: '2' },
            { id: 'tc2', description: 'Negative latencies (mock adjustments)', input: 'latencies=[1, -1, 0], k=0', expected: '3' },
            { id: 'tc3', description: 'No matches', input: 'latencies=[1, 2, 3], k=7', expected: '0' },
            { id: 'tc4', description: 'Single element match', input: 'latencies=[5, 2, 3], k=5', expected: '2' },
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
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Tree', 'Recursion', 'DFS'],
        nextChallengeId: 'ENG-DSA-025',
        realWorldContext: `Rippling's permission system grants shared access to a file to the lowest common manager of two employees. The org chart is stored as a binary tree. Finding the LCA (Lowest Common Ancestor) in the tree tells us which manager to notify and which permission scope to grant. This must work correctly even when one employee is a direct ancestor of the other.`,
        desc: 'Our permissions model is mapped to the corporate Org Chart (a Binary Tree). We need to grant shared file access to two employees. Write an algorithm to find their Lowest Common Manager (LCA) in the tree.',
        whyItMatters: `LCA (Lowest Common Ancestor) is a fundamental tree algorithm used in: permission systems, phylogenetic trees in bioinformatics, network routing, and range-minimum queries. The elegant recursive solution teaches "return information upward through the tree" — a pattern applicable to dozens of tree problems.`,
        approach: `Recurse through the tree. If the current node IS one of the employees, return it (we found one target; any LCA must include this node or be above it). After recursing left and right: if BOTH return non-null, the current node is split between the two employees — THIS is the LCA. If only one side returns non-null, pass that result upward (both employees are in that subtree).`,
        solution: 'Traverse the tree using DFS. If the current node is Employee A or Employee B, return the node. Recurse left and right. If BOTH left and right recursive calls return a node, the current node is the Lowest Common Manager. If only one returns a node, pass it up.',
        walkthrough: [
            "Tree: 3→[5,1], 5→[6,2], 1→[0,8]. Find LCA(5,1)",
            "DFS(3): recurse left and right.",
            "DFS(5): node==5==p, return node 5. (Don't go deeper)",
            "DFS(1): node==1==q, return node 1.",
            "Back at DFS(3): left=5(non-null), right=1(non-null). BOTH non-null!",
            "Return node 3 — it's the LCA ✓"
        ],
        hints: [
            'If you find Employee A on the left branch, and Employee B on the right branch, you are currently standing on the Lowest Common Manager.',
            'If you find both A and B on the left branch, then the LCA is somewhere further down that left branch.',
            'Base cases: if node is None, return None. If node == p or node == q, return node.'
        ],
        complexity: { time: 'O(n)', space: 'O(h) where h=tree height' },
        starterCode: `class EmployeeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def find_common_manager(root: EmployeeNode, p: EmployeeNode, q: EmployeeNode) -> EmployeeNode:
    """
    Finds the Lowest Common Ancestor (Manager) of two employees in an Org Tree.
    
    Example tree: root=3, left=5, right=1
    find_common_manager(root, node_5, node_1) → node_3
    find_common_manager(root, node_5, node_2) → node_5 (5 is ancestor of 2!)
    """
    # Base Case: null or found one of the targets
    if not root or root == p or root == q:
        return root
        
    # Search both subtrees
    left_search = find_common_manager(root.left, p, q)
    right_search = find_common_manager(root.right, p, q)
    
    # If both sides found something, this node splits the two employees
    if left_search and right_search:
        return root  # This IS the LCA
        
    # Otherwise pass up whichever side found something (or None if neither)
    return left_search if left_search else right_search
`,
        testCases: [
            { id: 'tc1', description: 'Standard branching', input: 'root=[3,5,1,6,2,0,8], p=5, q=1', expected: '3' },
            { id: 'tc2', description: 'Manager is the LCA', input: 'root=[3,5,1,6,2,0,8], p=5, q=4', expected: '5' },
            { id: 'tc3', description: 'Linear tree', input: 'root=[1,2], p=1, q=2', expected: '1' },
            { id: 'tc4', description: 'Deep nested match', input: 'root=[6,2,8,0,4,7,9], p=2, q=8', expected: '6' },
            { id: 'tc5', description: 'Same side match', input: 'root=[6,2,8,0,4,7,9], p=2, q=4', expected: '2' },
        ],
    },
    {
        id: 'ENG-DSA-025',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'CDN Edge Node Routing (Greedy)',
        companies: ['Cloudflare', 'Fastly'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Greedy', 'Arrays'],
        nextChallengeId: 'ENG-DSA-026', // This will link directly to the next batch!
        realWorldContext: `Cloudflare's CDN routes packets through a chain of edge nodes. Each node has a maximum hop distance it can forward a packet. Some nodes in a degraded region can forward 0 hops (dead nodes). The system must quickly determine if a packet can traverse from the source edge to the destination without getting stuck at a zero-hop node.`,
        desc: 'You have an array representing CDN edge nodes in a sequential network line. The integer at each node is the maximum "hop distance" a packet can jump from that node. Determine if a packet starting at index 0 can successfully reach the last node in the network.',
        whyItMatters: `The Jump Game is a classic greedy algorithm problem that demonstrates why greedy sometimes beats DP. Rather than tracking every possible path (exponential), we just greedily track the farthest reachable index. If we ever find ourselves at an index we "shouldn't be able to reach," we've proven it's impossible. One scan, O(n), O(1) space.`,
        approach: `Maintain max_reach — the farthest index we can currently jump to. Iterate through each index. If the current index > max_reach, we're stuck (can't even reach this position). Otherwise, update max_reach = max(max_reach, i + hops[i]). Early exit if max_reach already reaches the last index.`,
        solution: 'This is the "Jump Game" problem. Use a Greedy approach. Maintain a `max_reach` integer starting at 0. Iterate through the array. If your current index is greater than `max_reach`, you are stuck (return False). Otherwise, update `max_reach = max(max_reach, i + nums[i])`. If `max_reach >= last_index`, return True.',
        walkthrough: [
            "hops=[3,2,1,0,4]. max_reach=0",
            "i=0: 0<=0. max_reach=max(0,0+3)=3",
            "i=1: 1<=3. max_reach=max(3,1+2)=3",
            "i=2: 2<=3. max_reach=max(3,2+1)=3",
            "i=3: 3<=3. max_reach=max(3,3+0)=3",
            "i=4: 4 > 3. STUCK! Return False ✓ (can never escape the 0 at index 3)"
        ],
        hints: [
            'You don\'t need to use Dynamic Programming or BFS here, which would be too slow. A simple O(n) greedy approach works.',
            'Keep track of the "farthest index" you can currently reach.',
            'If you ever step onto an index that is greater than your "farthest index", it means you are trapped at a zero and cannot proceed.'
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def can_reach_destination(hops: list[int]) -> bool:
    """
    hops: array of maximum jump distances from each position
    Returns True if you can reach the last index starting from index 0.
    
    Example: [2,3,1,1,4] → True  (many valid paths)
    Example:[3,2,1,0,4] → False (trapped at index 3, hops=0)
    """
    max_reach = 0
    last_index = len(hops) - 1
    
    for i in range(len(hops)):
        if i > max_reach:
            return False  # Can't even reach this index — we're stuck!
            
        max_reach = max(max_reach, i + hops[i])
        
        if max_reach >= last_index:
            return True   # Already proven we can reach the end
            
    return True  # Completed scan without getting stuck
`,
        testCases: [
            { id: 'tc1', description: 'Can reach end', input: 'hops=[2, 3, 1, 1, 4]', expected: 'True' },
            { id: 'tc2', description: 'Trapped at zero', input: 'hops=[3, 2, 1, 0, 4]', expected: 'False' },
            { id: 'tc3', description: 'Single node', input: 'hops=[0]', expected: 'True' },
            { id: 'tc4', description: 'Massive first jump', input: 'hops=[10, 0, 0, 0, 0]', expected: 'True' },
            { id: 'tc5', description: 'Just enough reach', input: 'hops=[1, 1, 1, 1]', expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-057',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Cache Invalidation Propagation (Multi-source BFS)',
        companies: ['Redis', 'Cloudflare'],
        timeEst: '~40 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'Matrix', 'BFS'],
        nextChallengeId: 'ENG-DSA-058',
        realWorldContext: `In a distributed caching system like Redis, an invalidation signal sent to edge nodes must propagate to neighboring nodes. If multiple edge nodes receive the signal simultaneously, the invalidation spreads out from multiple sources at once. We need to determine how many milliseconds it takes for the entire network to be invalidated.`,
        desc: 'Given an m x n grid representing servers: 0 is empty, 1 is a healthy server, 2 is an invalidated server. Every minute, any healthy server adjacent (4-directionally) to an invalidated server becomes invalidated. Return the minimum minutes to invalidate all servers. Return -1 if some servers are unreachable.',
        whyItMatters: `This is the "Rotting Oranges" problem. It introduces Multi-source BFS, a critical variant of standard BFS. By enqueuing multiple starting nodes at distance 0, the BFS queue naturally processes the expansion uniformly from all sources. This is used in virus spreading simulations, fire-spread models, and shortest-path-to-ANY-target problems.`,
        approach: `Find all initially invalidated servers (2s) and count the healthy servers (1s). Push all 2s into a queue with time=0. Perform standard BFS: pop a node, check its 4 neighbors. If a neighbor is a 1, turn it into a 2, decrement the healthy count, and push it to the queue with time+1. The maximum time seen is the answer. If healthy count > 0 at the end, return -1.`,
        solution: 'Multi-source BFS. Enqueue all initial sources. Track the number of remaining valid targets. Expand level-by-level, incrementing time. Return time if remaining targets hit 0, else -1.',
        walkthrough: [
            "Grid: [[2,1,1],[1,1,0],[0,1,1]]",
            "Initial: queue=[(0,0, time=0)]. fresh_count=6",
            "Minute 1: Pop (0,0). Neighbors (0,1) and (1,0) become 2. Queue=[(0,1, t=1), (1,0, t=1)]. fresh=4",
            "Minute 2: Pop (0,1), updates (0,2). Pop (1,0), updates (1,1). Queue=[(0,2, t=2), (1,1, t=2)]. fresh=2",
            "Minute 3: Pop (0,2). Pop (1,1), updates (2,1). Queue=[(2,1, t=3)]. fresh=1",
            "Minute 4: Pop (2,1), updates (2,2). fresh=0.",
            "All fresh invalidated. Max time = 4. ✓"
        ],
        hints: [
            'Standard BFS starts with 1 node in the queue. Multi-source BFS starts with ALL initial sources in the queue at time 0.',
            'Keep a running count of healthy servers. Decrement it every time you infect one.',
            'If the queue empties and the healthy count is still > 0, it means some servers are walled off (unreachable).'
        ],
        complexity: { time: 'O(m * n)', space: 'O(m * n)' },
        starterCode: `from collections import deque

def time_to_invalidate(grid: list[list[int]]) -> int:
    """
    0 = empty, 1 = healthy, 2 = invalidated
    Returns the minutes until all servers are invalidated, or -1 if impossible.
    """
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh_count = 0
    
    # 1. Initialize queue with all sources and count fresh servers
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0)) # row, col, time
            elif grid[r][c] == 1:
                fresh_count += 1
                
    if fresh_count == 0:
        return 0
        
    # 2. Multi-source BFS
    minutes_passed = 0
    directions =[(1,0), (-1,0), (0,1), (0,-1)]
    
    while queue:
        r, c, mins = queue.popleft()
        
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh_count -= 1
                minutes_passed = mins + 1
                queue.append((nr, nc, minutes_passed))
                
    return minutes_passed if fresh_count == 0 else -1
`,
        testCases: [
            { id: 'tc1', description: 'Standard spread', input: 'grid=[[2,1,1],[1,1,0],[0,1,1]]', expected: '4' },
            { id: 'tc2', description: 'Unreachable server', input: 'grid=[[2,1,1],[0,1,1],[1,0,1]]', expected: '-1' },
            { id: 'tc3', description: 'Already all invalid', input: 'grid=[[0,2]]', expected: '0' },
            { id: 'tc4', description: 'Multiple sources', input: 'grid=[[2,1,2],[1,1,1]]', expected: '1' },
            { id: 'tc5', description: 'Linear chain', input: 'grid=[[2,1,1,1,1]]', expected: '4' },
        ],
    },
    {
        id: 'ENG-DSA-058',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Hashtag Tokenization (Dynamic Programming)',
        companies: ['Twitter', 'Instagram'],
        timeEst: '~45 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Dynamic Programming', 'Trie', 'Hash Set'],
        nextChallengeId: 'ENG-DSA-059',
        realWorldContext: `Social media platforms often need to extract meaningful words from hashtags (e.g., "#iloveprogramming" -> "i", "love", "programming") for trend analysis and search indexing. Because spaces are omitted, the system must determine if the continuous string can be perfectly segmented into valid dictionary words.`,
        desc: 'Given a string `s` and a dictionary of words `wordDict`, return True if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
        whyItMatters: `This is the "Word Break" problem. A brute-force recursive approach trying every prefix will branch exponentially (O(2^n)). Dynamic Programming optimizes this to O(n^2) by saving the results of subproblems ("can the string starting at index i be segmented?").`,
        approach: `Create a boolean array dp of size len(s) + 1. dp[i] represents whether the substring s[0...i] can be segmented. Initialize dp[0] = True (empty string is valid). Iterate i from 1 to len(s). For each i, check all previous indices j. If dp[j] is True AND s[j...i] is in the dictionary, then dp[i] is True.`,
        solution: 'Use a bottom-up DP array where dp[i] indicates if s[:i] can be broken into valid words. For each length i, check if there is a split point j such that dp[j] is True and s[j:i] is in the word list.',
        walkthrough: [
            "s='leetcode', dict=['leet', 'code']",
            "dp =[T, F, F, F, F, F, F, F, F] (size 9)",
            "i=4 (checking 'leet'): j=0, dp[0]=T. 'leet' in dict? Yes. dp[4] = True.",
            "i=8 (checking 'leetcode'): j=4, dp[4]=T. 'code' in dict? Yes. dp[8] = True.",
            "Result: dp[8] = True ✓"
        ],
        hints: [
            'Convert the word dictionary to a Hash Set for O(1) lookups.',
            'Let dp[i] be True if the first i characters can be segmented into valid words.',
            'To calculate dp[i], find a j < i such that dp[j] is True and the substring from j to i is in the dictionary.'
        ],
        complexity: { time: 'O(n^3) string slicing makes inner loop O(n)', space: 'O(n)' },
        starterCode: `def can_segment_hashtag(s: str, wordDict: list[str]) -> bool:
    """
    s: the continuous hashtag string (e.g., "ilovecoding")
    wordDict: list of valid dictionary words
    Returns True if s can be fully segmented.
    """
    word_set = set(wordDict)
    # dp[i] will be True if s[0:i] can be segmented
    dp = [False] * (len(s) + 1)
    dp[0] = True  # Base case: empty string
    
    for i in range(1, len(s) + 1):
        for j in range(i):
            # If the first j chars can be segmented, 
            # and the remaining substring is a valid word
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break  # No need to check other splits for this i
                
    return dp[len(s)]
`,
        testCases: [
            { id: 'tc1', description: 'Clean split', input: "s='leetcode', dict=['leet', 'code']", expected: 'True' },
            { id: 'tc2', description: 'Overlapping words', input: "s='applepenapple', dict=['apple', 'pen']", expected: 'True' },
            { id: 'tc3', description: 'Unsegmentable', input: "s='catsandog', dict=['cats', 'dog', 'sand', 'and', 'cat']", expected: 'False' },
            { id: 'tc4', description: 'Single letter words', input: "s='aaaaaaa', dict=['aaaa', 'aaa']", expected: 'True' },
            { id: 'tc5', description: 'Missing one char', input: "s='cars', dict=['car', 'ca', 'rs']", expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-059',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'P99 Latency Calculation (Quickselect)',
        companies: ['Datadog', 'AWS'],
        timeEst: '~45 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Divide and Conquer', 'Sorting', 'Arrays'],
        nextChallengeId: 'ENG-DSA-060',
        realWorldContext: `Monitoring platforms like Datadog aggregate millions of latency metrics per minute. Calculating the P99 (99th percentile, or Kth largest element) requires sorting the entire array, which is O(N log N). However, if we only need the Kth element, Quickselect achieves this in O(N) average time, saving massive CPU cycles on ingestion pipelines.`,
        desc: 'Given an unsorted array of latency logs, return the Kth largest element in the array. You must solve it in O(N) average time complexity without fully sorting the array.',
        whyItMatters: `Kth Largest Element is a classic test of algorithmic fundamentals. While a Min-Heap solves it in O(N log K), Quickselect (based on Quicksort's partitioning) solves it in O(N) average time. It proves you understand pivot partitioning and divide-and-conquer mechanics.`,
        approach: `Pick a random pivot. Partition the array into three parts: elements > pivot, elements == pivot, and elements < pivot. Since we want the Kth largest, we look at the sizes of these partitions. If K <= len(greater), the answer is in the 'greater' array. If K > len(greater) + len(equal), it's in the 'smaller' array. Otherwise, the pivot IS the answer.`,
        solution: 'Use Quickselect with 3-way partitioning. Recursively narrow down the search space to just the partition that contains the Kth largest index.',
        walkthrough: [
            "nums=[3,2,1,5,6,4], k=2 (Find 2nd largest)",
            "Pivot = 4. Greater=[5,6], Equal=[4], Smaller=[3,2,1]",
            "We want 2nd largest. len(Greater) = 2. K <= 2? Yes! The answer is in Greater.",
            "Recurse Quickselect on Greater=[5,6], k=2.",
            "Pivot = 6. Greater=[], Equal=[6], Smaller=[5].",
            "len(Greater)=0. K=2. Is K <= 0? No. Is K <= 0 + 1 (Equal)? No. K > 1.",
            "So answer is in Smaller=[5]. New k = 2 - 1 = 1. Recurse...",
            "Pivot=5. Equal=[5]. Returns 5. ✓"
        ],
        hints: [
            'A full sort is O(N log N). A heap is O(N log K). Quickselect is O(N) average.',
            'Pick a pivot. Separate numbers into three lists: > pivot, == pivot, < pivot.',
            'Compare K against the lengths of these lists to decide which single list to recursively search.'
        ],
        complexity: { time: 'O(N) average, O(N^2) worst', space: 'O(N) for array slices' },
        starterCode: `import random

def find_kth_largest(nums: list[int], k: int) -> int:
    """
    Finds the kth largest element in O(N) average time using Quickselect.
    """
    if not nums:
        return -1
        
    pivot = random.choice(nums)
    
    # 3-way partitioning
    greater = [x for x in nums if x > pivot]
    equal =[x for x in nums if x == pivot]
    smaller = [x for x in nums if x < pivot]
    
    # Kth largest must be in the 'greater' list
    if k <= len(greater):
        return find_kth_largest(greater, k)
        
    # Kth largest is exactly the pivot
    elif k <= len(greater) + len(equal):
        return pivot
        
    # Kth largest is in the 'smaller' list
    # Adjust K because we are discarding 'greater' and 'equal'
    else:
        return find_kth_largest(smaller, k - len(greater) - len(equal))
`,
        testCases: [
            { id: 'tc1', description: 'Standard case', input: 'nums=[3,2,1,5,6,4], k=2', expected: '5' },
            { id: 'tc2', description: 'Duplicates present', input: 'nums=[3,2,3,1,2,4,5,5,6], k=4', expected: '4' },
            { id: 'tc3', description: 'Find max (K=1)', input: 'nums=[10, 9, 99, 33], k=1', expected: '99' },
            { id: 'tc4', description: 'Find min (K=N)', input: 'nums=[5, 1, 3], k=3', expected: '1' },
            { id: 'tc5', description: 'All same numbers', input: 'nums=[2,2,2,2], k=2', expected: '2' },
        ],
    },
    {
        id: 'ENG-DSA-060',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Packet Data Compression (Sliding Window)',
        companies: ['Cisco', 'Amazon'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Sliding Window', 'Hash Map', 'Strings'],
        nextChallengeId: 'ENG-DSA-061',
        realWorldContext: `LZ77 and LZ78 compression algorithms (used in gzip and PNG formats) scan streams of bytes looking for the longest sequences without duplicate characters. Efficiently finding the longest substring without repeating characters is a core sub-routine in stream compression logic.`,
        desc: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        whyItMatters: `This is arguably the most famous Sliding Window problem. It bridges the gap between fixed-size windows and dynamically resizing windows. Instead of recalculating from scratch, the left pointer "jumps" forward to bypass duplicates, achieving O(N) time.`,
        approach: `Use two pointers (left and right) and a Hash Map tracking the last seen index of every character. Expand the right pointer. If the character at right is already in the map AND its stored index is >= left pointer, we found a duplicate inside our current window. Instantly shrink the window by jumping the left pointer to last_seen_index + 1. Update max length.`,
        solution: 'Sliding window with Hash Map. Map stores char -> latest_index. If char is in map and index >= left_pointer, move left_pointer to map[char] + 1. Update map[char] = right. Max length = max(max, right - left + 1).',
        walkthrough: [
            "s='abcabcbb'. Map={}, left=0, max_len=0",
            "r=0 ('a'): Map={'a':0}, max=1. Window='a'",
            "r=1 ('b'): Map={'a':0, 'b':1}, max=2. Window='ab'",
            "r=2 ('c'): Map={'a':0, 'b':1, 'c':2}, max=3. Window='abc'",
            "r=3 ('a'): 'a' is in map at idx 0 (>= left). Jump left to 0+1=1. Map={'a':3}, max=3. Window='bca'",
            "r=4 ('b'): 'b' in map at idx 1 (>= left). Jump left to 1+1=2. Map={'b':4}. Window='cab'"
        ],
        hints: [
            'Use a Hash Map to store the last seen index of each character.',
            'Keep a `left` pointer for the start of your window. Iterate a `right` pointer.',
            'If `s[right]` is in your map AND its stored index is >= `left`, you must move `left` to `stored_index + 1` to exclude the duplicate.'
        ],
        complexity: { time: 'O(N)', space: 'O(min(N, charset))' },
        starterCode: `def length_of_longest_substring(s: str) -> int:
    """
    Returns the length of the longest substring without repeating characters.
    """
    char_map = {}  # Stores char -> last seen index
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        char = s[right]
        
        # If we've seen this character and it's inside our current window,
        # shrink the window by moving the left pointer past the old duplicate.
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
            
        # Update the latest index of this character
        char_map[char] = right
        
        # Calculate current window size
        max_len = max(max_len, right - left + 1)
        
    return max_len
`,
        testCases: [
            { id: 'tc1', description: 'Standard repeating', input: "s='abcabcbb'", expected: '3 ("abc")' },
            { id: 'tc2', description: 'All same chars', input: "s='bbbbb'", expected: '1 ("b")' },
            { id: 'tc3', description: 'Sequence in middle', input: "s='pwwkew'", expected: '3 ("wke")' },
            { id: 'tc4', description: 'Empty string', input: "s=''", expected: '0' },
            { id: 'tc5', description: 'No repeats', input: "s='abcdef'", expected: '6' },
        ],
    },
    {
        id: 'ENG-DSA-061',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Cross-Sell Recommendation Scoring (Prefix/Suffix Arrays)',
        companies: ['Amazon', 'Instacart'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Arrays', 'Math', 'Prefix Sum'],
        nextChallengeId: 'ENG-DSA-062',
        realWorldContext: `In e-commerce recommendation models like Naive Bayes, calculating the combined probability of "all other items EXCEPT this one" is required to find conditional independence. If the array contains probability scores, division is mathematically risky due to floating point zeroes. We need to compute the product of all elements except 'i' without using division.`,
        desc: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(N) time and without using the division operation.',
        whyItMatters: `Product of Array Except Self is a genius application of Prefix and Suffix arrays. By separating "everything to the left" and "everything to the right" into two passes, you replace an O(N^2) double-loop with O(N) linear time. Eliminating the division operator handles the dreaded "array contains zero" edge case perfectly.`,
        approach: `Create an output array. First pass (Left to Right): Store the running product of all elements to the LEFT of i. (For i=0, this is 1). Second pass (Right to Left): Keep a running variable of the product of all elements to the RIGHT of i. Multiply the output array at index i by this running right product.`,
        solution: 'Two passes. First pass builds prefixes: output[i] = product of all elements to the left. Second pass multiplies suffixes: multiply output[i] by running product of all elements to the right.',
        walkthrough: [
            "nums = [1, 2, 3, 4]",
            "Left Pass: out=[1, 1*1=1, 1*2=2, 2*3=6] ->[1, 1, 2, 6]",
            "Right Pass (starts at end, running_right=1):",
            "i=3: out[3]=6*1=6. running_right = 1*4=4",
            "i=2: out[2]=2*4=8. running_right = 4*3=12",
            "i=1: out[1]=1*12=12. running_right = 12*2=24",
            "i=0: out[0]=1*24=24.",
            "Final output = [24, 12, 8, 6] ✓"
        ],
        hints: [
            'You cannot use division. What if you just precalculate the product of everything to the left of index i, and everything to the right?',
            'You can do this in two O(N) sweeps. Sweep left-to-right, then right-to-left.',
            'To save space, you can store the left products directly in your output array, and compute the right products on the fly using a single variable.'
        ],
        complexity: { time: 'O(N)', space: 'O(1) excluding output array' },
        starterCode: `def product_except_self(nums: list[int]) -> list[int]:
    """
    Returns an array where answer[i] is the product of all elements except nums[i].
    Must not use division and must run in O(N).
    """
    n = len(nums)
    output = [1] * n
    
    # Pass 1: Calculate left products
    left_product = 1
    for i in range(n):
        output[i] = left_product
        left_product *= nums[i]
        
    # Pass 2: Calculate right products and multiply with left products
    right_product = 1
    for i in range(n - 1, -1, -1):
        output[i] *= right_product
        right_product *= nums[i]
        
    return output
`,
        testCases: [
            { id: 'tc1', description: 'Standard array', input: 'nums=[1, 2, 3, 4]', expected: '[24, 12, 8, 6]' },
            { id: 'tc2', description: 'Contains one zero', input: 'nums=[-1, 1, 0, -3, 3]', expected: '[0, 0, 9, 0, 0]' },
            { id: 'tc3', description: 'Contains multiple zeros', input: 'nums=[0, 4, 0]', expected: '[0, 0, 0]' },
            { id: 'tc4', description: 'Two elements', input: 'nums=[5, 9]', expected: '[9, 5]' },
            { id: 'tc5', description: 'All negatives', input: 'nums=[-2, -3, -4]', expected: '[12, 8, 6]' },
        ],
    },
    {
        id: 'ENG-DSA-062',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Shard Lookup (Binary Search)',
        companies: ['Netflix', 'DataStax'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays'],
        nextChallengeId: 'ENG-DSA-063',
        realWorldContext: `Distributed databases like Cassandra use Consistent Hashing rings. When nodes are added or fail, the sorted array of shard IDs is mathematically "rotated". To route a query to the primary shard (the minimum ID in the ring), we must find the start of this rotated sorted array in O(log N) time.`,
        desc: 'Suppose an array of unique integers sorted in ascending order is rotated at an unknown pivot index. Given this rotated sorted array `nums`, return the minimum element in O(log N) time.',
        whyItMatters: `Find Minimum in Rotated Sorted Array bridges standard Binary Search with array discontinuity. It tests your ability to identify the "sorted half" versus the "unsorted half" of an array purely by comparing \`mid\` to \`right\`.`,
        approach: `In a rotated sorted array, the minimum element is the only element that is smaller than its previous element. Using Binary Search: compare \`mid\` with \`right\`. If \`nums[mid] > nums[right]\`, the minimum MUST be to the right of mid (because the right side is unordered). If \`nums[mid] <= nums[right]\`, the minimum is at mid or to the left. Shrink the window until left == right.`,
        solution: 'Binary Search. Compare `nums[mid]` to `nums[right]`. If mid is greater, `left = mid + 1`. Else, `right = mid`. Loop until `left == right`.',
        walkthrough: [
            "nums =[4, 5, 6, 7, 0, 1, 2]",
            "left=0 (4), right=6 (2). mid=3 (7).",
            "nums[mid]=7 > nums[right]=2. The rotation happened to the right. left = mid+1 = 4.",
            "left=4 (0), right=6 (2). mid=5 (1).",
            "nums[mid]=1 <= nums[right]=2. The right side is strictly sorted. Minimum is mid or left. right = mid = 5.",
            "left=4 (0), right=5 (1). mid=4 (0).",
            "nums[mid]=0 <= nums[right]=1. right = mid = 4.",
            "left==right==4. Minimum is nums[4] = 0. ✓"
        ],
        hints: [
            'Because the array is rotated, one half of the array will always be strictly increasing, and the other half will contain the "drop-off".',
            'Compare `nums[mid]` to `nums[right]`.',
            'If `nums[mid] > nums[right]`, the smallest value must be to the right of `mid`. Otherwise, it is at `mid` or to the left.'
        ],
        complexity: { time: 'O(log N)', space: 'O(1)' },
        starterCode: `def find_min_in_rotated(nums: list[int]) -> int:
    """
    Returns the minimum element in a rotated sorted array in O(log n) time.
    """
    left = 0
    right = len(nums) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        # If mid element is greater than the rightmost element,
        # the drop-off (minimum) must be to the right
        if nums[mid] > nums[right]:
            left = mid + 1
        # Otherwise, the right side is sorted, meaning the 
        # minimum is at mid or to the left of mid.
        else:
            right = mid
            
    # When left == right, we've found the minimum
    return nums[left]
`,
        testCases: [
            { id: 'tc1', description: 'Rotated middle', input: 'nums=[4, 5, 6, 7, 0, 1, 2]', expected: '0' },
            { id: 'tc2', description: 'Rotated by 1', input: 'nums=[3, 1, 2]', expected: '1' },
            { id: 'tc3', description: 'Not actually rotated', input: 'nums=[11, 13, 15, 17]', expected: '11' },
            { id: 'tc4', description: 'Two elements', input: 'nums=[2, 1]', expected: '1' },
            { id: 'tc5', description: 'Rotated near end', input: 'nums=[5, 1, 2, 3, 4]', expected: '1' },
        ],
    },
    {
        id: 'ENG-DSA-063',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Sparse Matrix Integrity Check (Hash Sets)',
        companies: ['Apple', 'Microsoft'],
        timeEst: '~25 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Matrix', 'Hash Set'],
        nextChallengeId: 'ENG-DSA-064',
        realWorldContext: `Scientific computing and machine learning platforms frequently validate structured constraint grids (Sparse Matrices) before running expensive GPU computations. Valid Sudoku is a proxy for this: ensuring no row, column, or specific sub-grid violates uniqueness constraints in O(N^2) time.`,
        desc: 'Determine if a 9x9 Sudoku board is valid. Only the filled cells need to be validated. Each row, column, and 3x3 sub-box must contain the digits 1-9 without repetition. Empty cells are filled with `.`.',
        whyItMatters: `Valid Sudoku requires mapping 2D matrix coordinates into 1D Hash Set identifiers. Specifically, identifying which 3x3 sub-box an \`(r, c)\` coordinate belongs to \`(r//3, c//3)\` is a highly reusable math trick for grid-based algorithms.`,
        approach: `Create three arrays of Hash Sets: 9 for rows, 9 for cols, and 9 for the 3x3 squares. Iterate over the board once. For every number found at (r, c), check if it exists in rows[r], cols[c], or squares[(r//3)*3 + (c//3)]. If it does, return False. Otherwise, add it to those sets.`,
        solution: 'Use Hash Sets to track seen numbers for each row, column, and 3x3 box. The box index is calculated as `(r // 3) * 3 + (c // 3)`. One pass, O(1) space since grid is strictly 9x9.',
        walkthrough: [
            "Grid has '5' at (0, 0). Add '5' to rows[0], cols[0], boxes[0].",
            "Grid has '5' at (2, 2). Box index for (2, 2) is (2//3)*3 + (2//3) = 0.",
            "Is '5' in boxes[0]? YES. Collision detected! Return False."
        ],
        hints: [
            'You only need to validate the numbers currently on the board, not solve it.',
            'You need to know if a number has been seen in its Row, Column, or 3x3 Box.',
            'The tricky part: Which 3x3 box does (r, c) belong to? Try integer division: `box_id = (r // 3) * 3 + (c // 3)`.'
        ],
        complexity: { time: 'O(1) strict 9x9 grid', space: 'O(1) strict 9x9 constraints' },
        starterCode: `def is_valid_sudoku(board: list[list[str]]) -> bool:
    """
    board: 9x9 2D array of chars
    Returns True if the board state is valid according to Sudoku rules.
    """
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes =[set() for _ in range(9)]
    
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
                
            # Calculate box index 0-8
            box_idx = (r // 3) * 3 + (c // 3)
            
            # Check for collisions
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return False
                
            # Add to sets
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
            
    return True
`,
        testCases: [
            { id: 'tc1', description: 'Valid board', input: 'Valid 9x9 standard sudoku configuration', expected: 'True' },
            { id: 'tc2', description: 'Row collision', input: "Two '5's in row 0", expected: 'False' },
            { id: 'tc3', description: 'Col collision', input: "Two '9's in col 8", expected: 'False' },
            { id: 'tc4', description: 'Box collision', input: "Two '1's in the top-left 3x3 box", expected: 'False' },
            { id: 'tc5', description: 'Empty board', input: 'All cells are "."', expected: 'True' },
        ],
    },
    {
        id: 'ENG-DSA-064',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Drone Area Sweep (Matrix Traversal)',
        companies: ['Tesla', 'Waymo'],
        timeEst: '~35 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Matrix', 'Simulation'],
        nextChallengeId: 'ENG-DSA-065',
        realWorldContext: `Autonomous farming drones and robotic vacuum cleaners need to cover a rectangular plot of land efficiently. The spiral sweep pattern starts at the perimeter and circles inward. Generating the navigation waypoints requires translating this 2D matrix boundary contraction into sequential logic.`,
        desc: 'Given an `m x n` matrix, return all elements of the matrix in spiral order (starting from top-left, going right, down, left, up, inward).',
        whyItMatters: `Spiral Matrix is a pure array manipulation and boundary tracking problem. It has no "trick" (like DP or Hash Sets); it simply tests a developer's ability to maintain clear mental models of multiple moving boundary variables without succumbing to off-by-one errors.`,
        approach: `Maintain 4 boundaries: top, bottom, left, right. Use a while loop as long as \`top <= bottom\` and \`left <= right\`. Traverse left->right, then increment top. Traverse top->bottom, decrement right. Traverse right->left, decrement bottom. Traverse bottom->top, increment left. IMPORTANT: Check boundaries again before traversing left and up to prevent duplicate processing on non-square matrices.`,
        solution: 'Track 4 boundaries. Loop through the 4 directions sequentially. Shrink boundaries after each directional pass. Add safety checks for single row/col remnants.',
        walkthrough: [
            "Matrix: [[1,2,3],[4,5,6],[7,8,9]]",
            "top=0, bot=2, left=0, right=2",
            "Go right: 1, 2, 3. top becomes 1.",
            "Go down: 6, 9. right becomes 1.",
            "Go left: 8, 7. bot becomes 1.",
            "Go up: 4. left becomes 1.",
            "top(1) <= bot(1) and left(1) <= right(1). Go right: 5. top=2.",
            "top > bot. Loop ends. Output: 1,2,3,6,9,8,7,4,5 ✓"
        ],
        hints: [
            'Set up `top`, `bottom`, `left`, and `right` boundary variables.',
            'After traversing the top row from left to right, increment the `top` boundary.',
            'Because matrices can be rectangles (not just squares), ensure `top <= bottom` and `left <= right` before doing the backward passes (right-to-left and bottom-to-top).'
        ],
        complexity: { time: 'O(m * n)', space: 'O(1) excluding output' },
        starterCode: `def spiral_order(matrix: list[list[int]]) -> list[int]:
    """
    Returns elements of the matrix in a spiral order.
    """
    if not matrix:
        return[]
        
    result =[]
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # Traverse from left to right across the top row
        for i in range(left, right + 1):
            result.append(matrix[top][i])
        top += 1
        
        # Traverse from top to bottom down the right column
        for i in range(top, bottom + 1):
            result.append(matrix[i][right])
        right -= 1
        
        if top <= bottom:
            # Traverse from right to left across the bottom row
            for i in range(right, left - 1, -1):
                result.append(matrix[bottom][i])
            bottom -= 1
            
        if left <= right:
            # Traverse from bottom to top up the left column
            for i in range(bottom, top - 1, -1):
                result.append(matrix[i][left])
            left += 1
            
    return result
`,
        testCases: [
            { id: 'tc1', description: '3x3 Square', input: '[[1,2,3],[4,5,6],[7,8,9]]', expected: '[1,2,3,6,9,8,7,4,5]' },
            { id: 'tc2', description: '3x4 Rectangle', input: '[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', expected: '[1,2,3,4,8,12,11,10,9,5,6,7]' },
            { id: 'tc3', description: 'Single row', input: '[[1,2,3]]', expected: '[1,2,3]' },
            { id: 'tc4', description: 'Single column', input: '[[1],[2],[3]]', expected: '[1,2,3]' },
            { id: 'tc5', description: 'Empty', input: '[]', expected: '[]' },
        ],
    },
    {
        id: 'ENG-DSA-065',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Real-time API Analytics (Queue/Deque)',
        companies: ['Stripe', 'Datadog'],
        timeEst: '~25 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Design', 'Queue', 'Streaming'],
        nextChallengeId: 'ENG-DSA-066',
        realWorldContext: `API Gateways like Stripe must display "Requests in the last 5 minutes" on their analytics dashboards. Storing every timestamp forever causes Out-Of-Memory crashes. Using a sliding queue dynamically prunes data older than 300 seconds, maintaining a strict upper memory bound.`,
        desc: 'Design a HitCounter class that tracks the number of API hits. It should support `hit(timestamp)` to record a hit, and `get_hits(timestamp)` to return the total hits in the past 5 minutes (300 seconds). Timestamps are strictly increasing.',
        whyItMatters: `Design Hit Counter bridges Data Structures and System Design. Answering it with an array is fine, but using a Queue/Deque to prune stale data proves you understand memory limits. For scaling to massive concurrent traffic, grouping hits into \`[timestamp, count]\` buckets is the senior-level optimization.`,
        approach: `Use a Queue. When \`hit(t)\` is called, push \`t\` to the queue. When \`get_hits(t)\` is called, peek at the front of the queue. If the front timestamp is <= \`t - 300\`, pop it out. Repeat until the front is within the 300-second window. The number of valid hits is simply the size of the queue.`,
        solution: 'Store incoming timestamps in a deque. On every read request, pop elements from the left of the deque if they are older than timestamp - 300. Return length of deque.',
        walkthrough: [
            "hit(1), hit(2), hit(300). Queue=[1, 2, 300]",
            "get_hits(300): window is (0, 300]. Queue has 1,2,300. length=3.",
            "hit(301). Queue=[1, 2, 300, 301]",
            "get_hits(302): window is (2, 302]. Front is 1. 1 <= 302-300? Yes, Pop 1. Front is 2. 2 <= 2? Yes, Pop 2.",
            "Queue now=[300, 301]. length=2. ✓"
        ],
        hints: [
            'A fixed window of 300 seconds means you only care about events where `event_time > current_time - 300`.',
            'Since timestamps arrive in order, the oldest events are always at the start of your data structure.',
            'Use a double-ended queue (deque). Pop from the left to remove expired timestamps.'
        ],
        complexity: { time: 'O(1) amortized', space: 'O(W) where W is max hits in 300 seconds' },
        starterCode: `from collections import deque

class HitCounter:
    def __init__(self):
        # Stores incoming timestamps
        self.hits = deque()

    def hit(self, timestamp: int) -> None:
        """
        Record a hit at the given timestamp (in seconds).
        """
        self.hits.append(timestamp)

    def get_hits(self, timestamp: int) -> int:
        """
        Return the number of hits in the past 5 minutes (300 seconds).
        """
        # Prune timestamps older than 5 minutes
        while self.hits and self.hits[0] <= timestamp - 300:
            self.hits.popleft()
            
        # The remaining elements fall within the 300-second window
        return len(self.hits)
`,
        testCases: [
            { id: 'tc1', description: 'All in window', input: 'hit(1), hit(2), get_hits(4)', expected: '2' },
            { id: 'tc2', description: 'Exactly on boundary', input: 'hit(1), get_hits(300), get_hits(301)', expected: '1 at 300, 0 at 301' },
            { id: 'tc3', description: 'Rolling window', input: 'hit(100), hit(200), hit(300), get_hits(450)', expected: '2 (200 and 300)' },
            { id: 'tc4', description: 'Burst traffic', input: 'hit(1), hit(1), hit(1), get_hits(2)', expected: '3' },
            { id: 'tc5', description: 'Massive skip', input: 'hit(1), get_hits(1000)', expected: '0' },
        ],
    },
    {
        id: 'ENG-DSA-066',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Optimal Server Rack Cooling (Two Pointers)',
        companies: ['Google', 'Meta'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Two Pointers', 'Greedy', 'Arrays'],
        nextChallengeId: 'ENG-DSA-067',
        realWorldContext: `Datacenter aisle containment relies on calculating the physical volume of cold air trapped between server racks of varying heights. To optimally place the heaviest computing workloads, infrastructure engineers must identify the two server racks across a floor plan that create the largest physical containment zone.`,
        desc: 'Given an array of server rack heights, choose two racks such that, combined with the floor between them, they form a container that holds the most volume (area). You cannot slant the container. Return the maximum area.',
        whyItMatters: `This is "Container With Most Water". It introduces a greedy optimization that turns an O(N^2) brute force geometry problem into a beautiful O(N) Two Pointers solution. You must identify that the limiting factor in the area calculation is always the SHORTER line.`,
        approach: `Start with the widest possible container: pointers at the extreme left and right ends. The area is \`width * min(height[left], height[right])\`. To maximize the area, we must seek taller lines. Since the current limiting factor is the shorter line, move the pointer of the shorter line inward. Repeat until left meets right.`,
        solution: 'Two pointers at ends. Calculate area. Move the pointer pointing to the shorter height inward. Keep tracking the maximum area seen.',
        walkthrough: [
            "heights=[1,8,6,2,5,4,8,3,7]",
            "L=0 (val 1), R=8 (val 7). Width=8. Area = 8 * min(1,7) = 8.",
            "L is shorter (1 < 7). Move L to 1 (val 8).",
            "L=1 (val 8), R=8 (val 7). Width=7. Area = 7 * min(8,7) = 49. Max=49.",
            "R is shorter (7 < 8). Move R to 7 (val 3). Area = 6 * min(8,3) = 18.",
            "Continue moving the shorter bar... max area remains 49. ✓"
        ],
        hints: [
            'Start with the maximum possible width (pointers at indices 0 and len-1).',
            'The area is limited by the shorter height. To find a potentially larger area, you MUST replace the shorter line with a potentially taller one.',
            'Therefore, safely move the pointer that points to the smaller height inward.'
        ],
        complexity: { time: 'O(N)', space: 'O(1)' },
        starterCode: `def max_containment_area(heights: list[int]) -> int:
    """
    Returns the maximum area contained by two server racks.
    Area = distance_between_racks * min(rack1_height, rack2_height)
    """
    left = 0
    right = len(heights) - 1
    max_area = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(heights[left], heights[right])
        current_area = width * current_height
        
        # Update max
        max_area = max(max_area, current_area)
        
        # Move the limiting (shorter) pointer inward to seek a taller line
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
            
    return max_area
`,
        testCases: [
            { id: 'tc1', description: 'Classic peaks', input: 'heights=[1,8,6,2,5,4,8,3,7]', expected: '49' },
            { id: 'tc2', description: 'Two identical heights', input: 'heights=[1,1]', expected: '1' },
            { id: 'tc3', description: 'Tall inner peaks', input: 'heights=[1,2,100,100,2,1]', expected: '100' },
            { id: 'tc4', description: 'Decreasing heights', input: 'heights=[9,8,7,6,5]', expected: '20' },
            { id: 'tc5', description: 'Flat landscape', input: 'heights=[5,5,5,5,5]', expected: '20' },
        ],
    },
    {
        id: 'ENG-DSA-067',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Build Order Execution (Topological Sort)',
        companies: ['GitHub', 'Atlassian'],
        timeEst: '~40 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Graphs', 'Topological Sort', 'BFS'],
        nextChallengeId: 'ENG-DSA-068',
        realWorldContext: `GitHub Actions and other CI/CD runners must execute jobs in the correct order based on "needs" dependencies. Unlike just checking if a build is possible (cycle detection), the engine must produce the exact sequence of jobs to pass to the worker nodes.`,
        desc: 'Given an integer `num_jobs` and an array of `dependencies` where `[a, b]` means job `a` depends on job `b` finishing first, return the exact order jobs should be executed. If there is a cycle, return an empty array.',
        whyItMatters: `This is "Course Schedule II". While cycle detection (DFS/Coloring) just returns a boolean, Kahn's Algorithm (BFS) naturally yields the topological ordering of the graph. This is the exact algorithm package managers (npm, pip) use to install dependencies.`,
        approach: `Count the "in-degree" (number of prerequisites) for every job. Put all jobs with 0 in-degree into a queue (they are ready to run). Pop a job, add it to the execution order, and decrement the in-degree of all jobs that depend on it. If a dependent job reaches 0 in-degree, push it to the queue. If the final order length equals num_jobs, return it. Otherwise, a cycle exists.`,
        solution: 'Use Kahn\'s Algorithm. Build an adjacency list and in-degree array. Queue nodes with 0 in-degree. Pop, append to result, decrement neighbors. Return result if it contains all nodes, else [].',
        walkthrough: [
            "num_jobs=4, deps=[[1,0], [2,0], [3,1], [3,2]]",
            "In-degrees: 0:0, 1:1, 2:1, 3:2. Queue=[0]",
            "Pop 0. Result=[0]. Decrement 1 and 2. In-degrees: 1:0, 2:0. Queue=[1, 2]",
            "Pop 1. Result=[0, 1]. Decrement 3. In-degree 3:1. Queue=[2]",
            "Pop 2. Result=[0, 1, 2]. Decrement 3. In-degree 3:0. Queue=[3]",
            "Pop 3. Result=[0, 1, 2, 3]. Queue empty.",
            "Len(Result) == 4. Return [0, 1, 2, 3] ✓"
        ],
        hints: [
            'Create an array `in_degree` of size `num_jobs` initialized to 0.',
            'Create an adjacency list `graph` mapping `prereq -> list of dependent jobs`.',
            'Use a queue to process all jobs that currently have 0 prerequisites.'
        ],
        complexity: { time: 'O(V + E)', space: 'O(V + E)' },
        starterCode: `from collections import deque, defaultdict

def find_execution_order(num_jobs: int, dependencies: list[list[int]]) -> list[int]:
    """
    dependencies: [dependent_job, prerequisite_job]
    Returns an array of the job execution order.
    Returns[] if impossible due to cycles.
    """
    adj = defaultdict(list)
    in_degree = [0] * num_jobs
    
    for job, prereq in dependencies:
        adj[prereq].append(job)
        in_degree[job] += 1
        
    queue = deque([i for i in range(num_jobs) if in_degree[i] == 0])
    order =[]
    
    while queue:
        current = queue.popleft()
        order.append(current)
        
        for neighbor in adj[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    if len(order) == num_jobs:
        return order
    return []
`,
        testCases: [
            { id: 'tc1', description: 'Linear dependency', input: 'num_jobs=2, deps=[[1,0]]', expected: '[0, 1]' },
            { id: 'tc2', description: 'Fork and join', input: 'num_jobs=4, deps=[[1,0],[2,0],[3,1],[3,2]]', expected: '[0, 1, 2, 3] or [0, 2, 1, 3]' },
            { id: 'tc3', description: 'Impossible cycle', input: 'num_jobs=2, deps=[[1,0],[0,1]]', expected: '[]' },
            { id: 'tc4', description: 'No dependencies', input: 'num_jobs=3, deps=[]', expected: '[0, 1, 2]' },
            { id: 'tc5', description: 'Disconnected components', input: 'num_jobs=4, deps=[[1,0],[3,2]]', expected: '[0, 2, 1, 3] (any valid topological order)' },
        ],
    },
    {
        id: 'ENG-DSA-068',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Compute Fleet Upgrades (Binary Search on Answer)',
        companies: ['AWS', 'Airbnb'],
        timeEst: '~40 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays', 'Math'],
        nextChallengeId: 'ENG-DSA-069',
        realWorldContext: `AWS needs to patch a fleet of servers distributed across different clusters. An automated script patches servers at a rate of K servers per hour. The patch window closes in H hours. If the script finishes a cluster early, it idles for the rest of the hour. We need to find the absolute minimum speed K that guarantees all servers are patched before the deadline.`,
        desc: 'Given an array of clusters representing the number of servers in each, and a deadline `H` hours. You can patch `K` servers per hour. If a cluster has fewer than `K` servers, you patch them and idle for the rest of the hour. Return the minimum integer `K` such that all servers are patched within `H` hours.',
        whyItMatters: `This is "Koko Eating Bananas". It introduces the "Binary Search on the Answer Space" pattern. Instead of binary searching indices of an array, you binary search the *range of possible answers* (from 1 to Max Value). This pattern appears in Capacity to Ship Packages, Allocate Books, and Split Array Largest Sum.`,
        approach: `The minimum possible speed is 1. The maximum possible speed is the largest cluster size (since going faster doesn't save time due to idling). Binary search this range [1, max(clusters)]. For a given mid-point speed \`K\`, calculate the total hours needed using \`math.ceil(cluster / K)\`. If total_hours <= H, this speed is valid, but we might be able to go slower (search left). If total_hours > H, we are too slow (search right).`,
    solution: 'Binary search between 1 and max(clusters). For each speed `mid`, calculate total hours. If valid, try a slower speed (right = mid). Else try a faster speed (left = mid + 1).',
    walkthrough: [
        "clusters=[3, 6, 7, 11], H=8",
        "Left=1, Right=11. Mid=6.",
        "Test K=6: ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6 hours.",
        "6 hours <= 8 hours. K=6 works! Can we go slower? Right=6.",
        "Left=1, Right=6. Mid=3.",
        "Test K=3: ceil(3/3)+ceil(6/3)+ceil(7/3)+ceil(11/3) = 1+2+3+4 = 10 hours.",
        "10 hours > 8 hours. Too slow! Left=4.",
        "Eventually converges to K=4. Total hours = 1+2+2+3 = 8. ✓"
    ],
    hints: [
        'What is the absolute maximum speed you would ever need? (Hint: the largest cluster).',
        'Binary search between 1 and the maximum cluster size.',
        'To calculate hours for a specific cluster at speed K, use `math.ceil(cluster_size / K)`.'
    ],
    complexity: { time: 'O(N log M) where M is max cluster size', space: 'O(1)' },
    starterCode: `import math

def min_patching_speed(clusters: list[int], H: int) -> int:
    """
    Returns the minimum speed K to patch all clusters within H hours.
    """
    left = 1
    right = max(clusters)
    
    def can_finish(speed: int) -> bool:
        hours = 0
        for cluster in clusters:
            hours += math.ceil(cluster / speed)
        return hours <= H
        
    while left < right:
        mid = left + (right - left) // 2
        
        if can_finish(mid):
            # Speed is valid, try to find a slower one
            right = mid
        else:
            # Speed is too slow, must go faster
            left = mid + 1
            
    return left
`,
    testCases: [
        { id: 'tc1', description: 'Classic case', input: 'clusters=[3,6,7,11], H=8', expected: '4' },
        { id: 'tc2', description: 'Exact hours match', input: 'clusters=[30,11,23,4,20], H=5', expected: '30' },
        { id: 'tc3', description: 'Plenty of time', input: 'clusters=[30,11,23,4,20], H=6', expected: '23' },
        { id: 'tc4', description: 'Single cluster', input: 'clusters=[100], H=10', expected: '10' },
        { id: 'tc5', description: '1 hour per cluster', input: 'clusters=[5,5,5], H=3', expected: '5' },
    ],
    },
{
    id: 'ENG-DSA-069',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Out-of-Band Event Insertion (Insert Interval)',
                    companies: ['Google Calendar', 'Microsoft'],
                        timeEst: '~35 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Arrays', 'Intervals'],
                                        nextChallengeId: 'ENG-DSA-070',
                                            realWorldContext: `When a P0 incident is declared, an out-of-band "War Room" event is forcefully inserted into an on-call engineer's calendar. Any existing meetings that overlap with this new event must be absorbed and rescheduled as a single contiguous block of "Busy" time to prevent double-booking.`,
                                                desc: 'Given a set of non-overlapping intervals sorted by start time, insert a new interval into the intervals (merge if necessary). Return the final list of merged intervals.',
                                                    whyItMatters: `Unlike "Merge Intervals" (where you sort the whole array in O(N log N)), this array is already sorted. A highly optimized O(N) solution parses the array in three phases: strict left side, overlapping middle, strict right side. It tests your ability to break array logic into distinct boundaries.`,
                                                        approach: `Create a result array. Iterate through the intervals. Phase 1: If current interval ends BEFORE the new interval starts, append current to result. Phase 2: If current interval overlaps with new interval, merge them by updating the start and end of the new interval (min of starts, max of ends). Phase 3: Once we pass the new interval, append the merged new interval, then append all remaining intervals.`,
                                                            solution: 'Three-phase linear scan. 1) Add all intervals before new_interval. 2) Merge overlapping intervals into new_interval. 3) Add the merged new_interval, then add all remaining intervals.',
                                                                walkthrough: [
                                                                    "intervals=[[1,2],[3,5],[6,7],[8,10],[12,16]], new_interval=[4,8]",
                                                                    "i=0: [1,2] ends before [4,8] starts. Add [1,2].",
                                                                    "i=1:[3,5] overlaps. new_interval = [min(4,3), max(8,5)] =[3,8].",
                                                                    "i=2: [6,7] overlaps. new_interval =[min(3,6), max(8,7)] = [3,8].",
                                                                    "i=3: [8,10] overlaps. new_interval = [min(3,8), max(8,10)] =[3,10].",
                                                                    "i=4: [12,16] starts AFTER [3,10]. Break phase 2.",
                                                                    "Add [3,10]. Phase 3: Add remaining [[12,16]].",
                                                                    "Result: [[1,2],[3,10],[12,16]] ✓"
                                                                ],
                                                                    hints: [
                                                                        'Break the problem into three loops (or one loop with three conditions).',
                                                                        'Intervals strictly BEFORE the new interval: `interval.end < new_interval.start`.',
                                                                        'Intervals strictly AFTER the new interval: `interval.start > new_interval.end`.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `def insert_event(intervals: list[list[int]], new_event: list[int]) -> list[list[int]]:
    """
    Inserts and merges new_event into the sorted intervals list.
    """
    result =[]
    i = 0
    n = len(intervals)
    
    # Phase 1: Add all intervals ending before new_event starts
    while i < n and intervals[i][1] < new_event[0]:
        result.append(intervals[i])
        i += 1
        
    # Phase 2: Merge overlapping intervals
    while i < n and intervals[i][0] <= new_event[1]:
        new_event[0] = min(new_event[0], intervals[i][0])
        new_event[1] = max(new_event[1], intervals[i][1])
        i += 1
    result.append(new_event)
    
    # Phase 3: Add all remaining intervals
    while i < n:
        result.append(intervals[i])
        i += 1
        
    return result
`,
        testCases: [
            { id: 'tc1', description: 'Merge multiple', input: 'intervals=[[1,2],[3,5],[6,7],[8,10],[12,16]], new=[4,8]', expected: '[[1,2],[3,10],[12,16]]' },
            { id: 'tc2', description: 'Merge one', input: 'intervals=[[1,3],[6,9]], new=[2,5]', expected: '[[1,5],[6,9]]' },
            { id: 'tc3', description: 'Insert at beginning', input: 'intervals=[[3,5],[6,9]], new=[1,2]', expected: '[[1,2],[3,5],[6,9]]' },
            { id: 'tc4', description: 'Insert at end', input: 'intervals=[[1,2],[3,5]], new=[6,8]', expected: '[[1,2],[3,5],[6,8]]' },
            { id: 'tc5', description: 'Merge everything', input: 'intervals=[[1,2],[3,4],[5,6]], new=[1,6]', expected: '[[1,6]]' },
        ],
    },
{
    id: 'ENG-DSA-070',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Server Cluster Maintenance (1D DP)',
                    companies: ['Oracle', 'MongoDB'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Dynamic Programming', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-071',
                                            realWorldContext: `A database cluster distributes shards sequentially across nodes. Taking a node down for maintenance removes its capacity. To avoid a catastrophic loss of quorum, you cannot take down two directly adjacent nodes simultaneously. You want to maximize the total RAM capacity taken down for maintenance during the window.`,
                                                desc: 'Given an integer array `capacity` representing the RAM of sequential servers, determine the maximum capacity you can take offline tonight without taking down two adjacent servers.',
                                                    whyItMatters: `This is the classic "House Robber" problem. It is the perfect introduction to 1D Dynamic Programming. It forces the shift from greedy thinking (which fails here) to state-based thinking: "At node i, what is the optimal choice based on my decisions at i-1 and i-2?".`,
                                                        approach: `Let dp[i] be the maximum capacity we can take down using the first i servers. For server i, we have a choice: 1) Skip it. Our total remains dp[i-1]. 2) Take it down. We can't use server i-1, so our total is capacity[i] + dp[i-2]. The recurrence relation is: dp[i] = max(dp[i-1], capacity[i] + dp[i-2]). Since we only look back 2 steps, we can optimize space to O(1) by keeping just two variables.`,
                                                            solution: 'Iterate through the array keeping track of `rob1` (max up to i-2) and `rob2` (max up to i-1). Current max is `max(rob1 + current, rob2)`. Shift variables forward.',
                                                                walkthrough: [
                                                                    "capacity = [2, 7, 9, 3, 1]",
                                                                    "prev2=0, prev1=0",
                                                                    "i=0 (2): curr = max(0+2, 0) = 2. prev2=0, prev1=2.",
                                                                    "i=1 (7): curr = max(0+7, 2) = 7. prev2=2, prev1=7.",
                                                                    "i=2 (9): curr = max(2+9, 7) = 11. prev2=7, prev1=11.",
                                                                    "i=3 (3): curr = max(7+3, 11) = 11. prev2=11, prev1=11.",
                                                                    "i=4 (1): curr = max(11+1, 11) = 12. prev2=11, prev1=12.",
                                                                    "Result: 12 ✓ (Take 7 and 1? Wait, 2 + 9 + 1 = 12. Nodes 0, 2, 4)"
                                                                ],
                                                                    hints: [
                                                                        'A Greedy approach (picking evens vs odds) fails for arrays like[2, 1, 1, 2].',
                                                                        'At every server, you have a choice: include it (and add max from 2 steps back), or exclude it (keep max from 1 step back).',
                                                                        'You only need two variables to keep track of the history, reducing O(N) space to O(1).'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(1)' },
    starterCode: `def max_maintenance_capacity(capacity: list[int]) -> int:
    """
    Returns the max capacity that can be safely taken offline.
    Adjacent servers cannot be taken down.
    """
    if not capacity:
        return 0
        
    prev2 = 0  # Max capacity up to i-2
    prev1 = 0  # Max capacity up to i-1
    
    for cap in capacity:
        # Take current node + max from i-2, OR skip current node and keep max from i-1
        current_max = max(prev2 + cap, prev1)
        
        # Shift window forward
        prev2 = prev1
        prev1 = current_max
        
    return prev1
`,
        testCases: [
            { id: 'tc1', description: 'Standard alternating', input: 'capacity=[1,2,3,1]', expected: '4 (1 + 3)' },
            { id: 'tc2', description: 'Greedy fails here', input: 'capacity=[2,7,9,3,1]', expected: '12 (2 + 9 + 1)' },
            { id: 'tc3', description: 'Evens vs Odds trap', input: 'capacity=[2,1,1,2]', expected: '4 (2 + 2)' },
            { id: 'tc4', description: 'Single server', input: 'capacity=[5]', expected: '5' },
            { id: 'tc5', description: 'All zeros', input: 'capacity=[0,0,0]', expected: '0' },
        ],
    },
{
    id: 'ENG-DSA-071',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Promotion Bundling (Combination Sum)',
                    companies: ['Amazon', 'Walmart'],
                        timeEst: '~45 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Backtracking', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-072',
                                            realWorldContext: `E-commerce checkout systems generate targeted "bundle" discounts. To trigger a "$50 off your cart" coupon, the system must calculate if combinations of items from a promotional catalog sum exactly to the target threshold. Customers can buy the same promotional item multiple times.`,
                                                desc: 'Given an array of distinct integers `prices` and a target integer `target`, return a list of all unique combinations of prices where the chosen numbers sum to `target`. You may choose the same price an unlimited number of times.',
                                                    whyItMatters: `Combination Sum introduces generating combinations via Backtracking. It differs from permutations because order doesn't matter (e.g., [2,3] is the same as [3,2]). To prevent duplicate sets, the recursion must only pick from the *current* index onwards.`,
                                                        approach: `Use a recursive backtracking function: \`backtrack(start_index, current_combo, current_sum)\`. If \`current_sum == target\`, copy the combo to results. If \`current_sum > target\`, terminate that branch (pruning). Otherwise, loop from \`start_index\` to the end of the array. Push the number, recurse (passing the SAME index since we can reuse numbers), and then pop (backtrack).`,
                                                            solution: 'Backtracking. Maintain a running sum. When branching, loop from `current_index` to `N` to allow reuse of elements while avoiding backward permutations. Append valid branches to results.',
                                                                walkthrough: [
                                                                    "prices=[2,3,6,7], target=7",
                                                                    "backtrack(0, [], 0) -> try 2",
                                                                    "  backtrack(0, [2], 2) -> try 2",
                                                                    "    backtrack(0, [2,2], 4) -> try 2",
                                                                    "      backtrack(0, [2,2,2], 6) -> try 2 -> sum=8 > 7. Backtrack.",
                                                                    "      backtrack(0, [2,2,2], 6) -> try 3 -> sum=9 > 7. Backtrack.",
                                                                    "    backtrack(1,[2,2], 4) -> try 3 -> sum=7 == 7! Add [2,2,3] to results.",
                                                                    "Eventually branches find [7]. Result: [[2,2,3], [7]]"
                                                                ],
                                                                    hints: [
                                                                        'Use recursion to explore the decision tree: at each step, you can pick a price or move on to the next price.',
                                                                        'To avoid duplicate combinations like [2,3] and [3,2], always start your inner loop at the `current_index` passed into the recursive function.',
                                                                        'Remember to append a COPY of your path array `list(path)` to the results, otherwise Python will mutate it later.'
                                                                    ],
                                                                        complexity: { time: 'O(N^(T/M)) (T=target, M=min_val)', space: 'O(T/M) stack space' },
    starterCode: `def find_bundles(prices: list[int], target: int) -> list[list[int]]:
    """
    Returns all unique combinations of prices that sum up exactly to target.
    Prices can be used multiple times.
    """
    results =[]
    
    def backtrack(start_index: int, current_combo: list[int], current_sum: int):
        # Base case: Found a valid combination
        if current_sum == target:
            results.append(list(current_combo))
            return
            
        # Base case: Exceeded target, stop exploring this branch
        if current_sum > target:
            return
            
        # Explore choices starting from 'start_index' to avoid permutations
        for i in range(start_index, len(prices)):
            price = prices[i]
            
            # Choose
            current_combo.append(price)
            
            # Explore (pass 'i' not 'i+1' because we can reuse the same price)
            backtrack(i, current_combo, current_sum + price)
            
            # Un-choose (backtrack)
            current_combo.pop()
            
    backtrack(0, [], 0)
    return results
`,
        testCases: [
            { id: 'tc1', description: 'Standard case', input: 'prices=[2,3,6,7], target=7', expected: '[[2,2,3], [7]]' },
            { id: 'tc2', description: 'Multiple uses', input: 'prices=[2,3,5], target=8', expected: '[[2,2,2,2], [2,3,3], [3,5]]' },
            { id: 'tc3', description: 'No valid combo', input: 'prices=[2], target=1', expected: '[]' },
            { id: 'tc4', description: 'Target equals element', input: 'prices=[1], target=1', expected: '[[1]]' },
            { id: 'tc5', description: 'Target equals two elements', input: 'prices=[1], target=2', expected: '[[1,1]]' },
        ],
    },
{
    id: 'ENG-DSA-072',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Feature Toggle Scenarios (Subsets)',
                    companies: ['LaunchDarkly', 'GitLab'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Backtracking', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-073',
                                            realWorldContext: `Quality Assurance (QA) teams run integration tests across matrices of feature flags. If an application has 3 beta features (A, B, C), the test suite must generate all 2^3 = 8 possible environments (subsets) to verify that features don't crash when interacting with each other.`,
                                                desc: 'Given an integer array of unique elements representing feature flags, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return them in any order.',
                                                    whyItMatters: `Subsets is the purest, most stripped-down Backtracking problem. It teaches the binary decision tree model: for every element, you make a choice to either INCLUDE it in your subset or EXCLUDE it. This 2^N logic is the foundation for combinations, permutations, and DP knapsack optimization.`,
                                                        approach: `Start a recursive function \`dfs(i, subset)\`. At index \`i\`, we have two choices. Choice 1: Include \`nums[i]\` in the subset and recurse to \`i + 1\`. Choice 2: Exclude \`nums[i]\` (pop it from the subset) and recurse to \`i + 1\`. When \`i == len(nums)\`, we've made a decision for every element; append a copy of the subset to the results.`,
                                                            solution: 'DFS Backtracking. For each element, branch twice: once adding the element to the current path, once omitting it. Record the path when the index reaches the array length.',
                                                                walkthrough: [
                                                                    "nums = [1, 2, 3]",
                                                                    "dfs(0,[]) -> Branch 1 (Include 1): dfs(1, [1]) -> Branch 1 (Include 2): dfs(2, [1,2])",
                                                                    "-> Branch 1 (Include 3): dfs(3,[1,2,3]) -> Add to results.",
                                                                    "-> Branch 2 (Exclude 3): dfs(3, [1,2]) -> Add to results.",
                                                                    "Backtrack to dfs(1, [1]) -> Branch 2 (Exclude 2): dfs(2, [1])",
                                                                    "-> Branch 1 (Include 3): dfs(3, [1,3]) -> Add to results.",
                                                                    "-> Branch 2 (Exclude 3): dfs(3, [1]) -> Add to results...",
                                                                    "Outputs 8 subsets: [], [1],[2], [1,2], [3], [1,3], [2,3], [1,2,3]"
                                                                ],
                                                                    hints: [
                                                                        'At every element, you make a binary decision: Is it in the subset, or is it out?',
                                                                        'When the index reaches the end of the array, add a COPY of your subset array to the results list.',
                                                                        'Backtracking means pushing to the array, recursing, then popping from the array before making the next recursive call.'
                                                                    ],
                                                                        complexity: { time: 'O(N * 2^N)', space: 'O(N) stack space' },
    starterCode: `def generate_feature_scenarios(features: list[int]) -> list[list[int]]:
    """
    Returns all possible combinations of feature flags (the power set).
    """
    results =[]
    
    def dfs(i: int, current_subset: list[int]):
        # Base case: We've made a decision for every feature
        if i == len(features):
            results.append(list(current_subset))
            return
            
        # Decision 1: INCLUDE the current feature
        current_subset.append(features[i])
        dfs(i + 1, current_subset)
        
        # Decision 2: EXCLUDE the current feature
        current_subset.pop()
        dfs(i + 1, current_subset)
        
    dfs(0, [])
    return results
`,
        testCases: [
            { id: 'tc1', description: 'Standard 3 elements', input: 'features=[1,2,3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
            { id: 'tc2', description: 'Single element', input: 'features=[0]', expected: '[[], [0]]' },
            { id: 'tc3', description: 'Empty features', input: 'features=[]', expected: '[[]]' },
            { id: 'tc4', description: 'Two elements', input: 'features=[1,2]', expected: '[[], [1], [2],[1,2]]' },
            { id: 'tc5', description: 'Four elements', input: 'features=[1,2,3,4]', expected: '16 unique subsets' },
        ],
    },
{
    id: 'ENG-DSA-073',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'UI Component Tree Reconstruction',
                    companies: ['Meta', 'Vercel'],
                        timeEst: '~50 min',
                            level: 'Senior',
                                status: 'Not Started',
                                    topics: ['Trees', 'Recursion', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-074',
                                            realWorldContext: `React's Virtual DOM represents the UI as a tree. During server-side rendering (SSR) hydration, the client receives serialized flat arrays of components. To rebuild the exact component hierarchy in memory, the hydration engine processes preorder (root first) and inorder (left, root, right) traversal logs.`,
                                                desc: 'Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return the binary tree.',
                                                    whyItMatters: `Construct Binary Tree from Preorder and Inorder Traversal is a true test of understanding tree traversal mechanics. Preorder tells you exactly *what* the root is. Inorder tells you *how many* nodes are in the left vs right subtrees. Combining these two properties via recursion reconstructs the entire structure.`,
                                                        approach: `The first element in \`preorder\` is ALWAYS the root. Find that root's value in the \`inorder\` array. Everything to the left of it in \`inorder\` belongs to the left subtree; everything to the right belongs to the right subtree. The number of elements in the left subtree tells you exactly how many elements in \`preorder\` belong to the left branch. Recursively build \`root.left\` and \`root.right\` using array slices.`,
                                                            solution: 'First element of preorder is root. Locate root in inorder to partition left/right subtrees. Recursively pass sliced preorder and inorder arrays to build left and right children.',
                                                                walkthrough: [
                                                                    "pre=[3,9,20,15,7], in=[9,3,15,20,7]",
                                                                    "Root is pre[0] = 3. Find 3 in inorder -> index 1.",
                                                                    "Left subtree inorder: in[0:1] = [9]. Right subtree inorder: in[2:] =[15,20,7]",
                                                                    "Left subtree size = 1. So left preorder is pre[1:2] = [9]. Right preorder is pre[2:] = [20,15,7]",
                                                                    "Recurse left(pre=[9], in=[9]): root=9. Done.",
                                                                    "Recurse right(pre=[20,15,7], in=[15,20,7]): root=20. Left=15, Right=7. Done.",
                                                                    "Tree restored! ✓"
                                                                ],
                                                                    hints: [
                                                                        'Preorder traversal is `[Root, Left Subtree, Right Subtree]`.',
                                                                        'Inorder traversal is `[Left Subtree, Root, Right Subtree]`.',
                                                                        'Use a Hash Map to store `value -> index` for the inorder array so you don\'t have to use `.index()` in O(N) time during every recursive step.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(preorder: list[int], inorder: list[int]) -> TreeNode:
    """
    Reconstructs the binary tree from preorder and inorder traversals.
    """
    # Map value to its index in inorder array for O(1) lookups
    inorder_idx_map = {val: idx for idx, val in enumerate(inorder)}
    
    def array_to_tree(pre_left: int, pre_right: int, in_left: int, in_right: int) -> TreeNode:
        if pre_left > pre_right or in_left > in_right:
            return None
            
        # The first element in preorder window is the root
        root_val = preorder[pre_left]
        root = TreeNode(root_val)
        
        # Find root index in inorder window
        mid_idx = inorder_idx_map[root_val]
        
        # Calculate size of left subtree
        left_subtree_size = mid_idx - in_left
        
        # Recursively build left and right subtrees
        root.left = array_to_tree(pre_left + 1, pre_left + left_subtree_size, in_left, mid_idx - 1)
        root.right = array_to_tree(pre_left + left_subtree_size + 1, pre_right, mid_idx + 1, in_right)
        
        return root
        
    return array_to_tree(0, len(preorder) - 1, 0, len(inorder) - 1)
`,
        testCases: [
            { id: 'tc1', description: 'Standard Tree', input: 'pre=[3,9,20,15,7], in=[9,3,15,20,7]', expected: 'Root=3, L=9, R=20(L15, R7)' },
            { id: 'tc2', description: 'Single node', input: 'pre=[-1], in=[-1]', expected: 'Root=-1' },
            { id: 'tc3', description: 'Left heavy', input: 'pre=[1,2,3], in=[3,2,1]', expected: '1 -> L:2 -> L:3' },
            { id: 'tc4', description: 'Right heavy', input: 'pre=[1,2,3], in=[1,2,3]', expected: '1 -> R:2 -> R:3' },
            { id: 'tc5', description: 'Empty', input: 'pre=[], in=[]', expected: 'None' },
        ],
    },
{
    id: 'ENG-DSA-074',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Visible Security Cameras (Binary Tree Right Side View)',
                    companies: ['Verkada', 'Google'],
                        timeEst: '~30 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Trees', 'BFS', 'DFS'],
                                        nextChallengeId: 'ENG-DSA-075',
                                            realWorldContext: `Verkada's physical security planning software renders a 2D side-profile of buildings to show camera placement. Given a binary tree representing a building's network topology, the engine must return a list of nodes that are directly visible when the tree is viewed perfectly from the right side.`,
                                                desc: 'Given the `root` of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.',
                                                    whyItMatters: `Right Side View introduces a specific twist on standard Level-Order Traversal (BFS). Instead of collecting all nodes on a level, you only want the LAST node processed on each level. It demonstrates mastery of queue manipulation for tree depth processing.`,
                                                        approach: `Use a BFS Queue. To process level by level, take the \`length\` of the queue at the start of the loop. Loop exactly \`length\` times, popping nodes. The *last* node popped in this inner loop is the right-most node for that level—add its value to the results. Push left and right children to the queue for the next level.`,
                                                            solution: 'Level-order traversal (BFS). Record the value of the final node processed at each depth level.',
                                                                walkthrough: [
                                                                    "Tree:   1\n       / \\\n      2   3\n       \\\n        5",
                                                                    "Level 0: Queue=[1]. Len=1. Pop 1. End of level -> add 1 to result. Q=[2,3]",
                                                                    "Level 1: Queue=[2,3]. Len=2. Pop 2 (add 5). Pop 3. End of level -> add 3. Q=[5]",
                                                                    "Level 2: Queue=[5]. Len=1. Pop 5. End of level -> add 5. Q=[]",
                                                                    "Result: [1, 3, 5] ✓"
                                                                ],
                                                                    hints: [
                                                                        'Perform a standard Breadth-First Search (BFS) using a Queue.',
                                                                        'Instead of popping one node at a time blindly, determine the `size` of the queue, then loop `size` times. This isolates each depth level.',
                                                                        'Append the value of the very last node in the inner loop to your results array.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def right_side_view(root: TreeNode) -> list[int]:
    """
    Returns the values of nodes visible from the right side.
    """
    if not root:
        return []
        
    result = []
    queue = deque([root])
    
    while queue:
        level_length = len(queue)
        
        # Process all nodes at the current level
        for i in range(level_length):
            node = queue.popleft()
            
            # If it's the last node in this level, it's visible from the right
            if i == level_length - 1:
                result.append(node.val)
                
            # Add children for the next level
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
                
    return result
`,
        testCases: [
            { id: 'tc1', description: 'Standard tree', input: 'Tree:[1,2,3,null,5,null,4]', expected: '[1, 3, 4]' },
            { id: 'tc2', description: 'Left skewed (left visible)', input: 'Tree: [1,2,3,4]', expected: '[1, 3, 4] (4 is visible because right has no nodes at depth 2)' },
            { id: 'tc3', description: 'Empty tree', input: 'Tree: []', expected: '[]' },
            { id: 'tc4', description: 'Single node', input: 'Tree: [1]', expected: '[1]' },
            { id: 'tc5', description: 'Deep left branch', input: 'Tree:[1,2,3,4,null,null,null,5]', expected: '[1, 3, 4, 5]' },
        ],
    },
{
    id: 'ENG-DSA-075',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Nested Payload Decoder (Stack)',
                    companies: ['Stripe', 'Twilio'],
                        timeEst: '~35 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Stack', 'Strings'],
                                        nextChallengeId: 'ENG-DSA-076',
                                            realWorldContext: `To minimize payload sizes over constrained networks, mobile APIs sometimes compress redundant JSON data structures. A payload encoded as "3[msg]" needs to be expanded into "msgmsgmsg". Nested compression like "2[b3[a]]" requires evaluating structures from the inside out.`,
                                                desc: 'Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the encoded_string inside the square brackets is being repeated exactly `k` times. Note that `k` is guaranteed to be a positive integer.',
                                                    whyItMatters: `Decode String requires processing operations in a Last-In-First-Out sequence (inner brackets must be resolved before outer brackets). Using a Stack gracefully holds the "context" of outer operations while inner operations finish processing.`,
                                                        approach: `Traverse the string. Maintain a \`current_string\` and a \`current_num\`. When encountering a digit, update \`current_num\` (handles multi-digit like "12["). When \`[\`, push \`current_string\` and \`current_num\` to the stack, then reset both. When \`]\`, pop \`prev_num\` and \`prev_str\` from the stack. Update \`current_string = prev_str + (current_string * prev_num)\`. Regular letters simply append to \`current_string\`.`,
                                                            solution: 'Use a stack. Build strings and numbers. On `[`, push current state and reset. On `]`, pop state, multiply current string, and append to popped string.',
                                                                walkthrough: [
                                                                    "s = '3[a2[c]]'",
                                                                    "Read '3'. curr_num=3.",
                                                                    "Read '['. Push (3, ''). curr_num=0, curr_str=''. Stack=[(3, '')]",
                                                                    "Read 'a'. curr_str='a'.",
                                                                    "Read '2'. curr_num=2.",
                                                                    "Read '['. Push (2, 'a'). curr_num=0, curr_str=''. Stack=[(3, ''), (2, 'a')]",
                                                                    "Read 'c'. curr_str='c'.",
                                                                    "Read ']'. Pop (2, 'a'). curr_str = 'a' + ('c'*2) = 'acc'.",
                                                                    "Read ']'. Pop (3, ''). curr_str = '' + ('acc'*3) = 'accaccacc'.",
                                                                    "Return 'accaccacc' ✓"
                                                                ],
                                                                    hints: [
                                                                        'When you see a `[`, you need to pause building the current string, save it (and the multiplier) to the stack, and start building the inner string.',
                                                                        'When you see a `]`, you have finished the inner string. Pop the previous string and multiplier from the stack, and combine them.',
                                                                        'Numbers can be multiple digits! Build the number by multiplying by 10 (e.g., `num = num * 10 + int(char)`).'
                                                                    ],
                                                                        complexity: { time: 'O(Max Output Length)', space: 'O(Max Output Length)' },
    starterCode: `def decode_string(s: str) -> str:
    """
    Decodes strings like "3[a]2[bc]" into "aaabcbc".
    Supports nested decoding like "3[a2[c]]".
    """
    stack =[]
    current_num = 0
    current_string = ""
    
    for char in s:
        if char.isdigit():
            current_num = current_num * 10 + int(char)
        elif char == '[':
            # Save the current state before descending into nested brackets
            stack.append((current_string, current_num))
            current_string = ""
            current_num = 0
        elif char == ']':
            # Complete the inner bracket and merge with the outer state
            prev_string, num = stack.pop()
            current_string = prev_string + (current_string * num)
        else:
            # Just a regular character
            current_string += char
            
    return current_string
`,
        testCases: [
            { id: 'tc1', description: 'Simple', input: 's="3[a]2[bc]"', expected: '"aaabcbc"' },
            { id: 'tc2', description: 'Nested', input: 's="3[a2[c]]"', expected: '"accaccacc"' },
            { id: 'tc3', description: 'Double nested', input: 's="2[abc]3[cd]ef"', expected: '"abcabccdcdcdef"' },
            { id: 'tc4', description: 'No numbers', input: 's="hello"', expected: '"hello"' },
            { id: 'tc5', description: 'Multi-digit number', input: 's="10[a]"', expected: '"aaaaaaaaaa"' },
        ],
    },
{
    id: 'ENG-DSA-076',
        type: 'DSA',
            badgeClass: 'badge-dsa',
                title: 'Market Trend Analysis (Monotonic Stack)',
                    companies: ['Bloomberg', 'Coinbase'],
                        timeEst: '~35 min',
                            level: 'Mid',
                                status: 'Not Started',
                                    topics: ['Stack', 'Monotonic Stack', 'Arrays'],
                                        nextChallengeId: 'ENG-DSA-077',
                                            realWorldContext: `In quantitative trading platforms, analysts visualize historical stock data to see "how long would I have had to hold this asset before I made a profit?" Calculating the exact distance to the next greater price for millions of data points must happen in O(N) time.`,
                                                desc: 'Given an array of integers `temperatures` (or asset prices), return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0`.',
                                                    whyItMatters: `This introduces the "Monotonic Stack" (a stack that maintains a strictly increasing or decreasing order). It is specifically used for "Next Greater Element" problems. Instead of an O(N^2) double-loop, elements wait inside the stack until their "next greater element" arrives to pop them out.`,
                                                        approach: `Iterate through the array. Keep a stack of indices. While the stack is not empty and the current temperature is GREATER than the temperature at the index on the top of the stack: we have found the "next warmer day" for that top index! Pop the index, calculate the distance (\`current_index - popped_index\`), and store it in the output. Push the current index to the stack.`,
                                                            solution: 'Use a decreasing Monotonic Stack storing indices. Iterate elements: while current > element at stack.top, pop stack and update output array. Push current index.',
                                                                walkthrough: [
                                                                    "temps =[73, 74, 75, 71, 69, 72, 76]",
                                                                    "i=0 (73): Stack=[0]",
                                                                    "i=1 (74): 74 > temps[stack.top(0)]. Pop 0. out[0] = 1-0 = 1. Stack=[1]",
                                                                    "i=2 (75): 75 > temps[1]=74. Pop 1. out[1] = 2-1 = 1. Stack=[2]",
                                                                    "i=3 (71): 71 < 75. Stack=[2, 3]",
                                                                    "i=4 (69): 69 < 71. Stack=[2, 3, 4]",
                                                                    "i=5 (72): 72 > temps[4]=69. Pop 4. out[4] = 5-4 = 1. 72 > temps[3]=71. Pop 3. out[3] = 5-3 = 2. Stack=[2, 5]",
                                                                    "i=6 (76): 76 pops 5 (out[5]=1) and pops 2 (out[2]=4). Stack=[6]"
                                                                ],
                                                                    hints: [
                                                                        'Brute force checking every future day takes O(N^2).',
                                                                        'Use a stack to keep track of the *indices* of days that haven\'t found a warmer day yet.',
                                                                        'If the current day is warmer than the day at the top of the stack, you resolve the top of the stack. Keep popping until the current day is no longer warmer.'
                                                                    ],
                                                                        complexity: { time: 'O(N)', space: 'O(N)' },
    starterCode: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    """
    Returns an array showing how many days to wait until a warmer temperature.
    """
    n = len(temperatures)
    answer = [0] * n
    stack =[]  # Stores indices
    
    for i, t in enumerate(temperatures):
        # Resolve all previous days that are colder than today
        while stack and temperatures[stack[-1]] < t:
            prev_index = stack.pop()
            answer[prev_index] = i - prev_index
            
        # Add today to the stack, waiting for a future warmer day
        stack.append(i)
        
    return answer
`,
        testCases: [
            { id: 'tc1', description: 'Warming up and cooling down', input: 'temps=[73,74,75,71,69,72,76,73]', expected: '[1,1,4,2,1,1,0,0]' },
            { id: 'tc2', description: 'Monotonically decreasing', input: 'temps=[30,29,28]', expected: '[0,0,0]' },
            { id: 'tc3', description: 'Monotonically increasing', input: 'temps=[10,20,30]', expected: '[1,1,0]' },
            { id: 'tc4', description: 'Single peak', input: 'temps=[30,30,40,30]', expected: '[2,1,0,0]' },
            { id: 'tc5', description: 'All equal', input: 'temps=[25,25,25]', expected: '[0,0,0]' },
        ],
    }
];
