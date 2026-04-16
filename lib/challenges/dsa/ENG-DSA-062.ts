import type { Challenge } from '../types';

// ─── ENG-DSA-062 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-062',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Distributed Shard Lookup (Binary Search)',
        companies: ['Netflix', 'DataStax'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Binary Search', 'Arrays'],
        nextChallengeId: 'ENG-DSA-063',
        realWorldContext: `Distributed databases like Cassandra use Consistent Hashing rings. When nodes are added or fail, the sorted array of shard IDs is mathematically "rotated". To route a query to the primary shard (the minimum ID in the ring), we must find the start of this rotated sorted array in O(log N) time.`,
        desc: 'Suppose an array of unique integers sorted in ascending order is rotated at an unknown pivot index. Given this rotated sorted array `nums`, return the minimum element in O(log N) time.',
        whyItMatters: `Find Minimum in Rotated Sorted Array bridges standard Binary Search with array discontinuity. It tests your ability to identify the "sorted half" versus the "unsorted half" of an array purely by comparing \`mid\` to \`right\`.`,
        approach: `In a rotated sorted array, the minimum element is the only element that is smaller than its previous element. Using Binary Search: compare \`mid\` with \`right\`. If \`nums[mid] > nums[right]\`, the minimum MUST be to the right of mid (because the right side is unordered). If \`nums[mid] <= nums[right]\`, the minimum is at mid or to the left. Shrink the window until left == right.`,
        solution: 'Binary Search. Compare `nums[mid]` to `nums[right]`. If mid is greater, `left = mid + 1`. Else, `right = mid`. Loop until `left == right`.',
        walkthrough: [
            "nums =[4, 5, 6, 7, 0, 1, 2]",
            "left=0 (4), right=6 (2). mid=3 (7).",
            "nums[mid]=7 > nums[right]=2. The rotation happened to the right. left = mid+1 = 4.",
            "left=4 (0), right=6 (2). mid=5 (1).",
            "nums[mid]=1 <= nums[right]=2. The right side is strictly sorted. Minimum is mid or left. right = mid = 5.",
            "left=4 (0), right=5 (1). mid=4 (0).",
            "nums[mid]=0 <= nums[right]=1. right = mid = 4.",
            "left==right==4. Minimum is nums[4] = 0. ✓"
        ],
        hints: [
            'Because the array is rotated, one half of the array will always be strictly increasing, and the other half will contain the "drop-off".',
            'Compare `nums[mid]` to `nums[right]`.',
            'If `nums[mid] > nums[right]`, the smallest value must be to the right of `mid`. Otherwise, it is at `mid` or to the left.'
        ],
        complexity: { time: 'O(log N)', space: 'O(1)' },
        starterCode: `def find_min_in_rotated(nums: list[int]) -> int:
    """
    Returns the minimum element in a rotated sorted array in O(log n) time.
    """
    left = 0
    right = len(nums) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        # If mid element is greater than the rightmost element,
        # the drop-off (minimum) must be to the right
        if nums[mid] > nums[right]:
            left = mid + 1
        # Otherwise, the right side is sorted, meaning the 
        # minimum is at mid or to the left of mid.
        else:
            right = mid
            
    # When left == right, we've found the minimum
    return nums[left]
`,
        testCases: [
            { id: 'tc1', description: 'Rotated middle', input: 'nums=[4, 5, 6, 7, 0, 1, 2]', expected: '0' },
            { id: 'tc2', description: 'Rotated by 1', input: 'nums=[3, 1, 2]', expected: '1' },
            { id: 'tc3', description: 'Not actually rotated', input: 'nums=[11, 13, 15, 17]', expected: '11' },
            { id: 'tc4', description: 'Two elements', input: 'nums=[2, 1]', expected: '1' },
            { id: 'tc5', description: 'Rotated near end', input: 'nums=[5, 1, 2, 3, 4]', expected: '1' },
        ],
    };

export default challenge;
