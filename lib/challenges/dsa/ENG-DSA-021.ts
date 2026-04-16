import type { Challenge } from '../types';

// ─── ENG-DSA-021 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
