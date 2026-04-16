import type { Challenge } from '../types';

// ─── ENG-DSA-007 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
