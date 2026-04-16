import type { Challenge } from '../types';

// ─── ENG-DSA-004 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
