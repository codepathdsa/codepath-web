import type { Challenge } from '../types';

// ─── ENG-DSA-017 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
