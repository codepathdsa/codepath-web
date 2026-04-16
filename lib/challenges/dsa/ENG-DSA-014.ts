import type { Challenge } from '../types';

// ─── ENG-DSA-014 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-014',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Peak Error Rate (Sliding Window)',
        companies: ['Datadog', 'New Relic'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Sliding Window', 'Arrays'],
        nextChallengeId: 'ENG-DSA-015',
        realWorldContext: `New Relic's alerting system needs to identify the worst K-minute window in a server's error log to determine the severity of an incident. The SRE team uses this to set alert thresholds. A naïve O(n*k) approach recalculates the sum from scratch for each window — the sliding window technique reuses previous calculations for O(n).`,
        desc: 'You have an array representing the number of HTTP 500 errors logged per minute. Find the continuous K-minute window that had the highest total number of errors, and return that maximum sum.',
        whyItMatters: `The Fixed Sliding Window is the first optimization technique every engineer should learn. It converts O(n*k) "recalculate from scratch" algorithms into O(n) "update the delta" algorithms. This pattern appears in: moving averages, string substring problems, and any time you compute a metric over a fixed-size window of data.`,
        approach: `Instead of summing K elements for every starting position (O(n*k)), note that adjacent windows overlap in K-1 elements. Moving the window right by one position: you lose the leftmost element and gain a new rightmost element. So: new_sum = old_sum - errors[i-k] + errors[i]. This is the core insight of the sliding window technique.`,
        solution: 'Use a Fixed Sliding Window. Calculate the sum of the first K elements. Then, slide the window by 1: add the new element entering the window and subtract the old element leaving the window. Keep track of the max sum. O(n) time.',
        walkthrough: [
            "errors=[2, 1, 5, 1, 3, 2], k=3",
            "Initial window: sum([2,1,5])=8. max_sum=8",
            "Slide right: +errors[3]=1, -errors[0]=2. sum=8-2+1=7. max=8",
            "Slide right: +errors[4]=3, -errors[1]=1. sum=7-1+3=9. max=9",
            "Slide right: +errors[5]=2, -errors[2]=5. sum=9-5+2=6. max=9",
            "Answer: 9 (window [5,1,3]) ✓"
        ],
        hints: [
            'Recalculating the sum of K elements from scratch for every minute takes O(n * k) time. Avoid this.',
            'When the window shifts from[index 0 to 4] to [index 1 to 5], the only things that change are: you lose index 0 and gain index 5.',
            'current_sum = current_sum - errors[i - k] + errors[i]. Update max_sum on every step.'
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def max_error_window(errors: list[int], k: int) -> int:
    """
    errors: array of error counts per minute
    k: size of the time window
    Returns the maximum sum of errors in any continuous k-minute window.
    
    Example: errors=[2, 1, 5, 1, 3, 2], k=3 → 9 (window [5,1,3])
    """
    if not errors or k <= 0 or k > len(errors):
        return 0
        
    # Calculate initial window [0..k-1]
    current_sum = sum(errors[:k])
    max_sum = current_sum
    
    # Slide window: add right element, remove left element
    for i in range(k, len(errors)):
        current_sum = current_sum - errors[i - k] + errors[i]
        max_sum = max(max_sum, current_sum)
        
    return max_sum
`,
        testCases: [
            { id: 'tc1', description: 'Normal array', input: 'errors=[2, 1, 5, 1, 3, 2], k=3', expected: '9 (from 5,1,3)' },
            { id: 'tc2', description: 'K equals array length', input: 'errors=[1, 2, 3], k=3', expected: '6' },
            { id: 'tc3', description: 'Decreasing errors', input: 'errors=[100, 50, 10, 5, 1], k=2', expected: '150 (from 100,50)' },
            { id: 'tc4', description: 'Zero errors', input: 'errors=[0, 0, 0, 0], k=2', expected: '0' },
            { id: 'tc5', description: 'Spike at the end', input: 'errors=[1, 1, 1, 1, 100], k=2', expected: '101' },
        ],
    };

export default challenge;
