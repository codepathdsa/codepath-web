import type { Challenge } from '../types';

// ─── ENG-DSA-061 ─────────────────────────────────────────────────────────────────
// To edit this challenge, just modify the object below.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
        id: 'ENG-DSA-061',
        type: 'DSA',
        badgeClass: 'badge-dsa',
        title: 'Cross-Sell Recommendation Scoring (Prefix/Suffix Arrays)',
        companies: ['Amazon', 'Instacart'],
        timeEst: '~30 min',
        level: 'Mid',
        status: 'Not Started',
        topics: ['Arrays', 'Math', 'Prefix Sum'],
        nextChallengeId: 'ENG-DSA-062',
        realWorldContext: `In e-commerce recommendation models like Naive Bayes, calculating the combined probability of "all other items EXCEPT this one" is required to find conditional independence. If the array contains probability scores, division is mathematically risky due to floating point zeroes. We need to compute the product of all elements except 'i' without using division.`,
        desc: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(N) time and without using the division operation.',
        whyItMatters: `Product of Array Except Self is a genius application of Prefix and Suffix arrays. By separating "everything to the left" and "everything to the right" into two passes, you replace an O(N^2) double-loop with O(N) linear time. Eliminating the division operator handles the dreaded "array contains zero" edge case perfectly.`,
        approach: `Create an output array. First pass (Left to Right): Store the running product of all elements to the LEFT of i. (For i=0, this is 1). Second pass (Right to Left): Keep a running variable of the product of all elements to the RIGHT of i. Multiply the output array at index i by this running right product.`,
        solution: 'Two passes. First pass builds prefixes: output[i] = product of all elements to the left. Second pass multiplies suffixes: multiply output[i] by running product of all elements to the right.',
        walkthrough: [
            "nums = [1, 2, 3, 4]",
            "Left Pass: out=[1, 1*1=1, 1*2=2, 2*3=6] ->[1, 1, 2, 6]",
            "Right Pass (starts at end, running_right=1):",
            "i=3: out[3]=6*1=6. running_right = 1*4=4",
            "i=2: out[2]=2*4=8. running_right = 4*3=12",
            "i=1: out[1]=1*12=12. running_right = 12*2=24",
            "i=0: out[0]=1*24=24.",
            "Final output = [24, 12, 8, 6] ✓"
        ],
        hints: [
            'You cannot use division. What if you just precalculate the product of everything to the left of index i, and everything to the right?',
            'You can do this in two O(N) sweeps. Sweep left-to-right, then right-to-left.',
            'To save space, you can store the left products directly in your output array, and compute the right products on the fly using a single variable.'
        ],
        complexity: { time: 'O(N)', space: 'O(1) excluding output array' },
        starterCode: `def product_except_self(nums: list[int]) -> list[int]:
    """
    Returns an array where answer[i] is the product of all elements except nums[i].
    Must not use division and must run in O(N).
    """
    n = len(nums)
    output = [1] * n
    
    # Pass 1: Calculate left products
    left_product = 1
    for i in range(n):
        output[i] = left_product
        left_product *= nums[i]
        
    # Pass 2: Calculate right products and multiply with left products
    right_product = 1
    for i in range(n - 1, -1, -1):
        output[i] *= right_product
        right_product *= nums[i]
        
    return output
`,
        testCases: [
            { id: 'tc1', description: 'Standard array', input: 'nums=[1, 2, 3, 4]', expected: '[24, 12, 8, 6]' },
            { id: 'tc2', description: 'Contains one zero', input: 'nums=[-1, 1, 0, -3, 3]', expected: '[0, 0, 9, 0, 0]' },
            { id: 'tc3', description: 'Contains multiple zeros', input: 'nums=[0, 4, 0]', expected: '[0, 0, 0]' },
            { id: 'tc4', description: 'Two elements', input: 'nums=[5, 9]', expected: '[9, 5]' },
            { id: 'tc5', description: 'All negatives', input: 'nums=[-2, -3, -4]', expected: '[12, 8, 6]' },
        ],
    };

export default challenge;
