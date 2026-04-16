import type { Challenge } from '../types';

// ─── ENG-DSA-008 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
