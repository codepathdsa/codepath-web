import type { Challenge } from '../types';

// ─── ENG-DSA-011 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-011',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Ledger Reconciliation (Two Pointers)',
        companies: ['Stripe', 'Square'],
        timeEst: '~20 min',
        level: 'Junior',
        status: 'Not Started',
        topics: ['Two Pointers', 'Arrays', 'Math'],
        nextChallengeId: 'ENG-DSA-012',
        realWorldContext: `Square's finance team runs a nightly reconciliation job to match transaction amounts across their ledger. They have a sorted array of transaction amounts and need to find if any two amounts sum to the day's target discrepancy. The naive O(n²) approach would take hours on large ledgers.`,
        desc: 'Finance is running a daily reconciliation job. We have a sorted array of transaction amounts. Find if there are two distinct transactions that sum exactly to our daily target discrepancy. Return their indices.',
        whyItMatters: `Two Pointers is one of the most versatile interview techniques. The "sorted array + two-sum" pattern shows up in 3Sum, 4Sum, container with most water, and dozens of geometry problems. Once sorted, you can search the entire solution space in a single O(n) pass by cleverly moving two boundary pointers.`,
        approach: `Because the array is sorted, the Two Pointers technique eliminates the need for a Hash Map. Place one pointer at the smallest value (left) and one at the largest (right). If their sum is too small, move left up to increase it. If too large, move right down to decrease it. This covers all possible pairs in O(n) with O(1) space.`,
        solution: 'Because the array is already sorted, use the Two Pointers technique. Place one pointer at the start and one at the end. If their sum is greater than the target, decrement the right pointer. If less, increment the left. Runs in O(n) time and O(1) space.',
        walkthrough: [
            "transactions=[10, 20, 30, 40, 50], target=70",
            "left=0(10), right=4(50): sum=60 < 70. Move left up.",
            "left=1(20), right=4(50): sum=70 == 70. Found! Return[1, 4]"
        ],
        hints: [
            'Since the array is sorted, you do not need an O(n) space Hash Map to solve this.',
            'What happens to the total sum if you move the rightmost pointer one step to the left?',
            'Initialize left = 0, right = len(nums) - 1. Loop while left < right. Adjust pointers based on how the sum compares to the target.'
        ],
        complexity: { time: 'O(n)', space: 'O(1)' },
        starterCode: `def find_reconciliation_pair(transactions: list[int], target: int) -> list[int]:
    """
    transactions: sorted list of integers
    target: the discrepancy amount we are looking for
    Returns [index1, index2] of the two transactions, or[] if none exist.
    
    Example: [10, 20, 30, 40, 50], target=70 → [1, 4] (20+50=70)
    """
    left = 0
    right = len(transactions) - 1
    
    while left < right:
        current_sum = transactions[left] + transactions[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1   # Need bigger sum, move left pointer right
        else:
            right -= 1  # Need smaller sum, move right pointer left
            
    return []
`,
        testCases: [
            { id: 'tc1', description: 'Basic match', input: 'transactions=[10, 20, 30, 40, 50], target=70', expected: '[1, 4] (20+50) or [2,3] (30+40)' },
            { id: 'tc2', description: 'No match', input: 'transactions=[5, 10, 15, 20], target=100', expected: '[]' },
            { id: 'tc3', description: 'Negative values in ledger', input: 'transactions=[-50, -10, 20, 40], target=-30', expected: '[0, 2]' },
            { id: 'tc4', description: 'Adjacent numbers', input: 'transactions=[1, 2, 3, 4, 5], target=3', expected: '[0, 1]' },
            { id: 'tc5', description: 'Empty array', input: 'transactions=[], target=10', expected: '[]' },
        ],
    };

export default challenge;
