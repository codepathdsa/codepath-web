import type { Challenge } from '../types';

// ─── ENG-DSA-002 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
