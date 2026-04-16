import type { Challenge } from '../types';

// ─── ENG-DSA-020 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
