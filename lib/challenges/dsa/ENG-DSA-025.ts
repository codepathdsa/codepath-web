import type { Challenge } from '../types';

// ─── ENG-DSA-025 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
