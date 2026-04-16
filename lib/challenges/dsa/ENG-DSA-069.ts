import type { Challenge } from '../types';

// ─── ENG-DSA-069 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
    };

export default challenge;
