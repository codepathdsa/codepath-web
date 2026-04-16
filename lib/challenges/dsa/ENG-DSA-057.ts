import type { Challenge } from '../types';

// ─── ENG-DSA-057 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
