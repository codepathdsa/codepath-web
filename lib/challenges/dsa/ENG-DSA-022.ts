import type { Challenge } from '../types';

// ─── ENG-DSA-022 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-022',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Auto-scaling Threshold Spike (Peak Element)',
        companies: ['AWS', 'Netflix'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays'],
        nextChallengeId: 'ENG-DSA-023',
        realWorldContext: `AWS CloudWatch monitors EC2 CPU telemetry that follows a unimodal pattern: load increases until the auto-scaler triggers, then decreases. The alerting system needs to find the peak CPU index to determine when to fire the scaling event. Linear scan O(n) is too slow for petabyte-scale telemetry — binary search finds the peak in O(log n).`,
        desc: 'You have a telemetry array representing CPU load over time. The load increases to a peak, then decreases as auto-scaling kicks in. Find the index of the peak CPU load in O(log n) time.',
        whyItMatters: `Binary search is applicable beyond just sorted arrays — any monotonic or unimodal property enables binary search. Peak element finding teaches this generalization. The same "compare to neighbor" technique applies to: mountain array problems, rotated sorted array searches, and finding the inflection point in optimization functions.`,
        approach: `Look at the middle element. Compare it to its right neighbor. If mid > mid+1, we're on a DOWNWARD slope — the peak is to the LEFT (including mid, since mid could be the peak). If mid < mid+1, we're on an UPWARD slope — the peak is to the RIGHT. This binary decision halves the search space each step, achieving O(log n).`,
        solution: 'Use Binary Search. Look at the middle element. If it is strictly greater than its right neighbor, the peak is to the left (including mid). If it is less than its right neighbor, the peak is to the right. Adjust pointers until left == right.',
        walkthrough: [
            "loads=[1,2,3,4,3,2,1]. left=0, right=6",
            "mid=3: loads[3]=4 > loads[4]=3? YES (downward slope). right=3",
            "mid=1: loads[1]=2 > loads[2]=3? NO (upward slope). left=2",
            "mid=2: loads[2]=3 > loads[3]=4? NO. left=3. left==right==3. Peak at index 3 ✓"
        ],
        hints: [
            'Linear scan O(n) is too slow for massive telemetry arrays. Since there is a definitive peak, we can use Binary Search.',
            'Compare `arr[mid]` to `arr[mid + 1]`.',
            'If `arr[mid] > arr[mid + 1]`, you are on the descending slope. The peak is to your left (or is `mid`).'
        ],
        complexity: { time: 'O(log n)', space: 'O(1)' },
        starterCode: `def find_peak_cpu(loads: list[int]) -> int:
    """
    loads: array of CPU loads (unimodal — goes up then down)
    Returns the index of the peak element (strictly > both neighbors).
    O(log n) time complexity required.
    
    Example: [1, 2, 3, 1] → 2 (value 3 is peak)
    Example: [5, 4, 3, 2] → 0 (first element is peak)
    """
    left = 0
    right = len(loads) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        # On downward slope: peak is at mid or to its left
        if loads[mid] > loads[mid + 1]:
            right = mid
        # On upward slope: peak is strictly to the right of mid
        else:
            left = mid + 1
            
    return left  # left == right == peak index
`,
        testCases: [
            { id: 'tc1', description: 'Clear peak', input: 'loads=[1, 2, 3, 1]', expected: '2 (value 3)' },
            { id: 'tc2', description: 'Peak at the very end', input: 'loads=[1, 2, 3, 4, 5]', expected: '4 (value 5)' },
            { id: 'tc3', description: 'Peak at the beginning', input: 'loads=[5, 4, 3, 2, 1]', expected: '0 (value 5)' },
            { id: 'tc4', description: 'Multiple peaks (returns any)', input: 'loads=[1, 2, 1, 3, 5, 6, 4]', expected: '1 or 5' },
            { id: 'tc5', description: 'Array of size 2', input: 'loads=[1, 2]', expected: '1 (value 2)' },
        ],
    };

export default challenge;
