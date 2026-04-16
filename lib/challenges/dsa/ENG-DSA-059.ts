import type { Challenge } from '../types';

// ─── ENG-DSA-059 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-059',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'P99 Latency Calculation (Quickselect)',
        companies: ['Datadog', 'AWS'],
        timeEst: '~45 min',
        level: 'Senior',
        status: 'Not Started',
        topics: ['Divide and Conquer', 'Sorting', 'Arrays'],
        nextChallengeId: 'ENG-DSA-060',
        realWorldContext: `Monitoring platforms like Datadog aggregate millions of latency metrics per minute. Calculating the P99 (99th percentile, or Kth largest element) requires sorting the entire array, which is O(N log N). However, if we only need the Kth element, Quickselect achieves this in O(N) average time, saving massive CPU cycles on ingestion pipelines.`,
        desc: 'Given an unsorted array of latency logs, return the Kth largest element in the array. You must solve it in O(N) average time complexity without fully sorting the array.',
        whyItMatters: `Kth Largest Element is a classic test of algorithmic fundamentals. While a Min-Heap solves it in O(N log K), Quickselect (based on Quicksort's partitioning) solves it in O(N) average time. It proves you understand pivot partitioning and divide-and-conquer mechanics.`,
        approach: `Pick a random pivot. Partition the array into three parts: elements > pivot, elements == pivot, and elements < pivot. Since we want the Kth largest, we look at the sizes of these partitions. If K <= len(greater), the answer is in the 'greater' array. If K > len(greater) + len(equal), it's in the 'smaller' array. Otherwise, the pivot IS the answer.`,
        solution: 'Use Quickselect with 3-way partitioning. Recursively narrow down the search space to just the partition that contains the Kth largest index.',
        walkthrough: [
            "nums=[3,2,1,5,6,4], k=2 (Find 2nd largest)",
            "Pivot = 4. Greater=[5,6], Equal=[4], Smaller=[3,2,1]",
            "We want 2nd largest. len(Greater) = 2. K <= 2? Yes! The answer is in Greater.",
            "Recurse Quickselect on Greater=[5,6], k=2.",
            "Pivot = 6. Greater=[], Equal=[6], Smaller=[5].",
            "len(Greater)=0. K=2. Is K <= 0? No. Is K <= 0 + 1 (Equal)? No. K > 1.",
            "So answer is in Smaller=[5]. New k = 2 - 1 = 1. Recurse...",
            "Pivot=5. Equal=[5]. Returns 5. ✓"
        ],
        hints: [
            'A full sort is O(N log N). A heap is O(N log K). Quickselect is O(N) average.',
            'Pick a pivot. Separate numbers into three lists: > pivot, == pivot, < pivot.',
            'Compare K against the lengths of these lists to decide which single list to recursively search.'
        ],
        complexity: { time: 'O(N) average, O(N^2) worst', space: 'O(N) for array slices' },
        starterCode: `import random

def find_kth_largest(nums: list[int], k: int) -> int:
    """
    Finds the kth largest element in O(N) average time using Quickselect.
    """
    if not nums:
        return -1
        
    pivot = random.choice(nums)
    
    # 3-way partitioning
    greater = [x for x in nums if x > pivot]
    equal =[x for x in nums if x == pivot]
    smaller = [x for x in nums if x < pivot]
    
    # Kth largest must be in the 'greater' list
    if k <= len(greater):
        return find_kth_largest(greater, k)
        
    # Kth largest is exactly the pivot
    elif k <= len(greater) + len(equal):
        return pivot
        
    # Kth largest is in the 'smaller' list
    # Adjust K because we are discarding 'greater' and 'equal'
    else:
        return find_kth_largest(smaller, k - len(greater) - len(equal))
`,
        testCases: [
            { id: 'tc1', description: 'Standard case', input: 'nums=[3,2,1,5,6,4], k=2', expected: '5' },
            { id: 'tc2', description: 'Duplicates present', input: 'nums=[3,2,3,1,2,4,5,5,6], k=4', expected: '4' },
            { id: 'tc3', description: 'Find max (K=1)', input: 'nums=[10, 9, 99, 33], k=1', expected: '99' },
            { id: 'tc4', description: 'Find min (K=N)', input: 'nums=[5, 1, 3], k=3', expected: '1' },
            { id: 'tc5', description: 'All same numbers', input: 'nums=[2,2,2,2], k=2', expected: '2' },
        ],
    };

export default challenge;
